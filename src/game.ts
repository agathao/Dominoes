interface SupportedLanguages {
  en: string, iw: string,
  pt: string, zh: string,
  el: string, fr: string,
  hi: string, es: string,
};

interface Translations {
  [index: string]: SupportedLanguages;
}

module game {
  export let $rootScope: angular.IScope = null;
  export let $timeout: angular.ITimeoutService = null;

  // Global variables are cleared when getting updateUI.
  // I export all variables to make it easy to debug in the browser by
  // simply typing in the console, e.g.,
  // game.currentUpdateUI
  export let currentUpdateUI: IUpdateUI = null;
  export let didMakeMove: boolean = false; // You can only make one move per updateUI
  export let animationEndedTimeout: ng.IPromise<any> = null;
  export let state: IState = null;
  // For community games.
  export let proposals: number[][] = null;
  export let yourPlayerInfo: IPlayerInfo = null;

  export let treeStructure: number[][] = [
    [0], //tree0
    [1, 2, 3, 4, 5, 6, 7], //tree1
    [1, 2, 3, 4, 5, 6], //tree2
    [7], //tree3
    [8], //tree4
    [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22], //tree5
    [8], //tree6
    [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22] //tree7
  ];
  export let treeSourcesCache: string[][] = [];
  export let treeClassesCache: string[][] = [];
  export let tileCache: ITile[][] = [];

  export let selectedTile: ITile = undefined; //The tile currently selected for play

