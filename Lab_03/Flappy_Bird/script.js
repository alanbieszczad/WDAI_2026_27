// Funkcjonalnosc gry

// Responsywnosc gry

const BASE_BIRD_WIDTH = 34;
const BASE_BIRD_HEIGHT = 24;
const BASE_PERK_SIZE = 40;
const BASE_PIPE_WIDTH = 150;
const BASE_PIPE_GAP = 250;
const BASE_GROUND_HEIGHT = 112;

function getScale(){
    if(!canvas || !canvas.height) return 1;
    let s = canvas.height / 700;
    return Math.max(0.65,Math.min(1.45,s));
}

function getBirdSize(){
    let s = getScale();
    return {
        width: Math.round(BASE_BIRD_WIDTH*s),
        height: Math.round(BASE_BIRD_HEIGHT*s)
    };
}

function getPerkSize(){
    let s = getScale();
    return Math.round(BASE_PERK_SIZE*s);
}

function getCurrentPipeWidth() {
    if(!canvas || !canvas.width) return BASE_PIPE_WIDTH;
    let widthByScreen = canvas.width * 0.11;
    return Math.max(65,Math.min(165,Math.round(widthByScreen)));
}

function getCurrentPipeGap(){
    let s = getScale();
    let gap = Math.round(BASE_PIPE_GAP*s);
    if (canvas && canvas.width < 600){
        gap=Math.round(gap*0.78);
    }
    return Math.max(135,gap);
}

function getGroundHeight() {
    if(!canvas || !canvas.height) return BASE_GROUND_HEIGHT;
    return Math.max(76,Math.min(112,Math.round(BASE_GROUND_HEIGHT * Math.min(1,canvas.height/700))));
}

function getGroundTopY() {
    return canvas.height-getGroundHeight();
}

function syncLayoutOnResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let targetX = Math.min(250,Math.max(60,Math.round(canvas.width*0.2)));
    bird.x=targetX;

    let groundH=getGroundHeight;
    let birdH=getBirdSize().height;
    if(bird.y+birdH>=canvas.height-groundH){
        bird.y=canvas.height-groundH-birdH;
    }
}

// Main game functions

function gameLoop(timestamp){
    if(!lastTime) lastTime=timestamp;
    let dt = Math.min(50,Math.max(0,timestamp-lastTime));
    lastTime=timestamp;

    update(dt);
    draw();

    requestAnimationFrame(gameLoop);
}

