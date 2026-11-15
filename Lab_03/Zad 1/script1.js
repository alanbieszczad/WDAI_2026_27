let startTime = 0;
let elapsedTime = 0;
let timerInterval = null;

const stopBtn = document.getElementById("stop");
const startBtn = document.getElementById("start");
const resetBtn = document.getElementById("reset");
const display = document.getElementById("stoper")

function formatTime(sec) {
    if (sec < 60) return `${sec}s`;
    const minutes = Math.floor(sec/60);
    const seconds = sec % 60;
    return `${minutes}min ${seconds}s`;
}


function updateDisplay() {
    const totalSeconds = Math.floor(elapsedTime / 1000);
    display.textContent=formatTime(totalSeconds);
}

function startTimer() {
    if (timerInterval !== null) return;
    
    startTime = Date.now(); - elapsedTime;

    timerInterval = setInterval(() => {
        elapsedTime=Date.now() - startTime;
        updateDisplay();
    }, 1000);
}

function stopTimer () {
    clearInterval(timerInterval);
    timerInterval=null;
}

function resetTimer() {
    clearInterval(timerInterval);
    timerInterval=null;
    elapsedTime=0;
    updateDisplay();
    startTimer();
}

startBtn.addEventListener('click', startTimer);

stopBtn.addEventListener('click', stopTimer);

resetBtn.addEventListener('click', resetTimer);