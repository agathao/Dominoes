describe("In Dominoes", function () {
    function expectException(turnIndexBeforeMove, stateBeforeMove, delta) {
        // We expect an exception to be thrown :)
        var didThrowException = false;
        try {
            gameLogic.createMove(stateBeforeMove, turnIndexBeforeMove, delta);
        }
        catch (e) {
            didThrowException = true;
        }
        if (!didThrowException) {
            throw new Error("We expect an illegal move, but createMove didn't throw any exception!");
        }
    }
    function expectMove(turnIndexBeforeMove, stateBeforeMove, delta, stateAfterMove, turnIndexAfterMove, endMatchScores) {
        var expectedMove = {
            turnIndex: turnIndexAfterMove,
            endMatchScores: endMatchScores,
            state: stateAfterMove
        };
        var move = gameLogic.createMove(stateBeforeMove, turnIndexBeforeMove, delta);
        expect(angular.equals(move, expectedMove)).toBe(true);
        // expect(move).toBeNull();
    }
    it("Initial move", function () {
        var move = gameLogic.createInitialMove();
        expect(move.endMatchScores).toBeNull();
        expect(angular.equals(move.turnIndex, 0)).toBe(true);
        var state = move.state;
        expect(state.delta).toBeNull();
        var players = state.players;
        expect(players).toBeDefined();
        expect(angular.equals(players.length, 2)).toBe(true);
        expect(angular.equals(players[0].hand.length, 7)).toBe(true);
        expect(angular.equals(players[1].hand.length, 7)).toBe(true);
        var house = state.house;
        expect(house).toBeDefined();
        expect(angular.equals(house.hand.length, 14)).toBe(true);
        expect(state.board).toBeDefined();
    });
    it("Place first tile in the game", function () {
        var stateBeforeMove = { board: {},
            delta: null,
            players: [{ id: 0, hand: [{ tileKey: 'tile8', leftNumber: 2, rightNumber: 3 }, { tileKey: 'tile25', leftNumber: 4, rightNumber: 6 }, { tileKey: 'tile3', leftNumber: 0, rightNumber: 2 }, { tileKey: 'tile2', leftNumber: 1, rightNumber: 1 }, { tileKey: 'tile9', leftNumber: 3, rightNumber: 3 }, { tileKey: 'tile7', leftNumber: 1, rightNumber: 3 }, { tileKey: 'tile15', leftNumber: 0, rightNumber: 5 }] },
                { id: 1, hand: [{ tileKey: 'tile16', leftNumber: 1, rightNumber: 5 }, { tileKey: 'tile18', leftNumber: 3, rightNumber: 5 }, { tileKey: 'tile17', leftNumber: 2, rightNumber: 5 }, { tileKey: 'tile6', leftNumber: 0, rightNumber: 3 }, { tileKey: 'tile21', leftNumber: 0, rightNumber: 6 }, { tileKey: 'tile14', leftNumber: 4, rightNumber: 4 }, { tileKey: 'tile26', leftNumber: 5, rightNumber: 6 }] }],
            house: { id: -1, hand: [{ tileKey: 'tile1', leftNumber: 0, rightNumber: 1 }, { tileKey: 'tile11', leftNumber: 1, rightNumber: 4 }, { tileKey: 'tile20', leftNumber: 5, rightNumber: 5 }, { tileKey: 'tile0', leftNumber: 0, rightNumber: 0 }, { tileKey: 'tile13', leftNumber: 3, rightNumber: 4 }, { tileKey: 'tile22', leftNumber: 1, rightNumber: 6 }, { tileKey: 'tile5', leftNumber: 2, rightNumber: 2 }, { tileKey: 'tile24', leftNumber: 3, rightNumber: 6 }, { tileKey: 'tile12', leftNumber: 2, rightNumber: 4 }, { tileKey: 'tile10', leftNumber: 0, rightNumber: 4 }, { tileKey: 'tile4', leftNumber: 1, rightNumber: 2 }, { tileKey: 'tile19', leftNumber: 4, rightNumber: 5 }, { tileKey: 'tile27', leftNumber: 6, rightNumber: 6 }, { tileKey: 'tile23', leftNumber: 2, rightNumber: 6 }] } };
        var delta = { play: Play.RIGHT, tileKey: 'tile2' };
        var stateAfterMove = { board: { root: { tileKey: 'tile2', leftNumber: 1, rightNumber: 1 },
                leftMostTile: { tileKey: 'tile2', leftNumber: 1, rightNumber: 1 },
                rightMostTile: { tileKey: 'tile2', leftNumber: 1, rightNumber: 1 },
                currentRight: 1, currentLeft: 1 },
            delta: { play: 1, tileKey: 'tile2' },
            players: [{ id: 0, hand: [{ tileKey: 'tile8', leftNumber: 2, rightNumber: 3 }, { tileKey: 'tile25', leftNumber: 4, rightNumber: 6 }, { tileKey: 'tile3', leftNumber: 0, rightNumber: 2 }, { tileKey: 'tile9', leftNumber: 3, rightNumber: 3 }, { tileKey: 'tile7', leftNumber: 1, rightNumber: 3 }, { tileKey: 'tile15', leftNumber: 0, rightNumber: 5 }] },
                { id: 1, hand: [{ tileKey: 'tile16', leftNumber: 1, rightNumber: 5 }, { tileKey: 'tile18', leftNumber: 3, rightNumber: 5 }, { tileKey: 'tile17', leftNumber: 2, rightNumber: 5 }, { tileKey: 'tile6', leftNumber: 0, rightNumber: 3 }, { tileKey: 'tile21', leftNumber: 0, rightNumber: 6 }, { tileKey: 'tile14', leftNumber: 4, rightNumber: 4 }, { tileKey: 'tile26', leftNumber: 5, rightNumber: 6 }] }],
            house: { id: -1, hand: [{ tileKey: 'tile1', leftNumber: 0, rightNumber: 1 }, { tileKey: 'tile11', leftNumber: 1, rightNumber: 4 }, { tileKey: 'tile20', leftNumber: 5, rightNumber: 5 }, { tileKey: 'tile0', leftNumber: 0, rightNumber: 0 }, { tileKey: 'tile13', leftNumber: 3, rightNumber: 4 }, { tileKey: 'tile22', leftNumber: 1, rightNumber: 6 }, { tileKey: 'tile5', leftNumber: 2, rightNumber: 2 }, { tileKey: 'tile24', leftNumber: 3, rightNumber: 6 }, { tileKey: 'tile12', leftNumber: 2, rightNumber: 4 }, { tileKey: 'tile10', leftNumber: 0, rightNumber: 4 }, { tileKey: 'tile4', leftNumber: 1, rightNumber: 2 }, { tileKey: 'tile19', leftNumber: 4, rightNumber: 5 }, { tileKey: 'tile27', leftNumber: 6, rightNumber: 6 }, { tileKey: 'tile23', leftNumber: 2, rightNumber: 6 }] } };
        expectMove(0, stateBeforeMove, delta, stateAfterMove, 1, null);
    });
    it("Play tile to the right", function () {
        var stateBeforeMove = { board: { root: { tileKey: 'tile2', leftNumber: 1, rightNumber: 1 },
                leftMostTile: { tileKey: 'tile2', leftNumber: 1, rightNumber: 1 },
                rightMostTile: { tileKey: 'tile2', leftNumber: 1, rightNumber: 1 },
                currentRight: 1, currentLeft: 1 },
            delta: { play: 1, tileKey: 'tile2' },
            players: [{ id: 0, hand: [{ tileKey: 'tile8', leftNumber: 2, rightNumber: 3 }, { tileKey: 'tile25', leftNumber: 4, rightNumber: 6 }, { tileKey: 'tile3', leftNumber: 0, rightNumber: 2 }, { tileKey: 'tile9', leftNumber: 3, rightNumber: 3 }, { tileKey: 'tile7', leftNumber: 1, rightNumber: 3 }, { tileKey: 'tile15', leftNumber: 0, rightNumber: 5 }] },
                { id: 1, hand: [{ tileKey: 'tile16', leftNumber: 1, rightNumber: 5 }, { tileKey: 'tile18', leftNumber: 3, rightNumber: 5 }, { tileKey: 'tile17', leftNumber: 2, rightNumber: 5 }, { tileKey: 'tile6', leftNumber: 0, rightNumber: 3 }, { tileKey: 'tile21', leftNumber: 0, rightNumber: 6 }, { tileKey: 'tile14', leftNumber: 4, rightNumber: 4 }, { tileKey: 'tile26', leftNumber: 5, rightNumber: 6 }] }],
            house: { id: -1, hand: [{ tileKey: 'tile1', leftNumber: 0, rightNumber: 1 }, { tileKey: 'tile11', leftNumber: 1, rightNumber: 4 }, { tileKey: 'tile20', leftNumber: 5, rightNumber: 5 }, { tileKey: 'tile0', leftNumber: 0, rightNumber: 0 }, { tileKey: 'tile13', leftNumber: 3, rightNumber: 4 }, { tileKey: 'tile22', leftNumber: 1, rightNumber: 6 }, { tileKey: 'tile5', leftNumber: 2, rightNumber: 2 }, { tileKey: 'tile24', leftNumber: 3, rightNumber: 6 }, { tileKey: 'tile12', leftNumber: 2, rightNumber: 4 }, { tileKey: 'tile10', leftNumber: 0, rightNumber: 4 }, { tileKey: 'tile4', leftNumber: 1, rightNumber: 2 }, { tileKey: 'tile19', leftNumber: 4, rightNumber: 5 }, { tileKey: 'tile27', leftNumber: 6, rightNumber: 6 }, { tileKey: 'tile23', leftNumber: 2, rightNumber: 6 }] } };
        var delta = { play: Play.RIGHT, tileKey: 'tile16' };
        var stateAfterMove = { board: { root: { tileKey: 'tile2', leftNumber: 1, rightNumber: 1, rightTile: { tileKey: 'tile16', leftNumber: 1, rightNumber: 5, orientation: 0 } },
                leftMostTile: { tileKey: 'tile2', leftNumber: 1, rightNumber: 1 },
                rightMostTile: { tileKey: 'tile16', leftNumber: 1, rightNumber: 5, orientation: 0 }, currentRight: 5, currentLeft: 1 },
            delta: { play: 1, tileKey: 'tile16' },
            players: [{ id: 0, hand: [{ tileKey: 'tile8', leftNumber: 2, rightNumber: 3 }, { tileKey: 'tile25', leftNumber: 4, rightNumber: 6 }, { tileKey: 'tile3', leftNumber: 0, rightNumber: 2 }, { tileKey: 'tile9', leftNumber: 3, rightNumber: 3 }, { tileKey: 'tile7', leftNumber: 1, rightNumber: 3 }, { tileKey: 'tile15', leftNumber: 0, rightNumber: 5 }] },
                { id: 1, hand: [{ tileKey: 'tile18', leftNumber: 3, rightNumber: 5 }, { tileKey: 'tile17', leftNumber: 2, rightNumber: 5 }, { tileKey: 'tile6', leftNumber: 0, rightNumber: 3 }, { tileKey: 'tile21', leftNumber: 0, rightNumber: 6 }, { tileKey: 'tile14', leftNumber: 4, rightNumber: 4 }, { tileKey: 'tile26', leftNumber: 5, rightNumber: 6 }] }],
            house: { id: -1, hand: [{ tileKey: 'tile1', leftNumber: 0, rightNumber: 1 }, { tileKey: 'tile11', leftNumber: 1, rightNumber: 4 }, { tileKey: 'tile20', leftNumber: 5, rightNumber: 5 }, { tileKey: 'tile0', leftNumber: 0, rightNumber: 0 }, { tileKey: 'tile13', leftNumber: 3, rightNumber: 4 }, { tileKey: 'tile22', leftNumber: 1, rightNumber: 6 }, { tileKey: 'tile5', leftNumber: 2, rightNumber: 2 }, { tileKey: 'tile24', leftNumber: 3, rightNumber: 6 }, { tileKey: 'tile12', leftNumber: 2, rightNumber: 4 }, { tileKey: 'tile10', leftNumber: 0, rightNumber: 4 }, { tileKey: 'tile4', leftNumber: 1, rightNumber: 2 }, { tileKey: 'tile19', leftNumber: 4, rightNumber: 5 }, { tileKey: 'tile27', leftNumber: 6, rightNumber: 6 }, { tileKey: 'tile23', leftNumber: 2, rightNumber: 6 }] } };
        expectMove(1, stateBeforeMove, delta, stateAfterMove, 0, null);
    });
    it("Play tile to the left", function () {
        var stateBeforeMove = { board: { root: { tileKey: 'tile2', leftNumber: 1, rightNumber: 1, rightTile: { tileKey: 'tile16', leftNumber: 1, rightNumber: 5, orientation: 0 } },
                leftMostTile: { tileKey: 'tile2', leftNumber: 1, rightNumber: 1 },
                rightMostTile: { tileKey: 'tile16', leftNumber: 1, rightNumber: 5, orientation: 0 }, currentRight: 5, currentLeft: 1 },
            delta: { play: 1, tileKey: 'tile16' },
            players: [{ id: 0, hand: [{ tileKey: 'tile8', leftNumber: 2, rightNumber: 3 }, { tileKey: 'tile25', leftNumber: 4, rightNumber: 6 }, { tileKey: 'tile3', leftNumber: 0, rightNumber: 2 }, { tileKey: 'tile9', leftNumber: 3, rightNumber: 3 }, { tileKey: 'tile7', leftNumber: 1, rightNumber: 3 }, { tileKey: 'tile15', leftNumber: 0, rightNumber: 5 }] },
                { id: 1, hand: [{ tileKey: 'tile18', leftNumber: 3, rightNumber: 5 }, { tileKey: 'tile17', leftNumber: 2, rightNumber: 5 }, { tileKey: 'tile6', leftNumber: 0, rightNumber: 3 }, { tileKey: 'tile21', leftNumber: 0, rightNumber: 6 }, { tileKey: 'tile14', leftNumber: 4, rightNumber: 4 }, { tileKey: 'tile26', leftNumber: 5, rightNumber: 6 }] }],
            house: { id: -1, hand: [{ tileKey: 'tile1', leftNumber: 0, rightNumber: 1 }, { tileKey: 'tile11', leftNumber: 1, rightNumber: 4 }, { tileKey: 'tile20', leftNumber: 5, rightNumber: 5 }, { tileKey: 'tile0', leftNumber: 0, rightNumber: 0 }, { tileKey: 'tile13', leftNumber: 3, rightNumber: 4 }, { tileKey: 'tile22', leftNumber: 1, rightNumber: 6 }, { tileKey: 'tile5', leftNumber: 2, rightNumber: 2 }, { tileKey: 'tile24', leftNumber: 3, rightNumber: 6 }, { tileKey: 'tile12', leftNumber: 2, rightNumber: 4 }, { tileKey: 'tile10', leftNumber: 0, rightNumber: 4 }, { tileKey: 'tile4', leftNumber: 1, rightNumber: 2 }, { tileKey: 'tile19', leftNumber: 4, rightNumber: 5 }, { tileKey: 'tile27', leftNumber: 6, rightNumber: 6 }, { tileKey: 'tile23', leftNumber: 2, rightNumber: 6 }] } };
        var delta = { play: Play.LEFT, tileKey: 'tile7' };
        var stateAfterMove = { board: { root: { tileKey: 'tile2', leftNumber: 1, rightNumber: 1, rightTile: { tileKey: 'tile16', leftNumber: 1, rightNumber: 5, orientation: 0 }, leftTile: { tileKey: 'tile7', leftNumber: 1, rightNumber: 3, orientation: 1 } },
                leftMostTile: { tileKey: 'tile7', leftNumber: 1, rightNumber: 3, orientation: 1 },
                rightMostTile: { tileKey: 'tile16', leftNumber: 1, rightNumber: 5, orientation: 0 },
                currentRight: 5, currentLeft: 3 },
            delta: { play: 0, tileKey: 'tile7' },
            players: [{ id: 0, hand: [{ tileKey: 'tile8', leftNumber: 2, rightNumber: 3 }, { tileKey: 'tile25', leftNumber: 4, rightNumber: 6 }, { tileKey: 'tile3', leftNumber: 0, rightNumber: 2 }, { tileKey: 'tile9', leftNumber: 3, rightNumber: 3 }, { tileKey: 'tile15', leftNumber: 0, rightNumber: 5 }] },
                { id: 1, hand: [{ tileKey: 'tile18', leftNumber: 3, rightNumber: 5 }, { tileKey: 'tile17', leftNumber: 2, rightNumber: 5 }, { tileKey: 'tile6', leftNumber: 0, rightNumber: 3 }, { tileKey: 'tile21', leftNumber: 0, rightNumber: 6 }, { tileKey: 'tile14', leftNumber: 4, rightNumber: 4 }, { tileKey: 'tile26', leftNumber: 5, rightNumber: 6 }] }],
            house: { id: -1, hand: [{ tileKey: 'tile1', leftNumber: 0, rightNumber: 1 }, { tileKey: 'tile11', leftNumber: 1, rightNumber: 4 }, { tileKey: 'tile20', leftNumber: 5, rightNumber: 5 }, { tileKey: 'tile0', leftNumber: 0, rightNumber: 0 }, { tileKey: 'tile13', leftNumber: 3, rightNumber: 4 }, { tileKey: 'tile22', leftNumber: 1, rightNumber: 6 }, { tileKey: 'tile5', leftNumber: 2, rightNumber: 2 }, { tileKey: 'tile24', leftNumber: 3, rightNumber: 6 }, { tileKey: 'tile12', leftNumber: 2, rightNumber: 4 }, { tileKey: 'tile10', leftNumber: 0, rightNumber: 4 }, { tileKey: 'tile4', leftNumber: 1, rightNumber: 2 }, { tileKey: 'tile19', leftNumber: 4, rightNumber: 5 }, { tileKey: 'tile27', leftNumber: 6, rightNumber: 6 }, { tileKey: 'tile23', leftNumber: 2, rightNumber: 6 }] } };
        expectMove(0, stateBeforeMove, delta, stateAfterMove, 1, null);
    });
    it("Try to pass when play is possible", function () {
        var stateBeforeMove = { board: { root: { tileKey: 'tile2', leftNumber: 1, rightNumber: 1, rightTile: { tileKey: 'tile16', leftNumber: 1, rightNumber: 5, orientation: 0 } },
                leftMostTile: { tileKey: 'tile2', leftNumber: 1, rightNumber: 1 },
                rightMostTile: { tileKey: 'tile16', leftNumber: 1, rightNumber: 5, orientation: 0 },
                currentRight: 5, currentLeft: 1 },
            delta: { play: 1, tileKey: 'tile16' },
            players: [{ id: 0, hand: [{ tileKey: 'tile8', leftNumber: 2, rightNumber: 3 }, { tileKey: 'tile25', leftNumber: 4, rightNumber: 6 }, { tileKey: 'tile3', leftNumber: 0, rightNumber: 2 }, { tileKey: 'tile9', leftNumber: 3, rightNumber: 3 }, { tileKey: 'tile7', leftNumber: 1, rightNumber: 3 }, { tileKey: 'tile15', leftNumber: 0, rightNumber: 5 }] },
                { id: 1, hand: [{ tileKey: 'tile18', leftNumber: 3, rightNumber: 5 }, { tileKey: 'tile17', leftNumber: 2, rightNumber: 5 }, { tileKey: 'tile6', leftNumber: 0, rightNumber: 3 }, { tileKey: 'tile21', leftNumber: 0, rightNumber: 6 }, { tileKey: 'tile14', leftNumber: 4, rightNumber: 4 }, { tileKey: 'tile26', leftNumber: 5, rightNumber: 6 }] }],
            house: { id: -1, hand: [{ tileKey: 'tile1', leftNumber: 0, rightNumber: 1 }, { tileKey: 'tile11', leftNumber: 1, rightNumber: 4 }, { tileKey: 'tile20', leftNumber: 5, rightNumber: 5 }, { tileKey: 'tile0', leftNumber: 0, rightNumber: 0 }, { tileKey: 'tile13', leftNumber: 3, rightNumber: 4 }, { tileKey: 'tile22', leftNumber: 1, rightNumber: 6 }, { tileKey: 'tile5', leftNumber: 2, rightNumber: 2 }, { tileKey: 'tile24', leftNumber: 3, rightNumber: 6 }, { tileKey: 'tile12', leftNumber: 2, rightNumber: 4 }, { tileKey: 'tile10', leftNumber: 0, rightNumber: 4 }, { tileKey: 'tile4', leftNumber: 1, rightNumber: 2 }, { tileKey: 'tile19', leftNumber: 4, rightNumber: 5 }, { tileKey: 'tile27', leftNumber: 6, rightNumber: 6 }, { tileKey: 'tile23', leftNumber: 2, rightNumber: 6 }] } };
        var delta = { play: Play.PASS, tileKey: undefined };
        expectException(1, stateBeforeMove, delta);
    });
    it("Buy tile from house", function () {
        var stateBeforeMove = { board: { root: { tileKey: 'tile2', leftNumber: 1, rightNumber: 1, rightTile: { tileKey: 'tile16', leftNumber: 1, rightNumber: 5, orientation: 0 } },
                leftMostTile: { tileKey: 'tile2', leftNumber: 1, rightNumber: 1 },
                rightMostTile: { tileKey: 'tile16', leftNumber: 1, rightNumber: 5, orientation: 0 }, currentRight: 5, currentLeft: 1 },
            delta: { play: 1, tileKey: 'tile16' },
            players: [{ id: 0, hand: [{ tileKey: 'tile8', leftNumber: 2, rightNumber: 3 }, { tileKey: 'tile25', leftNumber: 4, rightNumber: 6 }, { tileKey: 'tile3', leftNumber: 0, rightNumber: 2 }, { tileKey: 'tile9', leftNumber: 3, rightNumber: 3 }, { tileKey: 'tile7', leftNumber: 1, rightNumber: 3 }, { tileKey: 'tile15', leftNumber: 0, rightNumber: 5 }] },
                { id: 1, hand: [{ tileKey: 'tile18', leftNumber: 3, rightNumber: 5 }, { tileKey: 'tile17', leftNumber: 2, rightNumber: 5 }, { tileKey: 'tile6', leftNumber: 0, rightNumber: 3 }, { tileKey: 'tile21', leftNumber: 0, rightNumber: 6 }, { tileKey: 'tile14', leftNumber: 4, rightNumber: 4 }, { tileKey: 'tile26', leftNumber: 5, rightNumber: 6 }] }],
            house: { id: -1, hand: [{ tileKey: 'tile1', leftNumber: 0, rightNumber: 1 }, { tileKey: 'tile11', leftNumber: 1, rightNumber: 4 }, { tileKey: 'tile20', leftNumber: 5, rightNumber: 5 }, { tileKey: 'tile0', leftNumber: 0, rightNumber: 0 }, { tileKey: 'tile13', leftNumber: 3, rightNumber: 4 }, { tileKey: 'tile22', leftNumber: 1, rightNumber: 6 }, { tileKey: 'tile5', leftNumber: 2, rightNumber: 2 }, { tileKey: 'tile24', leftNumber: 3, rightNumber: 6 }, { tileKey: 'tile12', leftNumber: 2, rightNumber: 4 }, { tileKey: 'tile10', leftNumber: 0, rightNumber: 4 }, { tileKey: 'tile4', leftNumber: 1, rightNumber: 2 }, { tileKey: 'tile19', leftNumber: 4, rightNumber: 5 }, { tileKey: 'tile27', leftNumber: 6, rightNumber: 6 }, { tileKey: 'tile23', leftNumber: 2, rightNumber: 6 }] } };
        var delta = { play: Play.BUY, tileKey: 'tile11' };
        var stateAfterMove = { board: { root: { tileKey: 'tile2', leftNumber: 1, rightNumber: 1, rightTile: { tileKey: 'tile16', leftNumber: 1, rightNumber: 5, orientation: 0 } },
                leftMostTile: { tileKey: 'tile2', leftNumber: 1, rightNumber: 1 }, rightMostTile: { tileKey: 'tile16', leftNumber: 1, rightNumber: 5, orientation: 0 },
                currentRight: 5, currentLeft: 1 }, delta: { play: 2, tileKey: 'tile11' },
            players: [{ id: 0, hand: [{ tileKey: 'tile8', leftNumber: 2, rightNumber: 3 }, { tileKey: 'tile25', leftNumber: 4, rightNumber: 6 }, { tileKey: 'tile3', leftNumber: 0, rightNumber: 2 }, { tileKey: 'tile9', leftNumber: 3, rightNumber: 3 }, { tileKey: 'tile7', leftNumber: 1, rightNumber: 3 }, { tileKey: 'tile15', leftNumber: 0, rightNumber: 5 }] },
                { id: 1, hand: [{ tileKey: 'tile11', leftNumber: 1, rightNumber: 4 }, { tileKey: 'tile18', leftNumber: 3, rightNumber: 5 }, { tileKey: 'tile17', leftNumber: 2, rightNumber: 5 }, { tileKey: 'tile6', leftNumber: 0, rightNumber: 3 }, { tileKey: 'tile21', leftNumber: 0, rightNumber: 6 }, { tileKey: 'tile14', leftNumber: 4, rightNumber: 4 }, { tileKey: 'tile26', leftNumber: 5, rightNumber: 6 }] }],
            house: { id: -1, hand: [{ tileKey: 'tile1', leftNumber: 0, rightNumber: 1 }, { tileKey: 'tile20', leftNumber: 5, rightNumber: 5 }, { tileKey: 'tile0', leftNumber: 0, rightNumber: 0 }, { tileKey: 'tile13', leftNumber: 3, rightNumber: 4 }, { tileKey: 'tile22', leftNumber: 1, rightNumber: 6 }, { tileKey: 'tile5', leftNumber: 2, rightNumber: 2 }, { tileKey: 'tile24', leftNumber: 3, rightNumber: 6 }, { tileKey: 'tile12', leftNumber: 2, rightNumber: 4 }, { tileKey: 'tile10', leftNumber: 0, rightNumber: 4 }, { tileKey: 'tile4', leftNumber: 1, rightNumber: 2 }, { tileKey: 'tile19', leftNumber: 4, rightNumber: 5 }, { tileKey: 'tile27', leftNumber: 6, rightNumber: 6 }, { tileKey: 'tile23', leftNumber: 2, rightNumber: 6 }] } };
        expectMove(1, stateBeforeMove, delta, stateAfterMove, 1, null);
    });
    it("Buy non-existing tile from house", function () {
        var stateBeforeMove = { board: { root: { tileKey: 'tile2', leftNumber: 1, rightNumber: 1, rightTile: { tileKey: 'tile16', leftNumber: 1, rightNumber: 5, orientation: 0 } },
                leftMostTile: { tileKey: 'tile2', leftNumber: 1, rightNumber: 1 },
                rightMostTile: { tileKey: 'tile16', leftNumber: 1, rightNumber: 5, orientation: 0 }, currentRight: 5, currentLeft: 1 },
            delta: { play: 1, tileKey: 'tile16' },
            players: [{ id: 0, hand: [{ tileKey: 'tile8', leftNumber: 2, rightNumber: 3 }, { tileKey: 'tile25', leftNumber: 4, rightNumber: 6 }, { tileKey: 'tile3', leftNumber: 0, rightNumber: 2 }, { tileKey: 'tile9', leftNumber: 3, rightNumber: 3 }, { tileKey: 'tile7', leftNumber: 1, rightNumber: 3 }, { tileKey: 'tile15', leftNumber: 0, rightNumber: 5 }] },
                { id: 1, hand: [{ tileKey: 'tile18', leftNumber: 3, rightNumber: 5 }, { tileKey: 'tile17', leftNumber: 2, rightNumber: 5 }, { tileKey: 'tile6', leftNumber: 0, rightNumber: 3 }, { tileKey: 'tile21', leftNumber: 0, rightNumber: 6 }, { tileKey: 'tile14', leftNumber: 4, rightNumber: 4 }, { tileKey: 'tile26', leftNumber: 5, rightNumber: 6 }] }],
            house: { id: -1, hand: [{ tileKey: 'tile1', leftNumber: 0, rightNumber: 1 }, { tileKey: 'tile11', leftNumber: 1, rightNumber: 4 }, { tileKey: 'tile20', leftNumber: 5, rightNumber: 5 }, { tileKey: 'tile0', leftNumber: 0, rightNumber: 0 }, { tileKey: 'tile13', leftNumber: 3, rightNumber: 4 }, { tileKey: 'tile22', leftNumber: 1, rightNumber: 6 }, { tileKey: 'tile5', leftNumber: 2, rightNumber: 2 }, { tileKey: 'tile24', leftNumber: 3, rightNumber: 6 }, { tileKey: 'tile12', leftNumber: 2, rightNumber: 4 }, { tileKey: 'tile10', leftNumber: 0, rightNumber: 4 }, { tileKey: 'tile4', leftNumber: 1, rightNumber: 2 }, { tileKey: 'tile19', leftNumber: 4, rightNumber: 5 }, { tileKey: 'tile27', leftNumber: 6, rightNumber: 6 }, { tileKey: 'tile23', leftNumber: 2, rightNumber: 6 }] } };
        var delta = { play: Play.BUY, tileKey: 'tile66' };
        expectException(1, stateBeforeMove, delta);
    });
    it("Buy tile from empty house", function () {
        var stateBeforeMove = { board: { root: { tileKey: 'tile2', leftNumber: 1, rightNumber: 1, rightTile: { tileKey: 'tile16', leftNumber: 1, rightNumber: 5, orientation: 0 } },
                leftMostTile: { tileKey: 'tile2', leftNumber: 1, rightNumber: 1 },
                rightMostTile: { tileKey: 'tile16', leftNumber: 1, rightNumber: 5, orientation: 0 }, currentRight: 5, currentLeft: 1 },
            delta: { play: 1, tileKey: 'tile16' },
            players: [{ id: 0, hand: [{ tileKey: 'tile8', leftNumber: 2, rightNumber: 3 }, { tileKey: 'tile25', leftNumber: 4, rightNumber: 6 }, { tileKey: 'tile3', leftNumber: 0, rightNumber: 2 }, { tileKey: 'tile9', leftNumber: 3, rightNumber: 3 }, { tileKey: 'tile7', leftNumber: 1, rightNumber: 3 }, { tileKey: 'tile15', leftNumber: 0, rightNumber: 5 }] },
                { id: 1, hand: [{ tileKey: 'tile18', leftNumber: 3, rightNumber: 5 }, { tileKey: 'tile17', leftNumber: 2, rightNumber: 5 }, { tileKey: 'tile6', leftNumber: 0, rightNumber: 3 }, { tileKey: 'tile21', leftNumber: 0, rightNumber: 6 }, { tileKey: 'tile14', leftNumber: 4, rightNumber: 4 }, { tileKey: 'tile26', leftNumber: 5, rightNumber: 6 }] }],
            house: { id: -1, hand: [] } };
        var delta = { play: Play.BUY, tileKey: 'tile11' };
        expectException(1, stateBeforeMove, delta);
    });
    it("Invalid play", function () {
        var stateBeforeMove = { board: { root: { tileKey: 'tile2', leftNumber: 1, rightNumber: 1, rightTile: { tileKey: 'tile16', leftNumber: 1, rightNumber: 5, orientation: 0 } },
                leftMostTile: { tileKey: 'tile2', leftNumber: 1, rightNumber: 1 },
                rightMostTile: { tileKey: 'tile16', leftNumber: 1, rightNumber: 5, orientation: 0 }, currentRight: 5, currentLeft: 1 },
            delta: { play: 1, tileKey: 'tile16' },
            players: [{ id: 0, hand: [{ tileKey: 'tile8', leftNumber: 2, rightNumber: 3 }, { tileKey: 'tile25', leftNumber: 4, rightNumber: 6 }, { tileKey: 'tile3', leftNumber: 0, rightNumber: 2 }, { tileKey: 'tile9', leftNumber: 3, rightNumber: 3 }, { tileKey: 'tile7', leftNumber: 1, rightNumber: 3 }, { tileKey: 'tile15', leftNumber: 0, rightNumber: 5 }] },
                { id: 1, hand: [{ tileKey: 'tile18', leftNumber: 3, rightNumber: 5 }, { tileKey: 'tile17', leftNumber: 2, rightNumber: 5 }, { tileKey: 'tile6', leftNumber: 0, rightNumber: 3 }, { tileKey: 'tile21', leftNumber: 0, rightNumber: 6 }, { tileKey: 'tile14', leftNumber: 4, rightNumber: 4 }, { tileKey: 'tile26', leftNumber: 5, rightNumber: 6 }] }],
            house: { id: -1, hand: [] } };
        var delta = { play: undefined, tileKey: 'tile11' };
        expectException(1, stateBeforeMove, delta);
    });
    it("Invalid first tile", function () {
        var stateBeforeMove = { board: {},
            delta: null,
            players: [{ id: 0, hand: [{ tileKey: 'tile8', leftNumber: 2, rightNumber: 3 }, { tileKey: 'tile25', leftNumber: 4, rightNumber: 6 }, { tileKey: 'tile3', leftNumber: 0, rightNumber: 2 }, { tileKey: 'tile2', leftNumber: 1, rightNumber: 1 }, { tileKey: 'tile9', leftNumber: 3, rightNumber: 3 }, { tileKey: 'tile7', leftNumber: 1, rightNumber: 3 }, { tileKey: 'tile15', leftNumber: 0, rightNumber: 5 }] },
                { id: 1, hand: [{ tileKey: 'tile16', leftNumber: 1, rightNumber: 5 }, { tileKey: 'tile18', leftNumber: 3, rightNumber: 5 }, { tileKey: 'tile17', leftNumber: 2, rightNumber: 5 }, { tileKey: 'tile6', leftNumber: 0, rightNumber: 3 }, { tileKey: 'tile21', leftNumber: 0, rightNumber: 6 }, { tileKey: 'tile14', leftNumber: 4, rightNumber: 4 }, { tileKey: 'tile26', leftNumber: 5, rightNumber: 6 }] }],
            house: { id: -1, hand: [{ tileKey: 'tile1', leftNumber: 0, rightNumber: 1 }, { tileKey: 'tile11', leftNumber: 1, rightNumber: 4 }, { tileKey: 'tile20', leftNumber: 5, rightNumber: 5 }, { tileKey: 'tile0', leftNumber: 0, rightNumber: 0 }, { tileKey: 'tile13', leftNumber: 3, rightNumber: 4 }, { tileKey: 'tile22', leftNumber: 1, rightNumber: 6 }, { tileKey: 'tile5', leftNumber: 2, rightNumber: 2 }, { tileKey: 'tile24', leftNumber: 3, rightNumber: 6 }, { tileKey: 'tile12', leftNumber: 2, rightNumber: 4 }, { tileKey: 'tile10', leftNumber: 0, rightNumber: 4 }, { tileKey: 'tile4', leftNumber: 1, rightNumber: 2 }, { tileKey: 'tile19', leftNumber: 4, rightNumber: 5 }, { tileKey: 'tile27', leftNumber: 6, rightNumber: 6 }, { tileKey: 'tile23', leftNumber: 2, rightNumber: 6 }] } };
        var delta = { play: Play.RIGHT, tileKey: 'tile8' };
        expectException(0, stateBeforeMove, delta);
    });
    it("Play right tile with wrong number", function () {
        var stateBeforeMove = { board: { root: { tileKey: 'tile2', leftNumber: 1, rightNumber: 1 },
                leftMostTile: { tileKey: 'tile2', leftNumber: 1, rightNumber: 1 },
                rightMostTile: { tileKey: 'tile2', leftNumber: 1, rightNumber: 1 },
                currentRight: 1, currentLeft: 1 },
            delta: { play: 1, tileKey: 'tile2' },
            players: [{ id: 0, hand: [{ tileKey: 'tile8', leftNumber: 2, rightNumber: 3 }, { tileKey: 'tile25', leftNumber: 4, rightNumber: 6 }, { tileKey: 'tile3', leftNumber: 0, rightNumber: 2 }, { tileKey: 'tile9', leftNumber: 3, rightNumber: 3 }, { tileKey: 'tile7', leftNumber: 1, rightNumber: 3 }, { tileKey: 'tile15', leftNumber: 0, rightNumber: 5 }] },
                { id: 1, hand: [{ tileKey: 'tile16', leftNumber: 1, rightNumber: 5 }, { tileKey: 'tile18', leftNumber: 3, rightNumber: 5 }, { tileKey: 'tile17', leftNumber: 2, rightNumber: 5 }, { tileKey: 'tile6', leftNumber: 0, rightNumber: 3 }, { tileKey: 'tile21', leftNumber: 0, rightNumber: 6 }, { tileKey: 'tile14', leftNumber: 4, rightNumber: 4 }, { tileKey: 'tile26', leftNumber: 5, rightNumber: 6 }] }],
            house: { id: -1, hand: [{ tileKey: 'tile1', leftNumber: 0, rightNumber: 1 }, { tileKey: 'tile11', leftNumber: 1, rightNumber: 4 }, { tileKey: 'tile20', leftNumber: 5, rightNumber: 5 }, { tileKey: 'tile0', leftNumber: 0, rightNumber: 0 }, { tileKey: 'tile13', leftNumber: 3, rightNumber: 4 }, { tileKey: 'tile22', leftNumber: 1, rightNumber: 6 }, { tileKey: 'tile5', leftNumber: 2, rightNumber: 2 }, { tileKey: 'tile24', leftNumber: 3, rightNumber: 6 }, { tileKey: 'tile12', leftNumber: 2, rightNumber: 4 }, { tileKey: 'tile10', leftNumber: 0, rightNumber: 4 }, { tileKey: 'tile4', leftNumber: 1, rightNumber: 2 }, { tileKey: 'tile19', leftNumber: 4, rightNumber: 5 }, { tileKey: 'tile27', leftNumber: 6, rightNumber: 6 }, { tileKey: 'tile23', leftNumber: 2, rightNumber: 6 }] } };
        var delta = { play: Play.RIGHT, tileKey: 'tile18' };
        expectException(1, stateBeforeMove, delta);
    });
    it("Play left tile with wrong number", function () {
        var stateBeforeMove = { board: { root: { tileKey: 'tile2', leftNumber: 1, rightNumber: 1, rightTile: { tileKey: 'tile16', leftNumber: 1, rightNumber: 5, orientation: 0 } },
                leftMostTile: { tileKey: 'tile2', leftNumber: 1, rightNumber: 1 },
                rightMostTile: { tileKey: 'tile16', leftNumber: 1, rightNumber: 5, orientation: 0 }, currentRight: 5, currentLeft: 1 },
            delta: { play: 1, tileKey: 'tile16' },
            players: [{ id: 0, hand: [{ tileKey: 'tile8', leftNumber: 2, rightNumber: 3 }, { tileKey: 'tile25', leftNumber: 4, rightNumber: 6 }, { tileKey: 'tile3', leftNumber: 0, rightNumber: 2 }, { tileKey: 'tile9', leftNumber: 3, rightNumber: 3 }, { tileKey: 'tile7', leftNumber: 1, rightNumber: 3 }, { tileKey: 'tile15', leftNumber: 0, rightNumber: 5 }] },
                { id: 1, hand: [{ tileKey: 'tile18', leftNumber: 3, rightNumber: 5 }, { tileKey: 'tile17', leftNumber: 2, rightNumber: 5 }, { tileKey: 'tile6', leftNumber: 0, rightNumber: 3 }, { tileKey: 'tile21', leftNumber: 0, rightNumber: 6 }, { tileKey: 'tile14', leftNumber: 4, rightNumber: 4 }, { tileKey: 'tile26', leftNumber: 5, rightNumber: 6 }] }],
            house: { id: -1, hand: [{ tileKey: 'tile1', leftNumber: 0, rightNumber: 1 }, { tileKey: 'tile11', leftNumber: 1, rightNumber: 4 }, { tileKey: 'tile20', leftNumber: 5, rightNumber: 5 }, { tileKey: 'tile0', leftNumber: 0, rightNumber: 0 }, { tileKey: 'tile13', leftNumber: 3, rightNumber: 4 }, { tileKey: 'tile22', leftNumber: 1, rightNumber: 6 }, { tileKey: 'tile5', leftNumber: 2, rightNumber: 2 }, { tileKey: 'tile24', leftNumber: 3, rightNumber: 6 }, { tileKey: 'tile12', leftNumber: 2, rightNumber: 4 }, { tileKey: 'tile10', leftNumber: 0, rightNumber: 4 }, { tileKey: 'tile4', leftNumber: 1, rightNumber: 2 }, { tileKey: 'tile19', leftNumber: 4, rightNumber: 5 }, { tileKey: 'tile27', leftNumber: 6, rightNumber: 6 }, { tileKey: 'tile23', leftNumber: 2, rightNumber: 6 }] } };
        var delta = { play: Play.LEFT, tileKey: 'tile8' };
        expectException(0, stateBeforeMove, delta);
    });
    it("Play tile with non-existing key", function () {
        var stateBeforeMove = { board: { root: { tileKey: 'tile2', leftNumber: 1, rightNumber: 1, rightTile: { tileKey: 'tile16', leftNumber: 1, rightNumber: 5, orientation: 0 } },
                leftMostTile: { tileKey: 'tile2', leftNumber: 1, rightNumber: 1 },
                rightMostTile: { tileKey: 'tile16', leftNumber: 1, rightNumber: 5, orientation: 0 }, currentRight: 5, currentLeft: 1 },
            delta: { play: 1, tileKey: 'tile16' },
            players: [{ id: 0, hand: [{ tileKey: 'tile8', leftNumber: 2, rightNumber: 3 }, { tileKey: 'tile25', leftNumber: 4, rightNumber: 6 }, { tileKey: 'tile3', leftNumber: 0, rightNumber: 2 }, { tileKey: 'tile9', leftNumber: 3, rightNumber: 3 }, { tileKey: 'tile7', leftNumber: 1, rightNumber: 3 }, { tileKey: 'tile15', leftNumber: 0, rightNumber: 5 }] },
                { id: 1, hand: [{ tileKey: 'tile18', leftNumber: 3, rightNumber: 5 }, { tileKey: 'tile17', leftNumber: 2, rightNumber: 5 }, { tileKey: 'tile6', leftNumber: 0, rightNumber: 3 }, { tileKey: 'tile21', leftNumber: 0, rightNumber: 6 }, { tileKey: 'tile14', leftNumber: 4, rightNumber: 4 }, { tileKey: 'tile26', leftNumber: 5, rightNumber: 6 }] }],
            house: { id: -1, hand: [{ tileKey: 'tile1', leftNumber: 0, rightNumber: 1 }, { tileKey: 'tile11', leftNumber: 1, rightNumber: 4 }, { tileKey: 'tile20', leftNumber: 5, rightNumber: 5 }, { tileKey: 'tile0', leftNumber: 0, rightNumber: 0 }, { tileKey: 'tile13', leftNumber: 3, rightNumber: 4 }, { tileKey: 'tile22', leftNumber: 1, rightNumber: 6 }, { tileKey: 'tile5', leftNumber: 2, rightNumber: 2 }, { tileKey: 'tile24', leftNumber: 3, rightNumber: 6 }, { tileKey: 'tile12', leftNumber: 2, rightNumber: 4 }, { tileKey: 'tile10', leftNumber: 0, rightNumber: 4 }, { tileKey: 'tile4', leftNumber: 1, rightNumber: 2 }, { tileKey: 'tile19', leftNumber: 4, rightNumber: 5 }, { tileKey: 'tile27', leftNumber: 6, rightNumber: 6 }, { tileKey: 'tile23', leftNumber: 2, rightNumber: 6 }] } };
        var delta = { play: Play.LEFT, tileKey: 'tile66' };
        expectException(0, stateBeforeMove, delta);
    });
});
//# sourceMappingURL=gameLogic_test.js.map