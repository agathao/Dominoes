var Orientation;
(function (Orientation) {
    Orientation[Orientation["LEFT_RIGHT"] = 0] = "LEFT_RIGHT";
    Orientation[Orientation["RIGHT_LEFT"] = 1] = "RIGHT_LEFT";
})(Orientation || (Orientation = {}));
var Play;
(function (Play) {
    Play[Play["LEFT"] = 0] = "LEFT";
    Play[Play["RIGHT"] = 1] = "RIGHT";
    Play[Play["BUY"] = 2] = "BUY";
    Play[Play["PASS"] = 3] = "PASS";
    Play[Play["END"] = 4] = "END";
})(Play || (Play = {}));
var gameService = gamingPlatform.gameService;
var alphaBetaService = gamingPlatform.alphaBetaService;
var translate = gamingPlatform.translate;
var resizeGameAreaService = gamingPlatform.resizeGameAreaService;
var log = gamingPlatform.log;
var dragAndDropService = gamingPlatform.dragAndDropService;
var gameLogic;
(function (gameLogic) {
    function setBoardRoot(board, tile) {
        board.root = tile;
        board.leftMostTile = tile;
        board.rightMostTile = tile;
        board.currentRight = tile.rightNumber;
        board.currentLeft = tile.leftNumber;
    }
    function addTileToTheRight(board, playedTile) {
        var previousRightTile = board.root;
        while (previousRightTile.tileKey != board.rightMostTile.tileKey) {
            previousRightTile = previousRightTile.rightTile;
        }
        previousRightTile.rightTile = playedTile;
        board.rightMostTile = playedTile;
        if (board.currentRight == playedTile.leftNumber) {
            playedTile.orientation = Orientation.LEFT_RIGHT;
            board.currentRight = playedTile.rightNumber;
        }
        else {
            playedTile.orientation = Orientation.RIGHT_LEFT;
            board.currentRight = playedTile.leftNumber;
        }
    }
    function addTileToTheLeft(board, playedTile) {
        var previousLeftTile = board.root;
        while (previousLeftTile.tileKey != board.leftMostTile.tileKey) {
            previousLeftTile = previousLeftTile.leftTile;
        }
        previousLeftTile.leftTile = playedTile;
        board.leftMostTile = playedTile;
        if (board.currentLeft == playedTile.leftNumber) {
            playedTile.orientation = Orientation.RIGHT_LEFT;
            board.currentLeft = playedTile.rightNumber;
        }
        else {
            playedTile.orientation = Orientation.LEFT_RIGHT;
            board.currentLeft = playedTile.leftNumber;
        }
    }
    function addTileToHand(player, tile) {
        player.hand.unshift(tile);
    }
    function removeTileFromHand(player, tileKey) {
        var index = player.hand.map(function (t) { return t.tileKey; }).indexOf(tileKey);
        if (index !== undefined && index !== -1) {
            player.hand.splice(index, 1);
        }
        else {
            throw new Error("Unknown tile " + JSON.stringify(tileKey));
        }
    }
    function getNumberOfRemainingTiles(player) {
        return player.hand.length;
    }
    /** Returns the initial Dominoes board. */
    function getInitialBoard() {
        return {};
    }
    gameLogic.getInitialBoard = getInitialBoard;
    function shuffle(tiles) {
        var j, x, i;
        for (i = tiles.length; i; i--) {
            j = Math.floor(Math.random() * i);
            x = tiles[i - 1];
            tiles[i - 1] = tiles[j];
            tiles[j] = x;
        }
    }
    function getInitialState() {
        var players = [], house = { id: -1, hand: [] }, numOfPlayers = 2, i = 0, j = 0, k = 0, assignedTiles = 0, currentPlayerIndex = 0, tiles = [];
        //Create tiles
        for (i = 0; i < 7; i++) {
            for (j = 0; j <= i; j++) {
                var currentTile = { tileKey: 'tile' + k, leftNumber: j, rightNumber: i };
                tiles[k] = currentTile;
                k++;
            }
        }
        //Shuffle tiles
        shuffle(tiles);
        //Assign tiles to players and remaining tiles to the house
        var tilesToAssign = numOfPlayers === 2 ? 7 : 5;
        assignedTiles = 0;
        currentPlayerIndex = 0;
        for (i = 0; i < tiles.length; i++) {
            if (currentPlayerIndex < numOfPlayers) {
                if (!players[currentPlayerIndex]) {
                    players[currentPlayerIndex] = { id: currentPlayerIndex, hand: [] };
                }
                players[currentPlayerIndex].hand.push(tiles[i]);
                assignedTiles++;
                if (assignedTiles === tilesToAssign) {
                    currentPlayerIndex++;
                    assignedTiles = 0;
                }
            }
            else {
                house.hand.push(tiles[i]);
            }
        }
        return { board: getInitialBoard(), delta: null, players: players, house: house };
    }
    gameLogic.getInitialState = getInitialState;
    function getTileFromKey(tiles, key) {
        var index = tiles.map(function (t) { return t.tileKey; }).indexOf(key);
        return tiles[index];
    }
    function hasWon(currentPlayer) {
        return getNumberOfRemainingTiles(currentPlayer) === 0;
    }
    function getGenericMove(turn, state) {
        return { turnIndex: turn, state: state, endMatchScores: null };
    }
    function getRemainingPoints(player) {
        var tile, points = 0;
        for (var i = 0; i < player.hand.length; i++) {
            points = points + player.hand[i].leftNumber + player.hand[i].rightNumber;
        }
        return points;
    }
    function validateTiles(tile, currentNumber) {
        if (tile.rightNumber !== currentNumber && tile.leftNumber !== currentNumber) {
            throw new Error("Cannot place tile at the board! Numbers are invalid.");
        }
    }
    function getEndMatchScores(players) {
        var remainingPoints = [], numberOfPlayers = players.length, min = 336, minPlayer = -1, totalPoints = 0;
        for (var i = 0; i < numberOfPlayers; i++) {
            remainingPoints[i] = getRemainingPoints(players[i]);
            totalPoints = totalPoints + remainingPoints[i];
            if (remainingPoints[i] < min) {
                min = remainingPoints[i];
                minPlayer = i;
            }
        }
        var endScores = [];
        for (var i = 0; i < numberOfPlayers; i++) {
            if (i === minPlayer) {
                endScores[i] = totalPoints - 2 * remainingPoints[i];
            }
            else {
                endScores[i] = 0;
            }
        }
        return endScores;
    }
    function createMoveEndGame(board, delta, players, house, turnIndexBeforeMove) {
        var state = { board: board, delta: delta, players: players, house: house };
        return { endMatchScores: getEndMatchScores(state.players), turnIndex: -1, state: state };
    }
    function canPlayATile(tiles, board) {
        for (var i = 0; i < tiles.length; i++) {
            var tile = tiles[i];
            //This is the first tile
            if (!board.root) {
                if (tile.leftNumber == tile.rightNumber) {
                    return true;
                }
            }
            else if (tile.leftNumber === board.currentLeft || tile.rightNumber === board.currentRight) {
                return true;
            }
        }
        return false;
    }
    /**
     * In this case we pass the turn to the next player
     */
    function createMovePass(board, delta, players, house, turnIndexBeforeMove) {
        var state = { board: board, delta: delta, players: players, house: house };
        var turnIndex = (turnIndexBeforeMove + 1) % state.players.length;
        if (canPlayATile(players[turnIndexBeforeMove].hand, board)) {
            throw new Error("Player should play and not pass");
        } //House is not empty and this is not the first tile
        else if (house.hand && house.hand.length > 0 && board.root) {
            throw new Error("Player should buy and not pass");
        }
        var canAnyonePlay = false;
        for (var i = 0; i < players.length; i++) {
            if (canPlayATile(players[i].hand, board)) {
                canAnyonePlay = true;
                break;
            }
        }
        if (canAnyonePlay) {
            return getGenericMove(turnIndex, state);
        }
        else {
            return createMoveEndGame(board, delta, players, house, turnIndexBeforeMove);
        }
    }
    /*
     * In this case, the domino tile should be removed from the house and added to the player's hand.
     */
    function createMoveBuy(board, delta, players, house, turnIndexBeforeMove) {
        if (getNumberOfRemainingTiles(house) === 0) {
            throw new Error("One cannot buy from the house when it has no tiles");
        }
        var tile = getTileFromKey(house.hand, delta.tileKey);
        removeTileFromHand(house, delta.tileKey);
        addTileToHand(players[turnIndexBeforeMove], tile);
        var state = { board: board, delta: delta, players: players, house: house };
        return { endMatchScores: null, turnIndex: turnIndexBeforeMove, state: state };
    }
    function createMovePlay(board, delta, players, house, turnIndexBeforeMove) {
        var operations, numberOfPlayers = players.length, playedTile = getTileFromKey(players[turnIndexBeforeMove].hand, delta.tileKey);
        //Check if someone has already won the game
        for (var i = 0; i < numberOfPlayers; i++) {
            if (hasWon(players[i])) {
                throw new Error("Can only make a move if the game is not over! Player " + i + " has already won.");
            }
        }
        if (!board.root) {
            if (playedTile.leftNumber != playedTile.rightNumber) {
                throw new Error("First tile must be a double");
            }
            setBoardRoot(board, playedTile);
        }
        else if (delta.play === Play.RIGHT) {
            var rightTile = board.currentRight;
            validateTiles(playedTile, rightTile);
            addTileToTheRight(board, playedTile);
        }
        else {
            var leftTile = board.currentLeft;
            validateTiles(playedTile, leftTile);
            addTileToTheLeft(board, playedTile);
        }
        removeTileFromHand(players[turnIndexBeforeMove], delta.tileKey);
        var state = { board: board, delta: delta, players: players, house: house };
        if (getNumberOfRemainingTiles(players[turnIndexBeforeMove]) !== 0) {
            var nextTurn = (turnIndexBeforeMove + 1) % numberOfPlayers;
            return getGenericMove(nextTurn, state);
        }
        else {
            delta.play = Play.END;
            return createMoveEndGame(board, delta, players, house, turnIndexBeforeMove);
        }
    }
    /**
    * Returns the move that should be performed when player with index
    * turnIndexBeforeMove makes a move.
    */
    function createMove(stateBeforeMove, turnIndexBeforeMove, delta) {
        if (!stateBeforeMove || stateBeforeMove == null) {
            stateBeforeMove = getInitialState();
        }
        var operations, boardAfterMove, playersAfterMove, playerAfterMove, houseAfterMove, playedTileKey = !(delta) ? undefined : delta.tileKey, play = delta === undefined ? undefined : delta.play, players = stateBeforeMove.players, house = stateBeforeMove.house, board = stateBeforeMove.board;
        boardAfterMove = angular.copy(board);
        playersAfterMove = angular.copy(players);
        playerAfterMove = angular.copy(players[turnIndexBeforeMove]);
        houseAfterMove = angular.copy(house);
        var finalMove;
        //If there was no tile on the board before, this is the first tile
        if (Play.LEFT === play || Play.RIGHT === play) {
            return createMovePlay(boardAfterMove, delta, playersAfterMove, houseAfterMove, turnIndexBeforeMove);
        }
        else if (Play.BUY === play) {
            return createMoveBuy(boardAfterMove, delta, playersAfterMove, houseAfterMove, turnIndexBeforeMove);
        }
        else if (Play.PASS == play) {
            return createMovePass(boardAfterMove, delta, playersAfterMove, houseAfterMove, turnIndexBeforeMove);
        }
        else if (Play.END === play) {
            var stateAfterMove = angular.copy(stateBeforeMove);
            return createMoveEndGame(boardAfterMove, delta, playersAfterMove, houseAfterMove, turnIndexBeforeMove);
        }
        else {
            throw new Error("Unknown play");
        }
    }
    gameLogic.createMove = createMove;
    function createInitialMove() {
        return { endMatchScores: null, turnIndex: 0,
            state: getInitialState() };
    }
    gameLogic.createInitialMove = createInitialMove;
    function forSimpleTestHtml() {
        var move = gameLogic.createInitialMove();
        log.log("move=", move);
    }
    gameLogic.forSimpleTestHtml = forSimpleTestHtml;
})(gameLogic || (gameLogic = {}));
//# sourceMappingURL=gameLogic.js.map