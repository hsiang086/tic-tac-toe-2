// storage.js

// Functions related to saving and loading game state

function saveMove(miniBoardId, cellId) {
    gameState.moves.push({
        player: gameState.currentPlayer,
        miniBoardId: miniBoardId,
        cellId: cellId,
        nextBoard: gameState.nextBoard,
        bigBoard: [...gameState.bigBoard], // Create a copy
        playerTimers: { ...gameState.playerTimers }, // Copy timers
        currentPlayer: gameState.currentPlayer
    });
}

function saveGameState() {
    localStorage.setItem('ticTacToeGameState', JSON.stringify(gameState));
}

function loadGameState() {
    const savedState = localStorage.getItem('ticTacToeGameState');
    if (savedState) {
        Object.assign(gameState, JSON.parse(savedState));
        // Additional setup if needed
        recreateBoardFromState();
        updateCurrentPlayerDisplay();
        highlightNextMiniBoard();
        updateAllTimerDisplays();
        loadTheme(); // Load the theme
        if (gameState.gameStarted && !gameState.isPaused) {
            startPlayerTimer();
        }
    } else {
        createBoard();
        updateCurrentPlayerDisplay();
        highlightNextMiniBoard();
        resetTimers(); // Initialize timers
        loadTheme(); // Load the default theme
    }
}

