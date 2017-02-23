module aiService {
  /** Returns the move that the computer player should do for the given state in move. */
  export function findComputerMove(move: IMove): IMove {
    return createComputerMove(move,
        // at most 1 second for the AI to choose a move (but might be much quicker)
        {millisecondsLimit: 1000});
  }

  /**
   * Returns all the possible moves for the given state and turnIndexBeforeMove.
   * Returns an empty array if the game is over.
   */
  export function getPossibleMoves(state: IState, turnIndexBeforeMove: number): IMove[] {
    let possibleMoves: IMove[] = [];

    //This is the initial move
    if (!state) {
      possibleMoves.push(gameLogic.createInitialMove());
      return possibleMoves;
    }

    var board: IBoard = state.board;
    var hand: ITile[] = state.players[turnIndexBeforeMove].hand;

    var leftNumber : number = board.currentLeft;
    var rightNumber : number = board.currentRight;

    var play: Play;
    var delta: BoardDelta;
    for (var i = 0; i < hand.length; i++){
      play = undefined;

      if (!board || !board.root){
        if (hand[i].leftNumber === hand[i].rightNumber){
          play = Play.RIGHT;
        }
      } else {
        play = getPlayBasedOnBoardTiles(hand[i], leftNumber, rightNumber);
      }

      if (play !== undefined){
        delta = { tileKey: hand[i].tileKey, play: play };
        try {
          possibleMoves.push(gameLogic.createMove(state, turnIndexBeforeMove, delta));
        } catch (e) {
          //the move was not possible
        }

      }
    }

    var houseTiles: ITile[] = state.house.hand;

    //In case we did not find any play options
    if (possibleMoves.length === 0) {

      //If this is not the first tile in the game
      if (board.root) {

        //If there are still tiles to buy, make buy play
        if (houseTiles.length > 0) {
          for(var i = 0; i < houseTiles.length; i++) {
            var delta : BoardDelta = { tileKey: houseTiles[i].tileKey, play: Play.BUY };
            try {
              possibleMoves.push(gameLogic.createMove(state, turnIndexBeforeMove, delta));
            } catch (e) {
              //the movie was not possible
            }
          }
        }
        //Otherwise, pass
        else {
          var delta : BoardDelta = { tileKey: undefined, play: Play.PASS };
          try {
            possibleMoves.push(gameLogic.createMove(state, turnIndexBeforeMove, delta));
          } catch (e) {
            //the movie was not possible
          }
        }

      }
      //This is the first tile to be played and we did not find any move options
      else if(hand.length > 0) {
        var delta : BoardDelta = { tileKey: undefined, play: Play.PASS };
        try {
          possibleMoves.push(gameLogic.createMove(state, turnIndexBeforeMove, delta));
        } catch (e) {
          //the movie was not possible
        }
      }
    }

    return possibleMoves;
  }

  function getPlayBasedOnBoardTiles(tile: ITile, leftNumber: number, rightNumber: number): Play {
    if (tile.leftNumber === leftNumber || tile.rightNumber === leftNumber) {
      return Play.LEFT;
    }
    else if (tile.leftNumber === rightNumber || tile.rightNumber ===  rightNumber) {
      return Play.RIGHT;
    }

    return undefined;
  }

  /**
   * Returns the move that the computer player should do for the given state.
   * alphaBetaLimits is an object that sets a limit on the alpha-beta search,
   * and it has either a millisecondsLimit or maxDepth field:
   * millisecondsLimit is a time limit, and maxDepth is a depth limit.
   */
  export function createComputerMove(
      move: IMove, alphaBetaLimits: IAlphaBetaLimits): IMove {
    // We use alpha-beta search, where the search states are TicTacToe moves.
    return alphaBetaService.alphaBetaDecision(
        move, move.turnIndex, getNextStates, getStateScoreForIndex0, null, alphaBetaLimits);
  }

  function getStateScoreForIndex0(move: IMove, playerIndex: number): number {
    let endMatchScores = move.endMatchScores;
    if (endMatchScores) {
      return endMatchScores[0] > endMatchScores[1] ? Number.POSITIVE_INFINITY
          : endMatchScores[0] < endMatchScores[1] ? Number.NEGATIVE_INFINITY
          : 0;
    }
    return 0;
  }

  function getNextStates(move: IMove, playerIndex: number): IMove[] {
    return getPossibleMoves(move.state, playerIndex);
  }
}
