// timer.js

// Timer Variables
let timerInterval = null;

// Timer Elements
const timerDisplayX = document.getElementById('timer-display-x');
const timerDisplayO = document.getElementById('timer-display-o');
const setTimerButton = document.getElementById('set-timer-button'); // Set Timer button element
const pauseButton = document.getElementById('pause-button'); // Pause button element

// Functions related to the timer

function startPlayerTimer() {
    clearInterval(timerInterval);
    if (gameState.isPaused) return; // Do not start timer if paused

    updatePlayerTimerDisplay();

    timerInterval = setInterval(() => {
        gameState.playerTimers[gameState.currentPlayer]--;
        updatePlayerTimerDisplay();

        if (gameState.playerTimers[gameState.currentPlayer] <= 0) {
            clearInterval(timerInterval);
            openContinueModal();
        }
    }, 1000);
}

function updatePlayerTimerDisplay() {
    const timerDisplayCurrent = gameState.currentPlayer === 'X' ? timerDisplayX : timerDisplayO;
    const timeRemaining = gameState.playerTimers[gameState.currentPlayer];
    let minutes = Math.floor(timeRemaining / 60);
    let seconds = timeRemaining % 60;
    timerDisplayCurrent.textContent = `${padZero(minutes)}:${padZero(seconds)}`;
}

function updateAllTimerDisplays() {
    for (const player of ['X', 'O']) {
        const timerDisplay = player === 'X' ? timerDisplayX : timerDisplayO;
        const timeRemaining = gameState.playerTimers[player];
        let minutes = Math.floor(timeRemaining / 60);
        let seconds = timeRemaining % 60;
        timerDisplay.textContent = `${padZero(minutes)}:${padZero(seconds)}`;
    }
}

function padZero(num) {
    return num < 10 ? '0' + num : num;
}

function resetTimers() {
    gameState.playerTimers = {
        X: gameState.timerDuration,
        O: gameState.timerDuration
    };
    updateAllTimerDisplays();
}

function setNewTimerDuration() {
    let newDuration = parseInt(prompt('Enter new time per player in minutes (1-60):'));
    if (isNaN(newDuration) || newDuration < 1 || newDuration > 60) {
        alert('Please enter a valid number between 1 and 60.');
        return;
    }
    gameState.timerDuration = newDuration * 60; // Convert minutes to seconds
    resetTimers();
    saveGameState();
}

// Pause Functionality
function pauseGame() {
    if (gameState.isPaused) {
        // Resume the game
        gameState.isPaused = false;
        startPlayerTimer();
        pauseButton.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        // Pause the game
        gameState.isPaused = true;
        clearInterval(timerInterval);
        pauseButton.innerHTML = '<i class="fas fa-play"></i>';
    }
    saveGameState();
}

// Event Listener for the Set Timer button
setTimerButton.addEventListener('click', setNewTimerDuration);

// Event Listener for the Pause button
pauseButton.addEventListener('click', pauseGame);

