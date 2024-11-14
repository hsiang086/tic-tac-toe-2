/* script.js */

let currentPlayer = 'X';
let nextBoard = null;
let bigBoard = Array(9).fill(null);
let gameState = {}; // For saving and resuming game state

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
    const miniBoard = cell.parentElement;
    const miniBoardId = miniBoard.id;
    const cellId = cell.id;

    const miniBoardIndex = parseInt(miniBoardId.slice(1));
    const cellIndex = parseInt(cellId.slice(cellId.indexOf('c') + 1));

    // Prevent move if it's not the correct miniboard
    if (nextBoard !== null && nextBoard !== miniBoardId) return;
    if (cell.innerHTML !== '') return;

    // Set cell content and color
    cell.innerHTML = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());

    // Save move to game state
    saveMove(miniBoardId, cellId);

    // Check for miniboard win
    const winner = checkWin(miniBoardId);
    if (winner) {
        bigBoard[miniBoardIndex] = winner;

        // Color the won miniboard
        document.getElementById(miniBoardId).classList.add(`won-${winner.toLowerCase()}`);

        // Disable the miniboard
        disableMiniBoard(miniBoardId);
    } else {
        // Check if miniboard is full without a winner (draw)
        if (isMiniBoardFull(miniBoardId)) {
            bigBoard[miniBoardIndex] = 'D'; // D for Draw
            disableMiniBoard(miniBoardId);
        }
    }

    // Check for big board win
    if (checkBigWin()) {
        displayWinner(`${getCurrentPlayerName()} wins the game!`);
        disableAllCells();
        saveGameState(); // Save the game state
        return;
    }

    // Check for draw
    if (isBigBoardFull()) {
        displayWinner(`It's a draw!`);
        disableAllCells();
        saveGameState(); // Save the game state
        return;
    }

    // Determine the next miniboard
    nextBoard = `m${cellIndex}`;
    const nextBoardIndex = cellIndex;

    // If the next miniboard is won or full, allow any miniboard
    if (bigBoard[nextBoardIndex] !== null) {
        nextBoard = null;
    }

    // Switch player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

    // Update current player display
    updateCurrentPlayerDisplay();

    // Highlight the next miniboard(s)
    highlightNextMiniBoard();

    // Save the game state
    saveGameState();
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
            bigBoard[a] === currentPlayer &&
            bigBoard[b] === currentPlayer &&
            bigBoard[c] === currentPlayer
        ) {
            return true; // Current player wins the big board
        }
    }
    return false; // No big board win yet
}

