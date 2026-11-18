// Funkcjonalnosc gry


// Main game function

function gameLoop(timestamp){
    let dt = timestamp - lastTime;
    lastTime = timestamp;

    update(dt);
    draw();

    requestAnimationFrame(gameLoop);
}

function update(dt){
    let scores=getTopScores();
    let bestScore=scores[0] !== undefined ? scores[0] : 0;

    if(activePerks.noCollisionTimeLeft>0){
        activePerks.noCollisionTimeLeft-=dt/1000;
        if(activePerks.noCollisionTimeLeft<=0){
            activePerks.noCollisionTimeLeft=0;
        }
    }

    if(activePerks.fastForwardTimeLeft>0){
        activePerks.fastForwardTimeLeft-=dt/1000;
        if(activePerks.fastForwardTimeLeft<=0){
            activePerks.fastForwardTimeLeft=0;
        }
    } 

    bird.passThrough=(activePerks.noCollisionTimeLeft>0 || activePerks.fastForwardTimeLeft>0);

    if(gameState==='FALLING'){
        bird.vy+=bird.gravity;
        bird.y+=bird.vy;
        bird.rotation=Math.PI/2;

        if(bird.y+24>=canvas.height - 112){
            bird.y=canvas.height-112-24;
            gameState='GAMEOVER';
            music.die.play();
            messageBox.innerHTML = `
                <section class="messageSection">
                    <img src="assets/UI/gameover.png">
                    <p style="font-size: 30px; text-shadow: 3px 3px 3px black;">Top score: <b>${bestScore!== undefined ? bestScore : 0}</b></p>
                    <p style="font-size: 25px; text-shadow: 3px 3px 3px black;">Score: <b>${currentScore}</b></p>
                    <button id="restartGameBtn" onclick="restartGame()">Try again</button>
                </section>`;
        }
        return;
    }
    if(gameState!=='PLAYING') return;

    updatePhysics();
    updateAnimation();

    if(bird.y + 24 >=canvas.height - 112){
        bird.y = canvas.height-112-24;
        gameState='GAMEOVER';
        music.hit.play();
        saveScore(currentScore);
        if(activePerks.noCollisionTimeLeft>0 || activePerks.fastForwardTimeLeft>0){
            activePerks.noCollisionTimeLeft=0;
            activePerks.fastForwardTimeLeft=0;
        }

        messageBox.innerHTML = `
                <section class="messageSection">
                    <img src="assets/UI/gameover.png">
                    <p style="font-size: 30px; text-shadow: 3px 3px 3px black;">Top score: <b>${bestScore!== undefined ? bestScore : 0}</b></p>
                    <p style="font-size: 25px; text-shadow: 3px 3px 3px black;">Score: <b>${currentScore}</b></p>
                    <button id="restartGameBtn" onclick="restartGame()">Try again</button>
                </section>`;
    }

    let currentPipeSpeed = (activePerks.fastForwardTimeLeft>0) ? 9 : 3;
    pipes.forEach(pipe => {
        pipe.x -= currentPipeSpeed;
    });

    pipes=pipes.filter(pipe => pipe.x+pipeWidth>0);
    let nextPipeInterval=150;
    frameCounter++;
    if(frameCounter >= nextPipeInterval){
        spawnPipe();
        frameCounter=0;
        nextPipeInterval=Math.floor(Math.random() * (200-150+1) + 150);
    }
    pipes.forEach(pipe =>{
        let topPipeHitbox= {x: pipe.x, y: 0, width: pipeWidth, height: pipe.top};
        let bottomPipeY = canvas.height - pipe.bottom;
        let bottomPipeHitbox={x: pipe.x, y: bottomPipeY, width: pipeWidth, height: pipe.bottom};
        let birdHitbox= {x: bird.x, y: bird.y, width: 34, height: 24};

        if(pipe.perk && !pipe.perk.collected){
            let perkX = pipe.x + pipeWidth / 2 - 20;
            let perkY = pipe.top + pipeGap / 2 - 20;
            let perkHitbox={x: perkX, y: perkY, width: 40, height: 40};

            if(checkCollision(birdHitbox,perkHitbox)){
                pipe.perk.collected=true;
                music.point.play();

                if(pipe.perk.type==='noCollision'){
                    activePerks.noCollisionTimeLeft=pipe.perk.duration;
                } else if(pipe.perk.type==='fastForward'){
                    activePerks.fastForwardTimeLeft=pipe.perk.duration;
                    nextPipeInterval+=120;
                } else if(pipe.perk.type==='superScore'){
                    currentScore+=10;

                    if(messageTimeout) {
                        clearTimeout(messageTimeout);
                    }

                    messageBox.innerHTML=`
                        <section class="messageSection">
                            <p style="font-size: 30px; text-shadow: 3px 3px 3px black;">POINT BOOST GATHERED!</p>
                            <p style="font-size: 30px; text-shadow: 3px 3px 3px black;">+<b>10</b> POINTS</p>
                        </section>`;
                    
                        messageTimeout = setTimeout(() => {
                            messageBox.innerHTML='';
                            messageTimeout=null;
                        },2000);
                }
            }
        }

        if(checkBirdCollision(birdHitbox,topPipeHitbox) || checkBirdCollision(birdHitbox,bottomPipeHitbox)){
            gameState='FALLING';
            music.hit.play();
            saveScore(currentScore);
        }
        else {
            if(!pipe.passed && pipe.x + pipeWidth/2<= bird.x){
                pipe.passed=true;
                music.point.play();
                currentScore++;

                if(bestScore!==undefined && bestScore>0 && currentScore > bestScore && !hasBeatenRecord){
                    hasBeatenRecord=true;
                    isSpinning=true;
                    spinFramesLeft=40;

                    if(messageTimeout){
                        clearTimeout(messageTimeout);
                    }

                    messageBox.innerHTML = `
                        <section class="messageSection">
                            <p style="font-size: 30px; text-shadow: 3px 3px 3px black;">BEST RECORD BROKEN!</p>
                            <p style="font-size: 30px; text-shadow: 3px 3px 3px black;">Top score: <b>${bestScore!== undefined ? bestScore : 0}</b></p>
                        </section>`;
                    
                    messageTimeout = setTimeout(() => {
                        messageBox.innerHTML='';
                        messageTimeout=null;
                    }, 3000);
                }
            }
        }
    })
}

