enum Orientation {
  LEFT_RIGHT, RIGHT_LEFT
}

interface ITile {
  tileKey?: string;
  leftNumber?:number;
  rightNumber?:number;
  leftTile?: ITile;
  rightTile?: ITile;
  orientation?: Orientation;
}

/*The domino board is stored as a binary tree. Children are added either to the
*left most position or the right most, since on the game rules, the dominos are
*only played to the left or the right. The tree is represented as a linked list.
*/
interface IBoard {
  root: ITile;
  leftMostTile?: ITile; //the left most tile
  rightMostTile?: ITile; //the right most tile
  currentLeft: number;
  currentRight: number;
}

enum Play {
  LEFT, RIGHT, BUY, PASS, END
}

interface BoardDelta {
  tileKey?: string;
  play: Play;
}

interface IPlayer {
  id: number;
  hand: ITile[];
}

interface IState {
  board?: IBoard;
  delta?: BoardDelta;
  players?: IPlayer[];
  house?: IPlayer;
}

type IProposalData = BoardDelta;

import gameService = gamingPlatform.gameService;
import alphaBetaService = gamingPlatform.alphaBetaService;
import translate = gamingPlatform.translate;
import resizeGameAreaService = gamingPlatform.resizeGameAreaService;
import log = gamingPlatform.log;
import dragAndDropService = gamingPlatform.dragAndDropService;

module gameLogic {

  function setBoardRoot(board: IBoard, tile: ITile){
    board.root = tile;
    board.leftMostTile = tile;
    board.rightMostTile = tile;
    board.currentRight = tile.rightNumber;
    board.currentLeft = tile.leftNumber;
  }

  function addTileToTheRight(board: IBoard, playedTile: ITile){
    var previousRightTile : ITile = board.root;
    while(previousRightTile.tileKey != board.rightMostTile.tileKey) {
      previousRightTile = previousRightTile.rightTile;
    }

    previousRightTile.rightTile = playedTile;
    board.rightMostTile = playedTile;

    if(board.currentRight == playedTile.leftNumber) {
        playedTile.orientation = Orientation.LEFT_RIGHT;
        board.currentRight = playedTile.rightNumber;
    } else {
        playedTile.orientation = Orientation.RIGHT_LEFT;
        board.currentRight = playedTile.leftNumber;
    }
  }

  function addTileToTheLeft(board: IBoard, playedTile: ITile){
    var previousLeftTile : ITile = board.root;
    while(previousLeftTile.tileKey != board.leftMostTile.tileKey) {
      previousLeftTile = previousLeftTile.leftTile;
    }

    previousLeftTile.leftTile = playedTile;
    board.leftMostTile = playedTile;

    if(board.currentLeft == playedTile.leftNumber) {
        playedTile.orientation = Orientation.RIGHT_LEFT;
        board.currentLeft = playedTile.rightNumber;
    } else {
        playedTile.orientation = Orientation.LEFT_RIGHT;
        board.currentLeft = playedTile.leftNumber;
    }
  }

  function addTileToHand(player: IPlayer, tile: ITile){
    player.hand.unshift(tile);
  }

  function removeTileFromHand(player: IPlayer, tileKey: string)
  {
    var index: number = player.hand.map(function(t) { return t.tileKey; }).indexOf(tileKey);
    if (index !== undefined && index !== -1) {
      player.hand.splice(index, 1);
    }
    else {
      throw new Error("Unknown tile " + JSON.stringify(tileKey));
    }
  }

  function getNumberOfRemainingTiles(player: IPlayer):number {
    return player.hand.length;
  }

  /** Returns the initial Dominoes board. */
  export function getInitialBoard(): IBoard {
    return <IBoard>{};
  }

  function shuffle(tiles: ITile[]) {
    var j, x, i;
    for (i = tiles.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = tiles[i - 1];
        tiles[i - 1] = tiles[j];
        tiles[j] = x;
    }
 }

