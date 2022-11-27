const player = (name, symbol, htmlLabel) => {
    const playMove = (position) => {
        let gameWon = gameboard.registerMove(symbol, position);
        return gameWon;
    };
    return {
        name,
        symbol,
        playMove,
        htmlLabel,
    };
};

const botPlayer = (function () {
    let bot = "O";
    let player = "X";
    const _minimax = (board, depth, isMax) => {
        let score = gameboard.evaluateBoard(board);
        // If Maximizer has won, return the game his evaluated score
        if (score === 10) return score;
        // If Minimizer has won the game, return his evaluated score
        if (score === -10) return score;
        // If there are no more moves and no winner then it is a tie
        if (_isMovesLeft(board) === false) return 0;
        // If this maximizer's move
        if (isMax) {
            let best = -1000;
            // Traverse all cells
            for (let i = 0; i < 9; i++) {
                // Check if cell is empty
                if (board[i] === undefined) {
                    // Make the move
                    board[i] = bot;
                    // Call minimax recursively and choose the maximum value
                    best = Math.max(best, _minimax(board, depth + 1, !isMax));
                    // Undo the move
                    board[i] = undefined;
                }
            }
            return best;
        }
        // If this minimizer's move
        else {
            let best = 1000; // Traverse all cells
            for (let i = 0; i < 9; i++) {
                // Check if cell is empty
                if (board[i] === undefined) {
                    // Make the move
                    board[i] = player;
                    // Call minimax recursively and choose the minimum value
                    best = Math.min(best, _minimax(board, depth + 1, !isMax));
                    // Undo the move
                    board[i] = undefined;
                }
            }
            return best;
        }
    };
    // This will return the best possible
    // move for the player
    const _findBestMove = (board) => {
        let bestVal = -1000;
        let bestMove = -1;
        // Traverse all cells, evaluate // minimax function for all empty // cells. And return the cell // with optimal value.
        for (let i = 0; i < 9; i++) {
            // Check if cell is empty
            if (board[i] == undefined) {
                // Make the move
                board[i] = bot;

                // compute evaluation function for this move.
                let moveVal = _minimax(board, 0, false);

                // Undo the move
                board[i] = undefined;

                // If the value of the current move // is more than the best value, then // update best
                if (moveVal > bestVal) {
                    bestMove = i;
                    bestVal = moveVal;
                }
            }
        }
        return bestMove;
    };
    function _isMovesLeft(board) {
        for (let i = 0; i < 9; i++) {
            if (board[i] === undefined) return true;
        }
        return false;
    }
    return {
        _findBestMove,
    };
})();

const gameController = (function () {
    // get html elements
    const _startScreen = document.getElementsByClassName("start-screen")[0];
    const _mainScreen = document.getElementsByClassName("main")[0];
    const _btnPlay = document.getElementById("btn-play");
    const _btnRestart = document.getElementById("btn-restart");
    const _btnModeChange = document.getElementById("btn-mode-change");

    const _labelPlayer1 = document.getElementById("label-player-1");
    const _labelPlayer2 = document.getElementById("label-player-2");

    const _icnOpponent = document.getElementById("icn-opponent");

    const _difficultyDropdown = document.getElementById("difficulty-dropdown");

    let _namePlayer1 = document.getElementById("player-name-1");
    let _namePlayer2 = document.getElementById("player-name-2");

    let player1;
    let player2;
    let _currentPlayer;

    const updatePlayerNames = () => {
        _namePlayer1 = document.getElementById("player-name-1");
        _namePlayer2 = document.getElementById("player-name-2");
        _renderPlayerNames();
    };

    const _renderPlayerNames = () => {
        // set player name labels
        _labelPlayer1.textContent = _namePlayer1.value;
        _labelPlayer2.textContent = _namePlayer2.value;
    };

    const getCurrentPlayer = () => {
        return _currentPlayer;
    };

    const _setCurrentPlayer = (player) => {
        _currentPlayer = player;
        _currentPlayer.htmlLabel.style.fontWeight = 700;
    };

    const changePlayer = () => {
        _currentPlayer.htmlLabel.style.fontWeight = 500;
        if (_currentPlayer === player1) {
            _setCurrentPlayer(player2);
        } else {
            _setCurrentPlayer(player1);
        }
    };

    const _prepareNewGame = () => {
        gameboard.clear();
        updatePlayerNames();
        // create players
        player1 = player(_namePlayer1.value, "X", _labelPlayer1);
        player2 = player(_namePlayer2.value, "O", _labelPlayer2);
        _setCurrentPlayer(player1);
    };

    const _handlePlayButton = () => {
        _startScreen.style.display = "none";
        _mainScreen.style.display = "";
        _prepareNewGame();
    };

    const _handleRestartButton = () => {
        _startScreen.style.display = "";
        _mainScreen.style.display = "none";
        _prepareNewGame();
    };

    const getCurrentMode = () => {
        return _btnModeChange.dataset.mode;
    };

    const getDifficulty = () => {
        return _difficultyDropdown.value;
    };

    const _handleModeChange = (e) => {
        let mode = getCurrentMode();
        if (mode === "player") {
            mode = "bot";
            // display difficulty options
            _difficultyDropdown.style.display = "inline";
            // change icon of button
            _icnOpponent.classList.replace("icn-player", "icn-bot");
            // set player 2 name to AI
            _namePlayer2.value = "AI";
            _namePlayer2.disabled = true;
        } else {
            mode = "player";
            // hide difficulty options
            _difficultyDropdown.style.display = "none";

            _icnOpponent.classList.replace("icn-bot", "icn-player");
            _namePlayer2.value = "Player 2";
            _namePlayer2.disabled = false;
        }
        _btnModeChange.dataset.mode = mode;
    };

    // hook handlers
    _btnPlay.addEventListener("click", _handlePlayButton);
    _btnRestart.addEventListener("click", _handleRestartButton);
    _btnModeChange.addEventListener("click", _handleModeChange);

    return {
        getCurrentPlayer,
        changePlayer,
        updatePlayerNames,
        getCurrentMode,
        getDifficulty,
    };
})();

