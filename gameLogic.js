// gameLogic.js

// Central gameState object
const gameState = {
    currentPlayer: 'X',
    nextBoard: null,
    bigBoard: Array(9).fill(null),
    moves: [],
    gameStarted: false,
    playerNames: {
        X: 'Player X',
        O: 'Player O'
    },
    avatars: {
        X: './images/default.webp',
        O: './images/default.webp'
    },
    timerDuration: 300,
    playerTimers: {
        X: 300,
        O: 300
    },
    isPaused: false,
    theme: 'dark' // Default theme
};

// Functions related to game mechanics

function createBoard() {
    const board = document.getElementById('board');
    board.innerHTML = ''; // Clear the board
    for (let i = 0; i < 9; i++) {
        const miniBoard = document.createElement('div');
        miniBoard.classList.add('mini-board');
        miniBoard.id = `m${i}`;
        for (let j = 0; j < 9; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.id = `m${i}c${j}`;
            cell.addEventListener('click', cellClickHandler);
            miniBoard.appendChild(cell);
        }
        board.appendChild(miniBoard);
    }
}

function cellClickHandler() {
    makeMove(this);
}

function makeMove(cell) {
    if (gameState.isPaused) return; // Do not allow moves when paused

    const miniBoard = cell.parentElement;
    const miniBoardId = miniBoard.id;
    const cellId = cell.id;

    const miniBoardIndex = parseInt(miniBoardId.slice(1));
    const cellIndex = parseInt(cellId.slice(cellId.indexOf('c') + 1));

    // Prevent move if it's not the correct miniboard
    if (gameState.nextBoard !== null && gameState.nextBoard !== miniBoardId) return;
    if (cell.innerHTML !== '') return;

    // Set cell content and color
    cell.innerHTML = gameState.currentPlayer;
    cell.classList.add(gameState.currentPlayer.toLowerCase());

    // Save move to game state
    saveMove(miniBoardId, cellId);

    // Start the timer on the first move
    if (!gameState.gameStarted) {
        startPlayerTimer();
        gameState.gameStarted = true;
    }

    // Check for miniboard win
    const winner = checkWin(miniBoardId);
    if (winner) {
        gameState.bigBoard[miniBoardIndex] = winner;

        // Color the won miniboard
        document.getElementById(miniBoardId).classList.add(`won-${winner.toLowerCase()}`);

        // Disable the miniboard
        disableMiniBoard(miniBoardId);
    } else {
        // Check if miniboard is full without a winner (draw)
        if (isMiniBoardFull(miniBoardId)) {
            gameState.bigBoard[miniBoardIndex] = 'D'; // D for Draw
            disableMiniBoard(miniBoardId);
        }
    }

    // Check for big board win
    if (checkBigWin()) {
        displayWinner(`${getCurrentPlayerName()} wins the game!`);
        disableAllCells();
        saveGameState(); // Save the game state
        clearInterval(timerInterval); // Stop the timer
        return;
    }

    // Check for draw
    if (isBigBoardFull()) {
        displayWinner(`It's a draw!`);
        disableAllCells();
        saveGameState(); // Save the game state
        clearInterval(timerInterval); // Stop the timer
        return;
    }

    // Determine the next miniboard
    gameState.nextBoard = `m${cellIndex}`;
    const nextBoardIndex = cellIndex;

    // If the next miniboard is won or full, allow any miniboard
    if (gameState.bigBoard[nextBoardIndex] !== null) {
        gameState.nextBoard = null;
    }

    // Switch player
    gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';

    // Update current player display
    updateCurrentPlayerDisplay();

    // Highlight the next miniboard(s)
    highlightNextMiniBoard();

    // Save the game state
    saveGameState();

    // Restart the timer for the next player
    startPlayerTimer();
}

function checkWin(miniBoardId) {
    const cells = Array.from(document.querySelectorAll(`#${miniBoardId} .cell`));
    const values = cells.map(cell => cell.innerHTML);
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    for (const combo of winningCombinations) {
        const [a, b, c] = combo;
        if (values[a] && values[a] === values[b] && values[a] === values[c]) {
            return values[a]; // Return the winner (value in the cell)
        }
    }
    return null; // No win
}

function checkBigWin() {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    for (const combo of winningCombinations) {
        const [a, b, c] = combo;
        if (
            gameState.bigBoard[a] === gameState.currentPlayer &&
            gameState.bigBoard[b] === gameState.currentPlayer &&
            gameState.bigBoard[c] === gameState.currentPlayer
        ) {
            return true; // Current player wins the big board
        }
    }
    return false; // No big board win yet
}

function isBigBoardFull() {
    return gameState.bigBoard.every(status => status !== null);
}

function isMiniBoardFull(miniBoardId) {
    const cells = Array.from(document.querySelectorAll(`#${miniBoardId} .cell`));
    return cells.every(cell => cell.innerHTML !== '');
}

function disableMiniBoard(miniBoardId) {
    const cells = document.querySelectorAll(`#${miniBoardId} .cell`);
    cells.forEach(cell => {
        cell.classList.add('disabled');
        cell.removeEventListener('click', cellClickHandler);
    });
}

function disableAllCells() {
    const allCells = document.querySelectorAll('.cell');
    allCells.forEach(cell => {
        cell.classList.add('disabled');
        cell.removeEventListener('click', cellClickHandler);
    });
}

// Undo Functionality
function undoMove() {
    if (gameState.moves.length === 0) return; // No moves to undo

    // Remove the last move
    gameState.moves.pop();

    if (gameState.moves.length === 0) {
        // Reset the game if no moves are left
        resetGame();
        return;
    }

    // Get the last move
    const lastMove = gameState.moves[gameState.moves.length - 1];

    // Restore the game state to the last move
    gameState.currentPlayer = lastMove.currentPlayer;
    gameState.nextBoard = lastMove.nextBoard;
    gameState.bigBoard = [...lastMove.bigBoard];
    gameState.playerTimers = { ...lastMove.playerTimers };
    gameState.gameStarted = true;

    // Recreate the board from the moves
    recreateBoardFromState();

    // Update UI
    updateCurrentPlayerDisplay();
    highlightNextMiniBoard();
    updateAllTimerDisplays();

    // Restart the timer for the current player
    startPlayerTimer();

    // Save the updated game state
    saveGameState();
}

