;
var game;
(function (game) {
    game.$rootScope = null;
    game.$timeout = null;
    // Global variables are cleared when getting updateUI.
    // I export all variables to make it easy to debug in the browser by
    // simply typing in the console, e.g.,
    // game.currentUpdateUI
    game.currentUpdateUI = null;
    game.didMakeMove = false; // You can only make one move per updateUI
    game.animationEndedTimeout = null;
    game.state = null;
    // For community games.
    game.proposals = null;
    game.yourPlayerInfo = null;
    game.treeStructure = [
        [0],
        [1, 2, 3, 4, 5, 6, 7],
        [1, 2, 3, 4, 5, 6],
        [7],
        [8],
        [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
        [8],
        [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22] //tree7
    ];
    game.treeSourcesCache = [];
    game.treeClassesCache = [];
    game.tileCache = [];
    game.selectedTile = undefined; //The tile currently selected for play
    function init($rootScope_, $timeout_) {
        game.$rootScope = $rootScope_;
        game.$timeout = $timeout_;
        registerServiceWorker();
        translate.setTranslations(getTranslations());
        translate.setLanguage('en');
        resizeGameAreaService.setWidthToHeight(2);
        gameService.setGame({
            updateUI: updateUI,
            communityUI: communityUI,
            getStateForOgImage: null,
        });
    }
    game.init = init;
    function registerServiceWorker() {
        // I prefer to use appCache over serviceWorker
        // (because iOS doesn't support serviceWorker, so we have to use appCache)
        // I've added this code for a future where all browsers support serviceWorker (so we can deprecate appCache!)
        if (!window.applicationCache && 'serviceWorker' in navigator) {
            var n = navigator;
            log.log('Calling serviceWorker.register');
            n.serviceWorker.register('service-worker.js').then(function (registration) {
                log.log('ServiceWorker registration successful with scope: ', registration.scope);
            }).catch(function (err) {
                log.log('ServiceWorker registration failed: ', err);
            });
        }
    }
    function getTranslations() {
        return {
            "SCORE": {
                "en": "SCORE",
                "iw": "SCORE",
                "pt": "Pontos",
                "zh": "SCORE",
                "el": "SCORE",
                "fr": "POINTS",
                "hi": "SCORE",
                "es": "Puntos"
            },
            "PASS": {
                "en": "PASS",
                "iw": "PASS",
                "pt": "PASSAR",
                "zh": "PASS",
                "el": "PASS",
                "fr": "PASSER",
                "hi": "PASS",
                "es": "PASAR"
            }
        };
    }
    function communityUI(communityUI) {
        log.info("Game got communityUI:", communityUI);
        // If only proposals changed, then do NOT call updateUI. Then update proposals.
        var nextUpdateUI = {
            playersInfo: [],
            playMode: communityUI.yourPlayerIndex,
            numberOfPlayers: communityUI.numberOfPlayers,
            state: communityUI.state,
            turnIndex: communityUI.turnIndex,
            endMatchScores: communityUI.endMatchScores,
            yourPlayerIndex: communityUI.yourPlayerIndex,
        };
        if (angular.equals(game.yourPlayerInfo, communityUI.yourPlayerInfo) &&
            game.currentUpdateUI && angular.equals(game.currentUpdateUI, nextUpdateUI)) {
        }
        else {
            // Things changed, so call updateUI.
            updateUI(nextUpdateUI);
        }
        // This must be after calling updateUI, because we nullify things there (like playerIdToProposal&proposals&etc)
        game.yourPlayerInfo = communityUI.yourPlayerInfo;
        var playerIdToProposal = communityUI.playerIdToProposal;
        game.didMakeMove = !!playerIdToProposal[communityUI.yourPlayerInfo.playerId];
        game.proposals = [];
        // for (let i = 0; i < gameLogic.ROWS; i++) {
        //   proposals[i] = [];
        //   for (let j = 0; j < gameLogic.COLS; j++) {
        //     proposals[i][j] = 0;
        //   }
        // }
        // for (let playerId in playerIdToProposal) {
        //   let proposal = playerIdToProposal[playerId];
        //   let delta = proposal.data;
        //   proposals[delta.row][delta.col]++;
        // }
    }
    game.communityUI = communityUI;
    function isProposal(row, col) {
        return game.proposals && game.proposals[row][col] > 0;
    }
    game.isProposal = isProposal;
    function isProposal1(row, col) {
        return game.proposals && game.proposals[row][col] == 1;
    }
    game.isProposal1 = isProposal1;
    function isProposal2(row, col) {
        return game.proposals && game.proposals[row][col] == 2;
    }
    game.isProposal2 = isProposal2;
    function updateUI(params) {
        game.selectedTile = undefined; //TODO: might be able to remove this
        log.info("Dominoes game got updateUI:", params);
        game.didMakeMove = false; // Only one move per updateUI
        game.currentUpdateUI = params;
        game.state = params.state;
        if (isFirstMove()) {
            game.state = gameLogic.getInitialState();
        }
        populateCaches(0, 0, undefined, undefined);
        //TODO if needed: If the state exists and it is a reveal play, create an end of game play
        //TODO if needed: if the previous play was a pass move, and the current play was also a pass move,
        // We calculate the AI move only after the animation finishes,
        // because if we call aiService now
        // then the animation will be paused until the javascript finishes.
        game.animationEndedTimeout = game.$timeout(animationEndedCallback, 500);
    }
    game.updateUI = updateUI;
    function getClassForTree(tree, flipped) {
        if (tree === 0) {
            return "rootTile";
        }
        if (tree === 1 || tree === 2) {
            if (flipped) {
                return "horizontalTile";
            }
            return "horizontalTileFlip";
        }
        if (tree === 3 || tree === 4) {
            if (flipped) {
                return "maxWidthHeightTile";
            }
            else {
                return "maxWidthHeightTileFlip";
            }
        }
        if (tree === 5) {
            if (flipped) {
                return "tree5TileFlip";
            }
            else {
                return "tree5Tile";
            }
        }
        if (tree === 6) {
            if (flipped) {
                return "maxWidthHeightTile";
            }
            else {
                return "maxWidthHeightTileFlip";
            }
        }
        if (tree === 7) {
            if (flipped) {
                return "tree5TileFlip";
            }
            else {
                return "tree5Tile";
            }
        }
    }
    function getTreeAfter(tree, isRight) {
        if (isRight) {
            if (tree === 0) {
                return 1;
            }
            if (tree === 1) {
                return 6;
            }
            if (tree === 6) {
                return 7;
            }
            if (tree === 7) {
                return 8;
            }
            return undefined;
        }
        else {
            if (tree === 0) {
                return 2;
            }
            if (tree === 2) {
                return 3;
            }
            if (tree === 3) {
                return 4;
            }
            if (tree === 4) {
                return 5;
            }
            return undefined;
        }
    }
    function isTileFlipped(tile) {
        return tile && tile.orientation === Orientation.RIGHT_LEFT;
    }
    function populateCaches(tree, tileLevel, isRight, parent) {
        if (!game.state || game.state == null) {
            return;
        }
        var board = game.state.board;
        var tile = undefined; //The tile
        if (!board || !board.root) {
            return;
        }
        var flipped = false;
        //if on the first tile, populate both right and left trees and then return
        if (tileLevel === 0) {
            tile = game.state.board.root;
            flipped = isTileFlipped(tile); //Whether or not the tile is flipped
            if (!game.tileCache[tree]) {
                game.treeSourcesCache[tree] = [];
                game.treeClassesCache[tree] = [];
                game.tileCache[tree] = [];
            }
            var image = constructImageUrl(tile === undefined ? undefined : tile);
            var imageClass = getClassForTree(tree, false);
            game.treeSourcesCache[tree][tileLevel] = image;
            game.treeClassesCache[tree][tileLevel] = imageClass;
            game.tileCache[tree][tileLevel] = board.root;
            var nextTree = getTreeAfter(tree, true);
            var nextLevel = game.treeStructure[nextTree][0];
            populateCaches(nextTree, nextLevel, true, board.root);
            nextTree = getTreeAfter(tree, false);
            nextLevel = game.treeStructure[nextTree][0];
            populateCaches(nextTree, nextLevel, false, board.root);
            return;
        }
        tile = isRight ? parent.rightTile : parent.leftTile;
        flipped = isTileFlipped(tile); //Whether or not the tile is flipped
        if (tile === undefined) {
            return;
        }
        var orientation = flipped ? "flipped" : "regular";
        var image = constructImageUrl(tile);
        var imageClass = getClassForTree(tree, orientation === "flipped");
        if (!game.tileCache[tree]) {
            game.treeSourcesCache[tree] = [];
            game.treeClassesCache[tree] = [];
            game.tileCache[tree] = [];
        }
        game.treeSourcesCache[tree][tileLevel] = image;
        game.treeClassesCache[tree][tileLevel] = imageClass;
        game.tileCache[tree][tileLevel] = tile;
        //Set next tile on the tree
        var nextTree;
        var nextLevel;
        //if on last tile
        if (tileLevel === game.treeStructure[tree][game.treeStructure[tree].length - 1]) {
            nextTree = getTreeAfter(tree, isRight);
            nextLevel = nextTree === undefined ? undefined : game.treeStructure[nextTree][0];
        }
        else {
            nextTree = tree;
            nextLevel = tileLevel + 1;
        }
        if (nextTree !== undefined) {
            populateCaches(nextTree, nextLevel, isRight, tile);
        }
    }
    function animationEndedCallback() {
        log.info("Animation ended");
        maybeSendComputerMove();
    }
    function clearAnimationTimeout() {
        if (game.animationEndedTimeout) {
            game.$timeout.cancel(game.animationEndedTimeout);
            game.animationEndedTimeout = null;
        }
    }
    function maybeSendComputerMove() {
        if (!isComputerTurn())
            return;
        var currentMove = {
            endMatchScores: game.currentUpdateUI.endMatchScores,
            state: game.currentUpdateUI.state,
            turnIndex: game.currentUpdateUI.turnIndex,
        };
        var move = aiService.findComputerMove(currentMove);
        log.info("Computer move: ", move);
        makeMove(move);
    }
    function makeMove(move) {
        if (game.didMakeMove) {
            return;
        }
        game.didMakeMove = true;
        if (!game.proposals) {
            gameService.makeMove(move);
        }
        else {
            var delta = move.state.delta;
            var myProposal = {
                data: delta,
                chatDescription: '',
                playerInfo: game.yourPlayerInfo,
            };
            // Decide whether we make a move or not (if we have 2 other proposals supporting the same thing).
            // if (proposals[delta.row][delta.col] < 2) {
            //   move = null;
            // }
            gameService.communityMove(myProposal, move);
        }
    }
    function isFirstMove() {
        return !game.currentUpdateUI.state || game.currentUpdateUI.state == null;
    }
    function yourPlayerIndex() {
        return game.currentUpdateUI.yourPlayerIndex;
    }
    function isComputer() {
        var playerInfo = game.currentUpdateUI.playersInfo[game.currentUpdateUI.yourPlayerIndex];
        // In community games, playersInfo is [].
        return playerInfo && playerInfo.playerId === '';
    }
    function isComputerTurn() {
        return isMyTurn() && isComputer();
    }
    function isHumanTurn() {
        return isMyTurn() && !isComputer();
    }
    function isMyTurn() {
        return !game.didMakeMove &&
            game.currentUpdateUI.turnIndex >= 0 &&
            game.currentUpdateUI.yourPlayerIndex === game.currentUpdateUI.turnIndex; // it's my turn
    }
    function shouldSlowlyAppear(tileIndex) {
        return game.state.delta && game.state.delta.play === Play.BUY &&
            game.state.players[yourPlayerIndex()].hand[tileIndex] === game.state.delta.tileKey;
    }
    game.shouldSlowlyAppear = shouldSlowlyAppear;
    function passPlay() {
        log.info("Clicked to create pass move");
        if (!isHumanTurn())
            return;
        try {
            var play = Play.PASS;
            game.selectedTile = undefined;
            var move = gameLogic.createMove(game.state, game.currentUpdateUI.turnIndex, { play: play });
            log.info("Making move to pass");
            gameService.makeMove(move);
        }
        catch (e) {
            log.info("Cannot make pass play");
            return;
        }
    }
    game.passPlay = passPlay;
    function isRightTree(tree) {
        return (tree === 0 || tree === 1 || tree === 6 || tree === 7 || tree === 8);
    }
    function makeBuyPlay(tileIndex) {
        log.info(["Tried to buy tile:", tileIndex]);
        if (window.location.search === '?throwException') {
            throw new Error("Throwing the error because URL has '?throwException'");
        }
        if (!isHumanTurn() || !game.state || game.state == null ||
            !game.state.house || !game.state.house.hand[tileIndex]) {
            return;
        }
        try {
            var delta = { play: Play.BUY, tileKey: game.state.house.hand[tileIndex].tileKey };
            var move = gameLogic.createMove(game.state, game.currentUpdateUI.turnIndex, delta);
            game.selectedTile = undefined;
            gameService.makeMove(move);
        }
        catch (e) {
            log.info(["Cannot make buy play for tile:", tileIndex]);
            return;
        }
    }
    game.makeBuyPlay = makeBuyPlay;
    function placeTileOnTree(treeId) {
        log.info(["Tried to make play for tree:", treeId]);
        if (window.location.search === '?throwException') {
            throw new Error("Throwing the error because URL has '?throwException'");
        }
        if (!isHumanTurn() || game.selectedTile === undefined) {
            return;
        }
        try {
            var play = isRightTree(treeId) ? Play.RIGHT : Play.LEFT;
            var delta = { play: play, tileKey: game.selectedTile.tileKey };
            var move = gameLogic.createMove(game.state, game.currentUpdateUI.turnIndex, delta);
            game.selectedTile = undefined;
            gameService.makeMove(move);
        }
        catch (e) {
            log.info(["Cannot make play for tree:", treeId]);
            return;
        }
    }
    game.placeTileOnTree = placeTileOnTree;
    /*If tile exists, return the real tile. Otherwise, return blank tile.
    * Also take into consideration that the lower number of the tile is always on the left of the name.
    */
    function constructImageUrl(tile) {
        if (tile === undefined || tile === null) {
            return "imgs/domino-blank.svg";
        }
        return tile.leftNumber <= tile.rightNumber ?
            "imgs/domino-" + tile.leftNumber + "-" + tile.rightNumber + ".svg" :
            "imgs/domino-" + tile.rightNumber + "-" + tile.leftNumber + ".svg";
    }
    //TODO: RETURN FOR GAME END
    function getTileImageSourceForOpponent(playerId, tileId) {
        return constructImageUrl(undefined);
    }
    game.getTileImageSourceForOpponent = getTileImageSourceForOpponent;
    function getTileImageSourceForCurrentPlayer(tileId) {
        return getTileImageSourceForPlayer(yourPlayerIndex(), tileId);
    }
    game.getTileImageSourceForCurrentPlayer = getTileImageSourceForCurrentPlayer;
    function getTileImageSourceForPlayer(playerId, tileId) {
        if (!game.state.players[playerId].hand) {
            return constructImageUrl(undefined);
        }
        return constructImageUrl(game.state.players[playerId].hand[tileId]);
    }
    game.getTileImageSourceForPlayer = getTileImageSourceForPlayer;
    function getOpponentIds() {
        var currentPlayer = yourPlayerIndex();
        var players = game.state.players;
        if (!players) {
            return [];
        }
        var result = [];
        for (var i = 0; i < players.length; i++) {
            if (i == currentPlayer) {
                continue;
            }
            result.push(i);
        }
        return result;
    }
    game.getOpponentIds = getOpponentIds;
    /* Get number of players but exclude current player
    */
    function getNumberOfPlayers() {
        if (!game.state || game.state == null || !game.state.players) {
            return 1;
        }
        return game.state.players.length - 1;
    }
    game.getNumberOfPlayers = getNumberOfPlayers;
    function getPlayerIconSource(player) {
        var imageNumber = player % 2; //2 is chosen because there are only two images.
        if (imageNumber < 0 || imageNumber === -0) {
            imageNumber = 0;
        }
        return "./imgs/image" + imageNumber + ".svg";
    }
    game.getPlayerIconSource = getPlayerIconSource;
    function getCurrentPlayerIconSource(player) {
        return getPlayerIconSource(yourPlayerIndex());
    }
    game.getCurrentPlayerIconSource = getCurrentPlayerIconSource;
    function getArrayUpToNumber(maxNumber) {
        var result = [];
        for (var i = 0; i < maxNumber; i++) {
            result.push(i);
        }
        return result;
    }
    function getNumberOfTilesForBoneYard() {
        if (!game.state.house || !game.state.house.hand) {
            return [];
        }
        return getArrayUpToNumber(game.state.house.hand.length);
    }
    game.getNumberOfTilesForBoneYard = getNumberOfTilesForBoneYard;
    function getNumberOfTilesForCurrentPlayer() {
        return getNumberOfTilesForPlayer(yourPlayerIndex());
    }
    game.getNumberOfTilesForCurrentPlayer = getNumberOfTilesForCurrentPlayer;
    function getNumberOfTilesForPlayer(playerId) {
        if (!game.state.players || !game.state.players[playerId] || !game.state.players[playerId].hand) {
            return [];
        }
        return getArrayUpToNumber(game.state.players[playerId].hand.length);
    }
    game.getNumberOfTilesForPlayer = getNumberOfTilesForPlayer;
    function hasGameEnded() {
        return game.currentUpdateUI.turnIndex < 0 || (game.state.delta && game.state.delta.play === Play.END);
    }
    game.hasGameEnded = hasGameEnded;
    function getFinalScore(player) {
        var scores = game.currentUpdateUI.endMatchScores;
        return "" + scores[player];
    }
    game.getFinalScore = getFinalScore;
    function getCurrentPlayerFinalScore() {
        return getFinalScore(yourPlayerIndex());
    }
    game.getCurrentPlayerFinalScore = getCurrentPlayerFinalScore;
    function getTileAt(tileLevel, tree) {
        if (game.tileCache[tree]) {
            return game.tileCache[tree][tileLevel];
        }
        return undefined;
    }
    /* Decide if tile with this numebr should be shown. The tree parameter defines
    * if we are going left or right
    */
    function shouldShowImage(tileLevel, tree) {
        var tile = getTileAt(tileLevel, tree);
        return !(tile === undefined);
    }
    game.shouldShowImage = shouldShowImage;
    function getImageClass(tileLevel, tree, classForComparison) {
        if (!!game.treeClassesCache[tree] && !!game.treeClassesCache[tree][tileLevel]) {
            return classForComparison === game.treeClassesCache[tree][tileLevel];
        }
        return undefined;
    }
    game.getImageClass = getImageClass;
    /*Get image source for tile at the indicated level on right or left tree*/
    function getImageSource(tileLevel, tree) {
        if (game.treeSourcesCache[tree] && game.treeSourcesCache[tree][tileLevel]) {
            return game.treeSourcesCache[tree][tileLevel];
        }
        return undefined;
    }
    game.getImageSource = getImageSource;
    function canMakeAPlay(playerIndex) {
        if (!game.state.board || !game.state.players || !game.state.players[playerIndex] || !game.state.players[playerIndex].hand) {
            return false;
        }
        var player = game.state.players[playerIndex];
        for (var i = 0; i < player.hand.length; i++) {
            var tile = player.hand[i];
            if (!game.state.board.root) {
                if (tile.leftNumber === tile.rightNumber) {
                    return true;
                }
            }
            else {
                var board = game.state.board;
                if (tile.leftNumber === board.currentLeft || tile.leftNumber === board.currentRight ||
                    tile.rightNumber === board.currentLeft || tile.rightNumber === board.currentRight) {
                    return true;
                }
            }
        }
        return false;
    }
    function canBuy() {
        return game.state.house && game.state.house.hand && game.state.house.hand.length > 0;
    }
    function isPassAllowed() {
        var canStartOrBuy = canMakeAPlay(yourPlayerIndex()) ||
            (canBuy() && game.state.board.root != undefined);
        ;
        return !hasGameEnded() && !canStartOrBuy;
    }
    game.isPassAllowed = isPassAllowed;
    function registerSelectedPlayerTile(tileIndex) {
        game.selectedTile = game.state.players[game.currentUpdateUI.yourPlayerIndex].hand[tileIndex];
    }
    game.registerSelectedPlayerTile = registerSelectedPlayerTile;
    function registerSelectedHouseTile(tileIndex) {
        game.selectedTile = game.state.house.hand[tileIndex];
    }
    game.registerSelectedHouseTile = registerSelectedHouseTile;
    function isSelectedTile(tileIndex) {
        var playerId = yourPlayerIndex();
        var tileKey = game.state.players[playerId] ? game.state.players[playerId].hand[tileIndex] : undefined;
        return game.selectedTile === undefined ? false : game.selectedTile === tileKey;
    }
    game.isSelectedTile = isSelectedTile;
})(game || (game = {}));
angular.module('myApp', ['gameServices'])
    .run(['$rootScope', '$timeout',
    function ($rootScope, $timeout) {
        $rootScope['game'] = game;
        game.init($rootScope, $timeout);
    }]);
//# sourceMappingURL=game.js.map