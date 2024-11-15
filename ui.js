// ui.js

// Functions related to updating the UI

function updateCurrentPlayerDisplay() {
    const display = document.getElementById('current-player-display');
    display.textContent = `${getCurrentPlayerName()}'s Turn`;

    // Update player avatars
    document.querySelectorAll('.avatar-container img').forEach(avatar => {
        avatar.classList.remove('active');
    });
    document.querySelector(`#avatar-${gameState.currentPlayer.toLowerCase()}`).classList.add('active');
}

function displayWinner(message) {
    const display = document.getElementById('current-player-display');
    display.textContent = message;
}

function getCurrentPlayerName() {
    return gameState.playerNames[gameState.currentPlayer] || `Player ${gameState.currentPlayer}`;
}

function highlightNextMiniBoard() {
    // Remove previous indicators
    document.querySelectorAll('.mini-board').forEach(miniBoard => {
        miniBoard.classList.remove('active-miniboard', 'inactive-miniboard');
    });

    if (gameState.nextBoard === null) {
        // Highlight all available miniboards
        gameState.bigBoard.forEach((status, index) => {
            const miniBoard = document.getElementById(`m${index}`);
            if (status === null) {
                miniBoard.classList.add('active-miniboard');
            } else {
                miniBoard.classList.add('inactive-miniboard');
            }
        });
    } else {
        // Highlight the next miniboard
        gameState.bigBoard.forEach((status, index) => {
            const miniBoard = document.getElementById(`m${index}`);
            if (`m${index}` === gameState.nextBoard && status === null) {
                miniBoard.classList.add('active-miniboard');
            } else {
                miniBoard.classList.add('inactive-miniboard');
            }
        });
    }
}

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

function handleAvatarUpload(player) {
    const uploadInput = document.getElementById(`upload-avatar-${player.toLowerCase()}`);
    const avatarImage = document.getElementById(`avatar-${player.toLowerCase()}`);
    uploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                avatarImage.src = e.target.result;
                gameState.avatars[player] = e.target.result;
                saveGameState();
            };
            reader.readAsDataURL(file);
        }
    });
}

// Recreate board from state (modified for undo functionality)
function recreateBoardFromState() {
    createBoard();

    // Reset bigBoard
    gameState.bigBoard = Array(9).fill(null);

    // Clear all cells
    const allCells = document.querySelectorAll('.cell');
    allCells.forEach(cell => {
        cell.innerHTML = '';
        cell.classList.remove('x', 'o', 'disabled');
        cell.addEventListener('click', cellClickHandler);
    });

    // Clear mini-board styles
    const allMiniBoards = document.querySelectorAll('.mini-board');
    allMiniBoards.forEach(miniBoard => {
        miniBoard.classList.remove('won-x', 'won-o', 'disabled');
    });

    if (gameState.moves && gameState.moves.length > 0) {
        gameState.moves.forEach(move => {
            const cell = document.getElementById(move.cellId);
            cell.innerHTML = move.player;
            cell.classList.add(move.player.toLowerCase());

            // Update bigBoard status
            const miniBoardIndex = parseInt(move.miniBoardId.slice(1));
            const winner = checkWin(move.miniBoardId);
            if (winner) {
                gameState.bigBoard[miniBoardIndex] = winner;
                document.getElementById(move.miniBoardId).classList.add(`won-${winner.toLowerCase()}`);
                disableMiniBoard(move.miniBoardId);
            } else if (isMiniBoardFull(move.miniBoardId)) {
                gameState.bigBoard[miniBoardIndex] = 'D';
                disableMiniBoard(move.miniBoardId);
            }
        });
    }
}