const gameboard = (function () {
    let _gameboardArr = new Array(9);
    let _singleSquares = document.getElementsByClassName("single-square");
    const _labelOutcome = document.getElementById("label-outcome");
    const _gameBoardDiv = document.getElementsByClassName("game-board")[0];
    const registerMove = (symbol, position) => {
        _gameboardArr[position] = symbol;
        let gameWon = _checkForWinners();
        if (!gameWon) {
            _checkForDraw();
        }
        return gameWon;
    };

    const _removePlayListeners = () => {
        for (square of _singleSquares) {
            square.removeEventListener("click", _handlePlayerMove);
            square.removeEventListener("mouseover", _handleMouseOver);
            square.removeEventListener("mouseout", _handleMouseOut);
        }
    };

    const _handleWin = (winningElementsPositions) => {
        // color wining elements
        winningElementsPositions.forEach((pos) => {
            _singleSquares[pos].style.color = "#12A637";
        });
        // remove event listeners
        _removePlayListeners();

        // vibrate gameboard on win
        _gameBoardDiv.style.animation = "shake 0.5s";
        _gameBoardDiv.style.animationIterationCount = 1;

        // display who is the winner
        _labelOutcome.textContent = `${
            gameController.getCurrentPlayer().name
        } wins!`;
        // update score
    };

    const _handleDraw = () => {
        _removePlayListeners();
        _labelOutcome.textContent = "DRAW";
    };

    const _checkForDraw = () => {
        let numXs = 0;
        let numOs = 0;
        _gameboardArr.forEach((square) => {
            if (square === "X") {
                numXs++;
            }
            if (square === "O") {
                numOs++;
            }
        });
        if (numXs + numOs === 9) {
            _handleDraw();
            return true;
        } else {
            return false;
        }
    };

    const _checkHorizontals = (bestMoveEvaluation = false) => {
        for (let i = 0; i < 8; i = i + 3) {
            if (
                _gameboardArr[i] === _gameboardArr[i + 1] &&
                _gameboardArr[i + 1] === _gameboardArr[i + 2] &&
                _gameboardArr[i] !== undefined
            ) {
                if (!bestMoveEvaluation) {
                    _handleWin([i, i + 1, i + 2]);
                }
                if (
                    _gameboardArr[i] ===
                    gameController.getCurrentPlayer().symbol
                ) {
                    return 10;
                } else {
                    return -10;
                }
            }
        }
        return 0;
    };

    const _checkVericals = (bestMoveEvaluation = false) => {
        for (let i = 0; i < 3; i++) {
            if (
                _gameboardArr[i] === _gameboardArr[i + 3] &&
                _gameboardArr[i + 3] === _gameboardArr[i + 6] &&
                _gameboardArr[i] !== undefined
            ) {
                if (!bestMoveEvaluation) {
                    _handleWin([i, i + 3, i + 6]);
                }
                if (
                    _gameboardArr[i] ===
                    gameController.getCurrentPlayer().symbol
                ) {
                    return 10;
                } else {
                    return -10;
                }
            }
        }
        return 0;
    };

    const _checkDiagonals = (bestMoveEvaluation = false) => {
        if (
            _gameboardArr[0] === _gameboardArr[4] &&
            _gameboardArr[4] === _gameboardArr[8] &&
            _gameboardArr[0] !== undefined
        ) {
            if (!bestMoveEvaluation) {
                _handleWin([0, 4, 8]);
            }
            if (_gameboardArr[0] === gameController.getCurrentPlayer().symbol) {
                return 10;
            } else {
                return -10;
            }
        }
        if (
            _gameboardArr[2] === _gameboardArr[4] &&
            _gameboardArr[4] === _gameboardArr[6] &&
            _gameboardArr[2] !== undefined
        ) {
            if (!bestMoveEvaluation) {
                _handleWin([2, 4, 6]);
            }
            if (_gameboardArr[2] === gameController.getCurrentPlayer().symbol) {
                return 10;
            } else {
                return -10;
            }
        }
        return 0;
    };

    const _checkForWinners = () => {
        let gameWon =
            _checkHorizontals() || _checkVericals() || _checkDiagonals();
        return gameWon;
    };

    const evaluateBoard = () => {
        let gameScore = 0;
        gameScore +=
            _checkHorizontals(true) +
            _checkVericals(true) +
            _checkDiagonals(true);
        return gameScore;
    };

    const _handlePlayerMove = (e) => {
        let player = gameController.getCurrentPlayer();
        let position = e.target.dataset.position;
        e.target.textContent = player.symbol;
        e.target.style.color = "black";
        let gameWon = player.playMove(position);
        if (!gameWon && !_checkForDraw()) {
            gameController.changePlayer();
            if (gameController.getCurrentMode() === "bot" && !gameWon) {
                _playBotMove();
            }
        }
    };

    const _getBotMove = () => {
        let bestMove = botPlayer._findBestMove(_gameboardArr);
        let diff = gameController.getDifficulty();
        let threshold;
        let move;
        switch (diff) {
            case "0":
                threshold = 0.1;
                break;
            case "1":
                threshold = 0.5;
                break;
            case "2":
                threshold = 0.9;
                break;
            case "3":
                threshold = 1;
                break;
        }
        let rand = Math.random();
        if (rand < threshold) {
            move = bestMove;
        } else {
            move = getRandomInt(9);
            while (_gameboardArr[move] !== undefined) {
                move = getRandomInt(9);
            }
        }
        return move;
        function getRandomInt(max) {
            return Math.floor(Math.random() * max);
        }
    };

    const _playBotMove = () => {
        let player = gameController.getCurrentPlayer();
        let botMove = _getBotMove();
        let gameWon = player.playMove(botMove);

        // render move on screen
        _singleSquares[botMove].textContent = player.symbol;

        if (!gameWon) {
            gameController.changePlayer();
        }
    };

    const _handleMouseOver = (e) => {
        if (e.target.textContent.trim() === "") {
            let player = gameController.getCurrentPlayer();
            e.target.textContent = player.symbol;
            e.target.style.color = "LightGray";
        }
    };

    const _handleMouseOut = (e) => {
        let position = e.target.dataset.position;
        e.target.textContent = _gameboardArr[position];
        e.target.style.color = "black";
    };

    const initialize = () => {
        // update player names
        gameController.updatePlayerNames();
        // hook event handlers
        for (square of _singleSquares) {
            square.addEventListener("click", _handlePlayerMove, { once: true });
            square.addEventListener("mouseover", _handleMouseOver);
            square.addEventListener("mouseout", _handleMouseOut);
            square.style.color = "black";
        }
        // clear outcome from last game
        _labelOutcome.textContent = "";

        // remove vibration effect from gameboard
        _gameBoardDiv.style.removeProperty("animation");
        _gameBoardDiv.style.removeProperty("animationIterationCount");
    };

    const clear = () => {
        _gameboardArr = new Array(9);
        for (square of _singleSquares) {
            square.textContent = "";
        }
        initialize();
    };

    initialize();

    return {
        registerMove,
        clear,
        evaluateBoard,
    };
})();