  export function getInitialState(): IState {
    var players: IPlayer[] = [],
        house: IPlayer = {id: -1, hand: []},
        numOfPlayers: number = 2,
        i: number = 0,
        j: number = 0,
        k: number = 0,
        assignedTiles: number = 0,
        currentPlayerIndex: number = 0,
        tiles: ITile[] = [];

    //Create tiles
    for (i = 0; i < 7; i++){
      for (j = 0; j <= i; j++) {
        var currentTile: ITile = {tileKey: 'tile' + k, leftNumber: j, rightNumber: i};
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

    for(i = 0; i < tiles.length; i++) {
      if(currentPlayerIndex < numOfPlayers){
        if (!players[currentPlayerIndex]) {
          players[currentPlayerIndex] = <IPlayer>{ id: currentPlayerIndex, hand: [] };
        }
        players[currentPlayerIndex].hand.push(tiles[i]);
        assignedTiles++;

        if (assignedTiles === tilesToAssign) {
            currentPlayerIndex++;
            assignedTiles = 0;
        }
      } else {
        house.hand.push(tiles[i]);
      }
    }
    return {board: getInitialBoard(), delta: null, players: players, house: house};
  }

  function getTileFromKey(tiles: ITile[], key: string): ITile {
    var index: number = tiles.map(function(t) { return t.tileKey; }).indexOf(key);
    return tiles[index];

  }

  function hasWon(currentPlayer: IPlayer): boolean {
    return getNumberOfRemainingTiles(currentPlayer) === 0;
  }

  function getGenericMove(turn: number, state: IState): IMove {
    return {turnIndex: turn, state: state, endMatchScores: null};
  }

  function getRemainingPoints(player: IPlayer): number {
    var tile: ITile,
    points: number = 0;

    for (var i = 0; i < player.hand.length; i++) {
      points = points + player.hand[i].leftNumber + player.hand[i].rightNumber;
    }

    return points;
  }

  function validateTiles(tile: ITile, currentNumber: number) {
    if (tile.rightNumber !== currentNumber && tile.leftNumber !== currentNumber) {
      throw new Error("Cannot place tile at the board! Numbers are invalid.");
    }
  }

  function getEndMatchScores(players: IPlayer[]): number[] {

    var remainingPoints: number[] = [],
    numberOfPlayers: number = players.length,
    min: number = 336,
    minPlayer: number = -1,
    totalPoints: number = 0;

    for (var i = 0; i < numberOfPlayers; i++) {
      remainingPoints[i] = getRemainingPoints(players[i]);
      totalPoints = totalPoints + remainingPoints[i];

      if (remainingPoints[i] < min) {
        min = remainingPoints[i];
        minPlayer = i;
      }
    }

    var endScores: number[] = [];
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

  function createMoveEndGame(board: IBoard, delta: BoardDelta, players: IPlayer[],
    house: IPlayer, turnIndexBeforeMove: number): IMove {
    var state = { board: board, delta: delta, players: players, house: house };
    return {endMatchScores: getEndMatchScores(state.players), turnIndex: -1, state: state};
  }

  function canPlayATile(tiles: ITile[], board: IBoard) : boolean {
    for(var i = 0; i < tiles.length; i++) {
      var tile : ITile = tiles[i];
      //This is the first tile
      if(!board.root) {
        if (tile.leftNumber == tile.rightNumber) {
          return true;
        }
      } else if(tile.leftNumber === board.currentLeft || tile.rightNumber === board.currentRight) {
        return true;
      }
    }

    return false;
  }

  /**
   * In this case we pass the turn to the next player
   */
  function createMovePass(board: IBoard, delta: BoardDelta, players: IPlayer[], house: IPlayer,
    turnIndexBeforeMove: number) : IMove {
    var state: IState = { board: board, delta: delta, players: players, house: house };
    var turnIndex : number = (turnIndexBeforeMove + 1) % state.players.length;

    if(canPlayATile(players[turnIndexBeforeMove].hand, board)) {
      throw new Error("Player should play and not pass");
    } //House is not empty and this is not the first tile
    else if(house.hand && house.hand.length > 0 && board.root) {
      throw new Error("Player should buy and not pass");
    }

    var canAnyonePlay : boolean = false;
    for(var i = 0; i < players.length; i++) {
      if(canPlayATile(players[i].hand, board)) {
        canAnyonePlay = true;
        break;
      }
    }

    if(canAnyonePlay) {
      return getGenericMove(turnIndex, state);
    } else {
      return createMoveEndGame(board, delta, players, house, turnIndexBeforeMove);
    }

  }

  /*
   * In this case, the domino tile should be removed from the house and added to the player's hand.
   */
  function createMoveBuy(board: IBoard, delta: BoardDelta, players: IPlayer[], house: IPlayer,
    turnIndexBeforeMove: number): IMove {

    if (getNumberOfRemainingTiles(house) === 0) {
      throw new Error("One cannot buy from the house when it has no tiles");
    }

    var tile: ITile = getTileFromKey(house.hand, delta.tileKey);
    removeTileFromHand(house, delta.tileKey);
    addTileToHand(players[turnIndexBeforeMove], tile);

    var state: IState = { board: board, delta: delta, players: players, house: house };
    return {endMatchScores: null, turnIndex: turnIndexBeforeMove, state: state};
  }

  function createMovePlay(board: IBoard, delta: BoardDelta, players: IPlayer[], house: IPlayer,
    turnIndexBeforeMove: number): IMove {

    var operations: IMove,
    numberOfPlayers = players.length,
    playedTile: ITile = getTileFromKey(players[turnIndexBeforeMove].hand, delta.tileKey);

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
      var rightTile: number = board.currentRight;
      validateTiles(playedTile, rightTile);
      addTileToTheRight(board, playedTile);
    }
    else { //Play.LEFT
      var leftTile: number = board.currentLeft;
      validateTiles(playedTile, leftTile);
      addTileToTheLeft(board, playedTile);
    }

    removeTileFromHand(players[turnIndexBeforeMove], delta.tileKey);

    var state : IState = { board: board, delta: delta, players: players, house: house };
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
  export function createMove(stateBeforeMove: IState, turnIndexBeforeMove: number,
    delta: BoardDelta): IMove {

      if (!stateBeforeMove) {
        stateBeforeMove = getInitialState();
      }

      var operations: IMove,
          boardAfterMove: IBoard,
          playersAfterMove: IPlayer[],
          playerAfterMove: IPlayer,
          houseAfterMove: IPlayer,
          playedTileKey: string = !(delta) ? undefined : delta.tileKey,
          play: Play = delta === undefined ? undefined : delta.play,
          players: IPlayer[] = stateBeforeMove.players,
          house: IPlayer = stateBeforeMove.house,
          board: IBoard = stateBeforeMove.board;

      boardAfterMove = angular.copy(board);
      playersAfterMove = angular.copy(players);
      playerAfterMove = angular.copy(players[turnIndexBeforeMove]);
      houseAfterMove = angular.copy(house);

      var finalMove: IMove;

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
      else if(Play.END === play) {
        var stateAfterMove : IState = angular.copy(stateBeforeMove);
        return createMoveEndGame(boardAfterMove, delta, playersAfterMove, houseAfterMove, turnIndexBeforeMove);
      }
      else {
        throw new Error("Unknown play");
      }

  }

  export function createInitialMove(): IMove {
    return {endMatchScores: null, turnIndex: 0,
        state: getInitialState()};
  }

  export function forSimpleTestHtml() {
    var move = gameLogic.createInitialMove();
    log.log("move=", move);
  }
}