function isBigBoardFull() {
    return bigBoard.every(status => status !== null);
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

function isMiniBoardFull(miniBoardId) {
    const cells = Array.from(document.querySelectorAll(`#${miniBoardId} .cell`));
    return cells.every(cell => cell.innerHTML !== '');
}

function highlightNextMiniBoard() {
    // Remove previous indicators
    document.querySelectorAll('.mini-board').forEach(miniBoard => {
        miniBoard.classList.remove('active-miniboard', 'inactive-miniboard');
    });

    if (nextBoard === null) {
        // Highlight all available miniboards
        bigBoard.forEach((status, index) => {
            const miniBoard = document.getElementById(`m${index}`);
            if (status === null) {
                miniBoard.classList.add('active-miniboard');
            } else {
                miniBoard.classList.add('inactive-miniboard');
            }
        });
    } else {
        // Highlight the next miniboard
        bigBoard.forEach((status, index) => {
            const miniBoard = document.getElementById(`m${index}`);
            if (`m${index}` === nextBoard && status === null) {
                miniBoard.classList.add('active-miniboard');
            } else {
                miniBoard.classList.add('inactive-miniboard');
            }
        });
    }
}

function updateCurrentPlayerDisplay() {
    const display = document.getElementById('current-player-display');
    display.textContent = `${getCurrentPlayerName()}'s Turn`;

    // Update player avatars
    document.querySelectorAll('.avatar-container img').forEach(avatar => {
        avatar.classList.remove('active');
    });
    document.querySelector(`#avatar-${currentPlayer.toLowerCase()}`).classList.add('active');
}

function displayWinner(message) {
    const display = document.getElementById('current-player-display');
    display.textContent = message;
}

function getCurrentPlayerName() {
    const playerNameInput = document.getElementById(`player-name-${currentPlayer.toLowerCase()}`);
    return playerNameInput.value || `Player ${currentPlayer}`;
}

function saveMove(miniBoardId, cellId) {
    if (!gameState.moves) {
        gameState.moves = [];
    }
    gameState.moves.push({
        player: currentPlayer,
        miniBoardId: miniBoardId,
        cellId: cellId
    });
}

function saveGameState() {
    gameState.currentPlayer = currentPlayer;
    gameState.nextBoard = nextBoard;
    gameState.bigBoard = bigBoard;
    gameState.playerNames = {
        X: document.getElementById('player-name-x').value,
        O: document.getElementById('player-name-o').value
    };
    gameState.avatars = {
        X: document.getElementById('avatar-x').src,
        O: document.getElementById('avatar-o').src
    };
    localStorage.setItem('ticTacToeGameState', JSON.stringify(gameState));
}

function loadGameState() {
    const savedState = localStorage.getItem('ticTacToeGameState');
    if (savedState) {
        gameState = JSON.parse(savedState);
        currentPlayer = gameState.currentPlayer;
        nextBoard = gameState.nextBoard;
        bigBoard = gameState.bigBoard;
        document.getElementById('player-name-x').value = gameState.playerNames.X;
        document.getElementById('player-name-o').value = gameState.playerNames.O;
        document.getElementById('avatar-x').src = gameState.avatars.X;
        document.getElementById('avatar-o').src = gameState.avatars.O;
        recreateBoardFromState();
        updateCurrentPlayerDisplay();
        highlightNextMiniBoard();
    } else {
        createBoard();
        updateCurrentPlayerDisplay();
        highlightNextMiniBoard();
    }
}

function recreateBoardFromState() {
    createBoard();
    if (gameState.moves && gameState.moves.length > 0) {
        gameState.moves.forEach(move => {
            const cell = document.getElementById(move.cellId);
            cell.innerHTML = move.player;
            cell.classList.add(move.player.toLowerCase());

            // Update bigBoard status
            const miniBoardIndex = parseInt(move.miniBoardId.slice(1));
            const winner = checkWin(move.miniBoardId);
            if (winner) {
                bigBoard[miniBoardIndex] = winner;
                document.getElementById(move.miniBoardId).classList.add(`won-${winner.toLowerCase()}`);
                disableMiniBoard(move.miniBoardId);
            } else if (isMiniBoardFull(move.miniBoardId)) {
                bigBoard[miniBoardIndex] = 'D';
                disableMiniBoard(move.miniBoardId);
            }
        });
    }
}

function resetGame() {
    localStorage.removeItem('ticTacToeGameState');
    currentPlayer = 'X';
    nextBoard = null;
    bigBoard = Array(9).fill(null);
    gameState = {};
    createBoard();
    updateCurrentPlayerDisplay();
    highlightNextMiniBoard();
    adjustGameScale(); // Adjust scale after resetting
}

function handleAvatarUpload(player) {
    const uploadInput = document.getElementById(`upload-avatar-${player.toLowerCase()}`);
    const avatarImage = document.getElementById(`avatar-${player.toLowerCase()}`);
    uploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                avatarImage.src = e.target.result;
                saveGameState();
            };
            reader.readAsDataURL(file);
        }
    });
}

// Adjust game scale only if necessary
function adjustGameScale() {
    const gameContainer = document.querySelector('.game-container');
    const containerWidth = gameContainer.offsetWidth;
    const containerHeight = gameContainer.offsetHeight;

    const scaleX = window.innerWidth / containerWidth;
    const scaleY = window.innerHeight / containerHeight;

    const scale = Math.min(scaleX, scaleY, 1); // Do not scale up beyond 1 (100%)

    if (scale < 1) {
        gameContainer.style.transform = `scale(${scale})`;
        gameContainer.style.transformOrigin = 'top center';
    } else {
        gameContainer.style.transform = '';
    }
}

// Initialize the game
window.addEventListener('load', () => {
    loadGameState();
    adjustGameScale(); // Adjust scale on load
});

window.addEventListener('resize', adjustGameScale); // Adjust scale on resize

// Attach event listeners
document.getElementById('player-name-x').addEventListener('input', saveGameState);
document.getElementById('player-name-o').addEventListener('input', saveGameState);
document.getElementById('reset-button').addEventListener('click', resetGame);

handleAvatarUpload('X');
handleAvatarUpload('O');