// Score functions

function saveScore(newScore){
    let scores = JSON.parse(localStorage.getItem('Scores')) || [];
    scores.push(newScore);
    scores.sort((a,b) => b-a);
    scores=scores.slice(0,5);
    localStorage.setItem('Scores', JSON.stringify(scores));
}

function getTopScores() {
    return JSON.parse(localStorage.getItem('Scores')) || [];
}


// Gameplay functions

function updatePhysics(){
    if(isSpinning) {
        bird.rotation+=(Math.PI * 2) / 40;
        spinFramesLeft--;

        if(spinFramesLeft<=0){
            isSpinning=false;
        }
    }
    bird.vy+=bird.gravity;
    bird.y+=bird.vy;
    bird.rotation=Math.min(Math.PI / 4, Math.max(-Math.PI / 6, bird.vy * 0.05));
}

function drawBird(ctx){
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(bird.rotation);
    let currentBirdImg = birdFrames[currentFrame];
    ctx.drawImage(currentBirdImg, -17, -12, 34, 24);

    ctx.restore();
}

function spawnPipe() {
    let minHeight = 50;
    let groundHeight = 112;
    let minBottomHeight=30;
    let maxHeight = canvas.height - groundHeight - pipeGap - minBottomHeight;
    let topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

    let perk = null;
    let rand=Math.random();
    let currentSum = 0;

    // Sprawdzamy perki na podstawie ich dokładnych wartości 'chance' z obiektów:
    currentSum += superScorePerk.chance; // 0.05 (5% szans)
    if (rand < currentSum) {
        perk = { type: 'superScore', ...superScorePerk, collected: false };
    } else {
        currentSum += noCollisionPerk.chance; // 0.05 + 0.15 = 0.20 (15% szans)
        if (rand < currentSum) {
            perk = { type: 'noCollision', ...noCollisionPerk, collected: false };
        } else {
            currentSum += fastForwardPerk.chance; // 0.20 + 0.30 = 0.50 (30% szans)
            if (rand < currentSum) {
                perk = { type: 'fastForward', ...fastForwardPerk, collected: false };
            }
        }
    }

    pipes.push({
        x: canvas.width,
        top: topHeight,
        bottom: canvas.height - topHeight - pipeGap,
        passed: false,
        perk: perk
    });
}

function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

function checkBirdCollision(rect1, rect2){
    return !bird.passThrough && checkCollision(rect1,rect2);
}

function restartGame(){
    gameState='PLAYING';
    currentScore=0;
    pipes=[];
    frameCounter=0;
    nextPipeInterval=150;
    bird.x=250;
    bird.y=150;
    bird.vy=0;
    bird.rotation=0;    
    activePerks.noCollisionTimeLeft=0;
    activePerks.fastForwardTimeLeft=0;
    messageBox.innerHTML='';
}

// Audio-visual functions

function playMusic() {
    bgMusic.play().catch(error => {
        console.log("Music error");
    })
}

