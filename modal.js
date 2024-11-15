// modal.js

// Info Modal Elements
const infoButton = document.getElementById('info-button');
const modal = document.getElementById('game-rules-modal');
const closeModalButton = document.getElementById('close-modal-button');

// Continue Modal Elements
const continueModal = document.getElementById('continue-modal');
const continueButton = document.getElementById('continue-button');
const endGameButton = document.getElementById('end-game-button');
const timedOutPlayerSpan = document.getElementById('timed-out-player');

// Functions related to the info modal

function openModal() {
    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function closeModal() {
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Functions related to the continue modal

function openContinueModal() {
    timedOutPlayerSpan.textContent = getCurrentPlayerName();
    continueModal.style.display = 'block';
    setTimeout(() => {
        continueModal.classList.add('show');
    }, 10);
}

function closeContinueModal() {
    continueModal.classList.remove('show');
    setTimeout(() => {
        continueModal.style.display = 'none';
    }, 300);
}

// Event Listeners for modals
infoButton.addEventListener('click', openModal);
closeModalButton.addEventListener('click', closeModal);

continueButton.addEventListener('click', () => {
    // Reset the timed-out player's timer
    gameState.playerTimers[gameState.currentPlayer] = gameState.timerDuration;
    updatePlayerTimerDisplay();
    startPlayerTimer();
    closeContinueModal();
});

endGameButton.addEventListener('click', () => {
    displayWinner(`${getCurrentPlayerName()} ran out of time!`);
    disableAllCells();
    saveGameState();
    closeContinueModal();
});

// Close modals when clicking outside of them
window.onclick = function(event) {
    if (event.target == modal) {
        closeModal();
    }
    if (event.target == continueModal) {
        closeContinueModal();
    }
};