function update(dt){
    let scores=getTopScores();
    let bestScore=scores[0] !== undefined ? scores[0] : 0;
    let birdSize=getBirdSize();
    let groundTopY=getGroundTopY();
    let pipeW=getCurrentPipeWidth();
    let pipeG=getCurrentPipeGap();
    let perkSize=getPerkSize();
    let s = getScale();
    let dtSec = dt / 1000;

    if(activePerks.noCollisionTimeLeft>0){
        activePerks.noCollisionTimeLeft-=dtSec;
        if(activePerks.noCollisionTimeLeft<=0){
            activePerks.noCollisionTimeLeft=0;
        }
    }

    if(activePerks.fastForwardTimeLeft>0){
        activePerks.fastForwardTimeLeft-=dtSec;
        if(activePerks.fastForwardTimeLeft<=0){
            activePerks.fastForwardTimeLeft=0;
        }
    } 

    bird.passThrough=(activePerks.noCollisionTimeLeft>0 || activePerks.fastForwardTimeLeft>0);

    if(gameState==='FALLING'){
        bird.vy+=bird.gravity*s;
        bird.y+=bird.vy;
        bird.rotation=Math.PI/2;

        if(bird.y+birdSize.height / 2 >= groundTopY){
            bird.y=groundTopY-birdSize.height / 2;
            gameState='GAMEOVER';
            music.die.play();
            messageBox.innerHTML = `
                <section class="messageSection">
                    <img src="assets/UI/gameover.png">
                    <p style="font-size: 30px; text-shadow: 3px 3px 3px black;">Top score: <b>${bestScore!== undefined ? bestScore : 0}</b></p>
                    <p style="font-size: 25px; text-shadow: 3px 3px 3px black;">Score: <b>${currentScore}</b></p>
                    <button id="restartGameBtn" onclick="restartGame()">Try again</button>
                     <p style="margin-top: 1; margin-bottom: -15px;">(or click / press Space)</p>
                </section>`;
        }
        return;
    }
    if(gameState!=='PLAYING') return;

    updatePhysics(dt);
    updateAnimation();

    if(bird.y + birdSize.height / 2 >= groundTopY){
        bird.y = groundTopY - birdSize.height / 2;
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
                    <p style="margin-top: 1; margin-bottom: -15px;">(or click / press Space)</p>
                </section>`;
    }

    let widthFactor=Math.max(0.8,Math.min(1.35,canvas.width/1200));
    let baseSpeedPxPerSec=((activePerks.fastForwardTimeLeft>0) ? 630 : 210) * widthFactor;
    pipes.forEach(pipe => {
        pipe.x -= baseSpeedPxPerSec*dtSec;
    });

    pipes=pipes.filter(pipe => pipe.x+pipeW>0);

    frameCounter++;
    if(frameCounter >= nextPipeInterval){
        spawnPipe();
        frameCounter=0;
        nextPipeInterval=Math.floor(Math.random() * (150-75+1) + 75);
    }
    pipes.forEach(pipe =>{
        let bottomPipeY = pipe.top+pipeG;
        let bottomPipeHeight = Math.max(0,groundTopY-bottomPipeY);

        let topPipeHitbox = {x: pipe.x, y: 0, width: pipeW, height: pipe.top};
        let bottomPipeHitbox = {x: pipe.x, y: bottomPipeY, width: pipeW, height: bottomPipeHeight};
        let birdHitbox = {x: bird.x - birdSize.width / 2, y: bird.y-birdSize.height / 2, width: birdSize.width, height: birdSize.height};

        if(pipe.perk && !pipe.perk.collected){
            let perkX = pipe.x + pipeW / 2 - perkSize / 2;
            let perkY = pipe.top + pipeG / 2 - perkSize / 2;
            let perkHitbox={x: perkX, y: perkY, width: perkSize, height: perkSize};

            if(checkCollision(birdHitbox,perkHitbox)){
                pipe.perk.collected=true;
                music.point.play();

                if(pipe.perk.type==='noCollision'){
                    activePerks.noCollisionTimeLeft=pipe.perk.duration;
                } else if(pipe.perk.type==='fastForward'){
                    activePerks.fastForwardTimeLeft=pipe.perk.duration;
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
            if(!pipe.passed && pipe.x + pipeW/2<= bird.x){
                pipe.passed=true;
                music.point.play();
                currentScore++;

                if(bestScore!==undefined && bestScore>0 && currentScore > bestScore && !hasBeatenRecord){
                    hasBeatenRecord=true;
                    isSpinning=true;
                    spinTimeLeft=3.0;

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

function updatePhysics(dt){
    let s = getScale();
    let dtSec = dt / 1000;
    if(isSpinning && spinTimeLeft > 0) {
        spinTimeLeft-=dtSec;
        bird.rotation+=((Math.PI * 4) / 3.0) * dtSec;

        if(spinTimeLeft<=0){
            isSpinning=false;
            spinTimeLeft=0;
            bird.rotation=0;
        } 
    } else {
            bird.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 6, bird.vy * 0.05));
        }
    bird.vy+=bird.gravity * s;
    bird.y+=bird.vy;
}

function spawnPipe() {
    let groundTopY = getGroundTopY();
    let pipeG = getCurrentPipeGap();
    let s = getScale();
    let minHeight = Math.max(30,Math.round(50*s));
    let minBottomHeight = Math.max(20,Math.round(30*s));
    let maxHeight = Math.max(minHeight+10, groundTopY - pipeG- minBottomHeight);
    let topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

    let perk = null;
    let rand=Math.random();
    let currentSum = 0;

    currentSum += superScorePerk.chance; // (5% szans)
    if (rand < currentSum) {
        perk = { type: 'superScore', ...superScorePerk, collected: false };
    } else {
        currentSum += noCollisionPerk.chance; // (15% szans)
        if (rand < currentSum) {
            perk = { type: 'noCollision', ...noCollisionPerk, collected: false };
        } else {
            currentSum += fastForwardPerk.chance; // (30% szans)
            if (rand < currentSum) {
                perk = { type: 'fastForward', ...fastForwardPerk, collected: false };
            }
        }
    }

    pipes.push({
        x: canvas.width,
        top: topHeight,
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
    gameState = 'PLAYING';
    currentScore = 0;
    pipes = [];
    frameCounter = 0;
    nextPipeInterval = 150;
    bird.x = Math.min(250,Math.max(50,Math.round(canvas.width*0.2)));
    bird.y = Math.round(getGroundTopY() * 0.25);
    bird.vy=0;
    bird.rotation=0;    
    hasBeatenRecord = false
    isSpinning = false;
    spinFramesLeft = 0;
    spinTimeLeft=0;
    activePerks.noCollisionTimeLeft = 0;
    activePerks.fastForwardTimeLeft = 0;
    if(messageTimeout) {
        clearTimeout(messageTimeout);
        messageTimeout = null;
    }
    messageBox.innerHTML = '';
}

// Audio-visual functions

function playMusic() {
    bgMusic.play().catch(error => {
        console.log("Music error");
    })
}

function drawBird(ctx){
    let birdSize=getBirdSize();
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(bird.rotation);
    let currentBirdImg = birdFrames[currentFrame];
    if(currentBirdImg && currentBirdImg.complete && currentBirdImg.naturalWidth !==0){
        ctx.drawImage(currentBirdImg, -birdSize.width / 2, -birdSize.height / 2, birdSize.width, birdSize.height);
    }

    ctx.restore();
}

function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    let pipeW = getCurrentPipeWidth();
    let pipeG = getCurrentPipeGap();
    let perkSize = getPerkSize();
    let groundTopY = getGroundTopY();
    let s = getScale();

    pipes.forEach(pipe => {
        if(pipeImage && pipeImage.complete && pipeImage.naturalWidth!==0){
            ctx.save();
            ctx.translate(pipe.x, pipe.top);
            ctx.scale(1,-1);
            ctx.drawImage(pipeImage,0,0,pipeW,pipe.top);
            ctx.restore();

            let bottomPipeY = pipe.top+pipeG;
            let bottomPipeHeight = Math.max(0,groundTopY - bottomPipeY)
            if (bottomPipeHeight>0) {
                ctx.drawImage(pipeImage,pipe.x,bottomPipeY,pipeW,bottomPipeHeight);
            }
        }
        if(pipe.perk && !pipe.perk.collected){
            let perkX = pipe.x + pipeW / 2 - perkSize / 2;
            let perkY = pipe.top + pipeG / 2 - perkSize / 2;
            let img = pipe.perk.perkImg;
            if(img && img.complete && img.naturalWidth!==0){
                ctx.drawImage(img, perkX, perkY, perkSize, perkSize);
            }
        }
    })

    drawBird(ctx);
    drawScore(ctx,currentScore,canvas.width);

    let timerY=Math.round(80*s + canvas.height * 0.05);
    let fontSize = Math.max(14,Math.round(20*s));
    let outlineWidth = Math.max(2,Math.round(fontSize*0.08));
    
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.strokeStyle='#000000';
    ctx.lineWidth=outlineWidth;
    ctx.lineJoin='round';
    if(activePerks.noCollisionTimeLeft > 0){
        let text=`Immortality Perk Duration: ${activePerks.noCollisionTimeLeft.toFixed(1)}s`;
        ctx.strokeText(text,20,timerY);
        ctx.fillStyle='#ff9900';
        ctx.fillText(text,20,timerY);
        timerY+=Math.round(30*s);
    }
    if(activePerks.fastForwardTimeLeft > 0){
        let text=`Fast Forward Duration: ${activePerks.fastForwardTimeLeft.toFixed(1)}s`;
        ctx.strokeText(text,20,timerY);
        ctx.fillStyle='#0066ff';
        ctx.fillText(text,20,timerY);
        timerY+=Math.round(30*s);
    }

    if(gameState==='START'){
        messageBox.innerHTML=`
            <img src="assets/UI/message.png">
            <p>Press space or click to start</p>`;
    }
}

function drawScore(ctx,score,canvasWidth){
    let s = getScale();
    let scoreStr=score.toString();
    let digitWidth=Math.round(24*s);
    let digitHeight=Math.round(36*s);
    let spacing=Math.max(1,Math.round(2*s));

    let totalWidth = scoreStr.length*digitWidth+(scoreStr.length-1)*spacing;
    let startX=canvasWidth-totalWidth-Math.round(40*s);
    let startY=Math.round(40*s);

    for(let i=0; i<scoreStr.length; i++){
        let digitValue=parseInt(scoreStr[i]);
        let numImg = scoreNumbers[digitValue];
        if(numImg && numImg.complete && numImg.naturalWidth!==0) {
            ctx.drawImage(numImg,startX,startY,digitWidth,digitHeight);
        }
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

// objects' properties

let lastTime = 0;

// bird's properties
let bird= {
    x: 250,
    y: 150,
    vy: 0,
    gravity: 0.3,
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

// pipe's properties 

let pipes=[];
let pipeImage = new Image();
pipeImage.src='assets/Flappy Bird/pipe-green.png';

// perks' properties

let noCollisionPerk= {
    duration: 5,
    chance: 0.075,
    perkImg: new Image()
};

let fastForwardPerk= {
    duration: 1,
    chance: 0.05,
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

// other properties

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

// Gameplay
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const messageBox=document.getElementById('messages');
const restartBtn=document.getElementById("playAgainBtn");
let gameState = 'START'; // START, PLAYING, FALLING, GAMEOVER
let currentScore=0;
let frameCounter=0;
let nextPipeInterval=150;
let hasBeatenRecord=false;
let isSpinning=false;
let spinFramesLeft=0;
let spinTimeLeft=0;
let messageTimeout=null;

syncLayoutOnResize();
window.addEventListener('resize', syncLayoutOnResize);

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
window.addEventListener('click', () => {
    if(gameState==='START'){
        gameState='PLAYING';
        messageBox.innerHTML = '';
    } else if (gameState === 'PLAYING'){ 
        bird.vy=bird.lift;
         music.wing.play();
     } else if (gameState === 'GAMEOVER') {
         restartGame();
    }
});