function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    pipes.forEach(pipe => {
        ctx.save();
        ctx.translate(pipe.x, pipe.top);
        ctx.scale(1,-1);
        ctx.drawImage(pipeImage,0,0,pipeWidth,pipe.top);
        ctx.restore();

        let bottomPipeY = canvas.height-pipe.bottom;
        ctx.drawImage(pipeImage,pipe.x,bottomPipeY,pipeWidth,pipe.bottom);

        if(pipe.perk && !pipe.perk.collected){
            let perkX = pipe.x + pipeWidth / 2 - 20;
            let perkY = pipe.top + pipeGap / 2 - 20;
            let img = pipe.perk.perkImg;
            if(img && img.complete && img.naturalWidth!==0){
                ctx.drawImage(pipe.perk.perkImg, perkX, perkY, 40, 40);
            }
        }
    })

    drawBird(ctx);
    drawScore(ctx,currentScore,canvas.width);

    let timerY=80;
    if(activePerks.noCollisionTimeLeft > 0){
        ctx.fillStyle='#0066ff';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(`Immortality Perk Duration: ${activePerks.noCollisionTimeLeft.toFixed(1)}s`, 40, timerY);
        timerY+=30;
    }
    if(activePerks.fastForwardTimeLeft > 0){
        ctx.fillStyle='#0066ff';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(`Fast Forward Duration: ${activePerks.fastForwardTimeLeft.toFixed(1)}s`, 40, timerY);
    }

    if(gameState==='START'){
        messageBox.innerHTML=`<img src="assets/UI/message.png">`;
    }
}

function drawScore(ctx,score,canvasWidth){
    let scoreStr=score.toString();
    let digitWidth=24;
    let digitHeight=36;
    let spacing=2;

    let totalWidth = scoreStr.length*digitWidth+(scoreStr.length-1)*spacing;
    let startX=canvasWidth-totalWidth-40;
    let startY=40;

    for(let i=0; i<scoreStr.length; i++){
        let digitValue=parseInt(scoreStr[i]);
        ctx.drawImage(scoreNumbers[digitValue],startX,startY,digitWidth,digitHeight);
        startX+=digitWidth+spacing;
    }
}

function updateAnimation(){
    if (bird.vy<0){
        currentFrame=0;
    } else {
        animCounter++;
        if (animCounter%8===0){
            currentFrame=(currentFrame+1)%birdFrames.length;
        }
    }
}

// Wlasciwosci obiektow

let lastTime = 0;

// Wlasciwosci bird
let bird= {
    x: 250,
    y: 150,
    vy: 0,
    gravity: 0.35,
    lift: -10,
    rotation: 0,
    passThrough: false
};

let birdImgs = {
    midflap: new Image(),
    downflap: new Image(),
    upflap: new Image()
};
birdImgs.midflap.src='assets/Flappy Bird/yellowbird-midflap.png';
birdImgs.downflap.src='assets/Flappy Bird/yellowbird-downflap.png';
birdImgs.upflap.src='assets/Flappy Bird/yellowbird-upflap.png';

let birdFrames = [
    birdImgs.upflap,
    birdImgs.midflap,
    birdImgs.downflap,
    birdImgs.midflap
];
let currentFrame=0;
let animCounter=0;

// Wlasciwosci pipe 

let pipes=[];
let pipeWidth = 150;
let pipeGap = 250;
let pipeImage = new Image();
pipeImage.src='assets/Flappy Bird/pipe-green.png';

// Wlasciwosci perkow

let noCollisionPerk= {
    duration: 5,
    chance: 0.075,
    perkImg: new Image()
};

let fastForwardPerk= {
    duration: 1,
    chance: 0.025,
    perkImg: new Image()
};

let superScorePerk = {
    duration: 0,
    chance: 0.015,
    perkImg: new Image()
};

noCollisionPerk.perkImg.src="assets/Perks/noCollisionPerk.png" 
fastForwardPerk.perkImg.src="assets/Perks/fastForwardPerk.png" 
superScorePerk.perkImg.src="assets/Perks/superScorePerk.png" 

let activePerks = {
    noCollisionTimeLeft: 0,
    fastForwardTimeLeft: 0
};

// Wlasciwosci reszty

let music = {
    die: new Audio('assets/Sound Efects/die.wav'),
    hit: new Audio('assets/Sound Efects/hit.wav'),
    point: new Audio('assets/Sound Efects/point.wav'),
    swoosh: new Audio('assets/Sound Efects/swoosh.wav'),
    wing: new Audio('assets/Sound Efects/wing.wav')
};

let scoreNumbers=[];
for (let i =0; i<=9; i++){
    let img = new Image();
    img.src=`assets/UI/Numbers/${i}.png`;
    scoreNumbers.push(img);
}

// GRA
const canvas = document.getElementById('gameCanvas');
canvas.width=window.innerWidth;
canvas.height=window.innerHeight;
const ctx = canvas.getContext('2d');
const messageBox=document.getElementById('messages');
const restartBtn=document.getElementById("playAgainBtn");
let gameState = 'START'; // START, PLAYING, FALLING, GAMEOVER
let currentScore=0;
let frameCounter=0;
let hasBeatenRecord=false;
let isSpinning=false;
let spinFramesLeft=0;
let messageTimeout=null;

requestAnimationFrame(gameLoop)
window.addEventListener('keydown', (e) => {
    if (e.code==='Space'){
        if(gameState==='START'){
            gameState='PLAYING';
            messageBox.innerHTML = '';
        } else if (gameState === 'PLAYING'){ 
            bird.vy=bird.lift;
            music.wing.play();
        } else if (gameState === 'GAMEOVER') {
            restartGame();
        } 
    }
});
