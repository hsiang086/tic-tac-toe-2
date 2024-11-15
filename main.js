// main.js

// Event listeners for resizing and loading
window.addEventListener('load', () => {
    loadGameState();
    adjustGameScale(); // Adjust scale on load
});

window.addEventListener('resize', adjustGameScale);

// Event listeners for player name inputs
document.getElementById('player-name-x').addEventListener('input', () => {
    gameState.playerNames.X = document.getElementById('player-name-x').value;
    saveGameState();
});

document.getElementById('player-name-o').addEventListener('input', () => {
    gameState.playerNames.O = document.getElementById('player-name-o').value;
    saveGameState();
});

// Event listener for reset button
document.getElementById('reset-button').addEventListener('click', resetGame);

// Event listener for undo button
document.getElementById('undo-button').addEventListener('click', undoMove);

// Event listener for theme toggle button
document.getElementById('theme-toggle-button').addEventListener('click', toggleTheme);

// Handle avatar uploads
handleAvatarUpload('X');
handleAvatarUpload('O');

// Function to reset the game
function resetGame() {
    localStorage.removeItem('ticTacToeGameState');
    gameState.currentPlayer = 'X';
    gameState.nextBoard = null;
    gameState.bigBoard = Array(9).fill(null);
    gameState.moves = [];
    gameState.gameStarted = false;
    gameState.isPaused = false;
    resetTimers();
    createBoard();
    updateCurrentPlayerDisplay();
    highlightNextMiniBoard();
    adjustGameScale();
    clearInterval(timerInterval);
    updateAllTimerDisplays();
    pauseButton.innerHTML = '<i class="fas fa-pause"></i>';
}

// Theme Toggle Functionality
function toggleTheme() {
    if (document.body.classList.contains('dark-theme')) {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        document.getElementById('theme-toggle-button').innerHTML = '<i class="fas fa-moon"></i>';
        gameState.theme = 'light';
    } else {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        document.getElementById('theme-toggle-button').innerHTML = '<i class="fas fa-sun"></i>';
        gameState.theme = 'dark';
    }
    saveGameState();
}

function loadTheme() {
    if (!gameState.theme) {
        // Detect system preference
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        gameState.theme = prefersDark ? 'dark' : 'light';
    }

    if (gameState.theme === 'light') {
        document.body.classList.add('light-theme');
        document.getElementById('theme-toggle-button').innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        document.body.classList.add('dark-theme');
        document.getElementById('theme-toggle-button').innerHTML = '<i class="fas fa-sun"></i>';
    }
}