  export function init($rootScope_: angular.IScope, $timeout_: angular.ITimeoutService) {
    $rootScope = $rootScope_;
    $timeout = $timeout_;
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

  function registerServiceWorker() {
    // I prefer to use appCache over serviceWorker
    // (because iOS doesn't support serviceWorker, so we have to use appCache)
    // I've added this code for a future where all browsers support serviceWorker (so we can deprecate appCache!)
    if (!window.applicationCache && 'serviceWorker' in navigator) {
      let n: any = navigator;
      log.log('Calling serviceWorker.register');
      n.serviceWorker.register('service-worker.js').then(function(registration: any) {
        log.log('ServiceWorker registration successful with scope: ',    registration.scope);
      }).catch(function(err: any) {
        log.log('ServiceWorker registration failed: ', err);
      });
    }
  }

  function getTranslations(): Translations {
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

  export function communityUI(communityUI: ICommunityUI) {
    log.info("Game got communityUI:", communityUI);
    // If only proposals changed, then do NOT call updateUI. Then update proposals.
    let nextUpdateUI: IUpdateUI = {
        playersInfo: [],
        playMode: communityUI.yourPlayerIndex,
        numberOfPlayers: communityUI.numberOfPlayers,
        state: communityUI.state,
        turnIndex: communityUI.turnIndex,
        endMatchScores: communityUI.endMatchScores,
        yourPlayerIndex: communityUI.yourPlayerIndex,
      };
    if (angular.equals(yourPlayerInfo, communityUI.yourPlayerInfo) &&
        currentUpdateUI && angular.equals(currentUpdateUI, nextUpdateUI)) {
      // We're not calling updateUI to avoid disrupting the player if he's in the middle of a move.
    } else {
      // Things changed, so call updateUI.
      updateUI(nextUpdateUI);
    }
    // This must be after calling updateUI, because we nullify things there (like playerIdToProposal&proposals&etc)
    yourPlayerInfo = communityUI.yourPlayerInfo;
    let playerIdToProposal = communityUI.playerIdToProposal;
    didMakeMove = !!playerIdToProposal[communityUI.yourPlayerInfo.playerId];
    proposals = [];
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
  export function isProposal(row: number, col: number) {
    return proposals && proposals[row][col] > 0;
  }
  export function isProposal1(row: number, col: number) {
    return proposals && proposals[row][col] == 1;
  }
  export function isProposal2(row: number, col: number) {
    return proposals && proposals[row][col] == 2;
  }

  export function updateUI(params: IUpdateUI): void {

    selectedTile = undefined; //TODO: might be able to remove this

    log.info("Dominoes game got updateUI:", params);
    didMakeMove = false; // Only one move per updateUI
    currentUpdateUI = params;

    state = params.state;
    if (isFirstMove()) {
      state = gameLogic.getInitialState();
    }
    populateCaches(0, 0, undefined, undefined);

    //TODO if needed: If the state exists and it is a reveal play, create an end of game play
    //TODO if needed: if the previous play was a pass move, and the current play was also a pass move,

    // We calculate the AI move only after the animation finishes,
    // because if we call aiService now
    // then the animation will be paused until the javascript finishes.
    animationEndedTimeout = $timeout(animationEndedCallback, 500);
  }

  function getClassForTree(tree: number, flipped: boolean): string {

    if (tree === 0) { return "rootTile"; }

    if (tree === 1 || tree === 2) {
      if (flipped) { return "horizontalTile"; }
      return "horizontalTileFlip";
    }

    if (tree === 3 || tree === 4) {
      if (flipped){ return "maxWidthHeightTile"; }
      else { return "maxWidthHeightTileFlip"; }
    }

    if (tree === 5) {
      if (flipped){ return "tree5TileFlip"; }
      else { return "tree5Tile"; }
    }

    if (tree === 6) {
      if (flipped){ return "maxWidthHeightTile"; }
      else { return "maxWidthHeightTileFlip"; }
    }

    if (tree === 7) {
      if (flipped){ return "tree5TileFlip"; }
      else { return "tree5Tile"; }
    }
  }

  function getTreeAfter(tree: number, isRight: boolean):number {
    if (isRight) {
      if (tree === 0){ return 1;}
      if (tree === 1){ return 6;}
      if (tree === 6){ return 7;}
      if (tree === 7){ return 8;}

      return undefined;
    }
    else {
      if (tree === 0){ return 2;}
      if (tree === 2){ return 3;}
      if (tree === 3){ return 4;}
      if (tree === 4){ return 5;}

      return undefined;
    }
  }

  function isTileFlipped(tile: ITile) : boolean {
    return tile && tile.orientation === Orientation.RIGHT_LEFT;
  }

  function populateCaches(tree: number, tileLevel: number, isRight: boolean, parent: ITile) {

    if(!state || state == null) {
      return;
    }
    var board: IBoard = state.board;

    var tile: ITile = undefined; //The tile

    if (!board || !board.root){ return; }

    var flipped: boolean = false;

    //if on the first tile, populate both right and left trees and then return
    if (tileLevel === 0)
    {
      tile = state.board.root;
      flipped = isTileFlipped(tile); //Whether or not the tile is flipped

      if (!tileCache[tree]) {
        treeSourcesCache[tree] = [];
        treeClassesCache[tree] = [];
        tileCache[tree] = [];
      }
      var image: string = constructImageUrl(tile === undefined ? undefined : tile);
      var imageClass: string = getClassForTree(tree, false);

      treeSourcesCache[tree][tileLevel] = image;
      treeClassesCache[tree][tileLevel] = imageClass;
      tileCache[tree][tileLevel] = board.root;

      var nextTree = getTreeAfter(tree, true);
      var nextLevel = treeStructure[nextTree][0];

      populateCaches(nextTree, nextLevel, true, board.root);

      nextTree = getTreeAfter(tree, false);
      nextLevel = treeStructure[nextTree][0];
      populateCaches(nextTree, nextLevel, false, board.root);

      return;
    }

    tile = isRight ? parent.rightTile : parent.leftTile;
    flipped = isTileFlipped(tile); //Whether or not the tile is flipped

    if (tile === undefined) {
      return;
    }

    var orientation: string = flipped ? "flipped" : "regular";
    var image: string = constructImageUrl(tile);
    var imageClass: string = getClassForTree(tree, orientation === "flipped");

    if (!tileCache[tree]) {
      treeSourcesCache[tree] = [];
      treeClassesCache[tree] = [];
      tileCache[tree] = [];
    }

    treeSourcesCache[tree][tileLevel] = image;
    treeClassesCache[tree][tileLevel] = imageClass;
    tileCache[tree][tileLevel] = tile;

    //Set next tile on the tree
    var nextTree: number;
    var nextLevel: number;
    //if on last tile
    if (tileLevel === treeStructure[tree][treeStructure[tree].length - 1]) {
      nextTree = getTreeAfter(tree, isRight);
      nextLevel = nextTree === undefined ? undefined : treeStructure[nextTree][0];
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
    if (animationEndedTimeout) {
      $timeout.cancel(animationEndedTimeout);
      animationEndedTimeout = null;
    }
  }

  function maybeSendComputerMove() {
    if (!isComputerTurn()) return;
    let currentMove:IMove = {
      endMatchScores: currentUpdateUI.endMatchScores,
      state: currentUpdateUI.state,
      turnIndex: currentUpdateUI.turnIndex,
    }
    let move = aiService.findComputerMove(currentMove);
    log.info("Computer move: ", move);
    makeMove(move);
  }

  function makeMove(move: IMove) {
    if (didMakeMove) { // Only one move per updateUI
      return;
    }
    didMakeMove = true;

    if (!proposals) {
      gameService.makeMove(move);
    } else {
      let delta = move.state.delta;
      let myProposal:IProposal = {
        data: delta,
        chatDescription: '',//+ (delta.row + 1) + 'x' + (delta.col + 1),
        playerInfo: yourPlayerInfo,
      };
      // Decide whether we make a move or not (if we have 2 other proposals supporting the same thing).
      // if (proposals[delta.row][delta.col] < 2) {
      //   move = null;
      // }
      gameService.communityMove(myProposal, move);
    }
  }

  function isFirstMove() {
    return !currentUpdateUI.state || currentUpdateUI.state == null;
  }

  function yourPlayerIndex() {
    return currentUpdateUI.yourPlayerIndex;
  }

  function isComputer() {
    let playerInfo = currentUpdateUI.playersInfo[currentUpdateUI.yourPlayerIndex];
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
    return !didMakeMove && // you can only make one move per updateUI.
      currentUpdateUI.turnIndex >= 0 && // game is ongoing
      currentUpdateUI.yourPlayerIndex === currentUpdateUI.turnIndex; // it's my turn
  }

  export function shouldSlowlyAppear(tileIndex: number): boolean
  {
    return state.delta && state.delta.play === Play.BUY &&
      state.players[yourPlayerIndex()].hand[tileIndex] === state.delta.tileKey;
  }

  export function passPlay():void {
    log.info("Clicked to create pass move");
    if (!isHumanTurn()) return;

    try {
      let play = Play.PASS;
      selectedTile = undefined;
      let move = gameLogic.createMove(state, currentUpdateUI.turnIndex, {play: play});
      log.info("Making move to pass");
      gameService.makeMove(move);
    } catch (e) {
      log.info("Cannot make pass play");
      return;
    }
  }

  function isRightTree(tree: number): boolean {
    return (tree === 0 || tree === 1 || tree === 6 || tree === 7 || tree === 8);
  }

  export function makeBuyPlay(tileIndex: number)
  {
    log.info(["Tried to buy tile:", tileIndex]);

    if (window.location.search === '?throwException') { // to test encoding a stack trace with sourcemap
      throw new Error("Throwing the error because URL has '?throwException'");
    }
    if (!isHumanTurn() || !state || state == null ||
      !state.house || !state.house.hand[tileIndex]) { return; }

    try
    {
      let delta : BoardDelta = {play: Play.BUY, tileKey: state.house.hand[tileIndex].tileKey};
      let move : IMove = gameLogic.createMove(state, currentUpdateUI.turnIndex, delta);
      selectedTile = undefined;
      gameService.makeMove(move);

    } catch (e) {
      log.info(["Cannot make buy play for tile:", tileIndex]);
      return;
    }
  }

  export function placeTileOnTree(treeId: number): void {
    log.info(["Tried to make play for tree:", treeId]);
    if (window.location.search === '?throwException') { // to test encoding a stack trace with sourcemap
      throw new Error("Throwing the error because URL has '?throwException'");
    }
    if (!isHumanTurn() || selectedTile === undefined) { return; }

    try {
      let play : Play = isRightTree(treeId) ? Play.RIGHT : Play.LEFT;
      let delta : BoardDelta = { play: play, tileKey: selectedTile.tileKey };
      let move = gameLogic.createMove(state, currentUpdateUI.turnIndex, delta);
      selectedTile = undefined;
      gameService.makeMove(move);
    } catch (e) {
      log.info(["Cannot make play for tree:", treeId]);
      return;
    }
  }

  /*If tile exists, return the real tile. Otherwise, return blank tile.
  * Also take into consideration that the lower number of the tile is always on the left of the name.
  */
  function constructImageUrl(tile: ITile) : string {
    if (tile === undefined || tile === null) {
        return "imgs/domino-blank.svg";
    }

    return tile.leftNumber <= tile.rightNumber ?
      "imgs/domino-" + tile.leftNumber + "-" + tile.rightNumber + ".svg" :
      "imgs/domino-" + tile.rightNumber + "-" + tile.leftNumber + ".svg";
  }

  //TODO: RETURN FOR GAME END
  export function getTileImageSourceForOpponent(playerId: number, tileId: number): string {
    return constructImageUrl(undefined);
  }

  export function getTileImageSourceForCurrentPlayer(tileId: number): string {
    return getTileImageSourceForPlayer(yourPlayerIndex(), tileId);
  }

  export function getTileImageSourceForPlayer(playerId: number, tileId: number): string {
    if (!state.players[playerId].hand) { return constructImageUrl(undefined); }

    return constructImageUrl(state.players[playerId].hand[tileId]);
  }

  export function getOpponentIds(): number[] {
    var currentPlayer: number = yourPlayerIndex();
    var players = state.players;
    if (!players) { return []; }

    var result: number[] = [];
    for (var i = 0; i < players.length; i++) {
      if (i == currentPlayer) { continue; }
      result.push(i);
    }

    return result;
  }

  /* Get number of players but exclude current player
  */
export function getNumberOfPlayers(): number {
  if (!state || state == null || !state.players) {
    return 1;
  }

  return state.players.length - 1;
}

export function getPlayerIconSource(player: number): string {
    var imageNumber = player % 2; //2 is chosen because there are only two images.
    if (imageNumber < 0 || imageNumber === -0){ imageNumber = 0; }

    return "./imgs/image" + imageNumber + ".svg";
}

export function getCurrentPlayerIconSource(player: number): string {
    return getPlayerIconSource(yourPlayerIndex());
}

function getArrayUpToNumber(maxNumber: number): number[] {

    var result: number[] = [];
    for (var i = 0; i < maxNumber; i++) {
      result.push(i);
    }

    return result;
}

export function getNumberOfTilesForBoneYard(): number[] {
    if (!state.house || !state.house.hand) {
      return [];
    }

    return getArrayUpToNumber(state.house.hand.length);
}

export function getNumberOfTilesForCurrentPlayer(): number[] {
  return getNumberOfTilesForPlayer(yourPlayerIndex());
}

export function getNumberOfTilesForPlayer(playerId: number): number[] {
   if (!state.players || !state.players[playerId] || !state.players[playerId].hand){
     return [];
   }

   return getArrayUpToNumber(state.players[playerId].hand.length);
}

export function hasGameEnded() : boolean {
  return currentUpdateUI.turnIndex < 0 || (state.delta && state.delta.play === Play.END);
}

export function getFinalScore(player: number): string{
    var scores:number[] = currentUpdateUI.endMatchScores;
    return "" + scores[player];
}

export function getCurrentPlayerFinalScore(): string{
    return getFinalScore(yourPlayerIndex());
}

function getTileAt(tileLevel: number, tree: number): ITile {
    if (tileCache[tree]) {
      return tileCache[tree][tileLevel];
    }

    return undefined;
}

/* Decide if tile with this numebr should be shown. The tree parameter defines
* if we are going left or right
*/
export function shouldShowImage(tileLevel: number, tree: number): boolean {
  var tile = getTileAt(tileLevel, tree);
  return !(tile === undefined);
}

export function getImageClass(tileLevel: number, tree: number, classForComparison: string): boolean {

    if (!!treeClassesCache[tree] && !!treeClassesCache[tree][tileLevel]) {
      return classForComparison === treeClassesCache[tree][tileLevel];
    }

    return undefined;
}

/*Get image source for tile at the indicated level on right or left tree*/
  export function getImageSource(tileLevel: number, tree: number): string {

    if (treeSourcesCache[tree] && treeSourcesCache[tree][tileLevel]) {
      return treeSourcesCache[tree][tileLevel];
    }

    return undefined;
  }

  function canMakeAPlay(playerIndex: number): boolean {
    if (!state.board || !state.players || !state.players[playerIndex] || !state.players[playerIndex].hand) {
          return false;
    }

    var player: IPlayer = state.players[playerIndex];
    for (var i = 0; i < player.hand.length; i++) {
      var tile: ITile = player.hand[i];
      if(!state.board.root) {
        if (tile.leftNumber === tile.rightNumber) {
          return true;
        }
      } else {
        var board = state.board;
        if(tile.leftNumber === board.currentLeft || tile.leftNumber === board.currentRight ||
          tile.rightNumber === board.currentLeft || tile.rightNumber === board.currentRight) {
            return true;
          }
      }
    }

    return false;
  }

  function canBuy(): boolean {
    return state.house && state.house.hand && state.house.hand.length > 0;
  }

  export function isPassAllowed(): boolean {
    var canStartOrBuy: boolean = canMakeAPlay(yourPlayerIndex()) ||
      (canBuy() && state.board.root != undefined);
                    ;
    return !hasGameEnded() && !canStartOrBuy;
  }

  export function registerSelectedPlayerTile(tileIndex: number) {
    selectedTile = state.players[currentUpdateUI.yourPlayerIndex].hand[tileIndex];
  }

  export function registerSelectedHouseTile(tileIndex: number) {
    selectedTile = state.house.hand[tileIndex];
  }

  export function isSelectedTile(tileIndex: number): boolean {
    var playerId : number = yourPlayerIndex();
   var tileKey = state.players[playerId] ? state.players[playerId].hand[tileIndex] : undefined;
   return selectedTile === undefined ? false : selectedTile === tileKey;
 }

}

angular.module('myApp', ['gameServices'])
  .run(['$rootScope', '$timeout',
    function ($rootScope: angular.IScope, $timeout: angular.ITimeoutService) {
      $rootScope['game'] = game;
      game.init($rootScope, $timeout);
    }]);
