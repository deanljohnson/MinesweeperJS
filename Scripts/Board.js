var MINESWEEPER = (function(MINESWEEPER) {
	"use strict";
	function createBoard(sizeX, sizeY, numMines) {
		var dimensions = {x: sizeX, y: sizeY},
			board,
			mineVal = 9,
			mineCount = numMines,
			victory,
			hiddenTileCount = dimensions.x * dimensions.y,
			that = {};

		function createBoardArray() {
			var i = dimensions.x;
			board = new Array(dimensions.x);

			while(i--) {
				board[dimensions.x - i - 1] = new Array(dimensions.y);
			}
		}

		function setupBoardArray() {
			for (var y = 0, yl = dimensions.y; y < yl; y++) {
				for (var x = 0, xl = dimensions.x; x < xl; x++) {
					board[x][y] = {value: 0, revealed: false, flagged: false}; //9 is our hidden square index
				}
			}

			placeMines();
		}
		createBoardArray();
		setupBoardArray();

		function placeMines() {
			for (var m = 0; m < mineCount; m++) {
				placeMineRandomly();
			}
		}

		function placeMineRandomly() {
			while(true) {
				var randomX = Math.floor(Math.random() * dimensions.x),
					randomY = Math.floor(Math.random() * dimensions.y);

				if (board[randomX][randomY].value !== mineVal) {
					board[randomX][randomY].value = mineVal;
					incrementNeighborValues(randomX, randomY);
					return {x: randomX, y: randomY};
				}
			}
		}

		function incrementNeighborValues(x, y) {
			var neighbors = getNeighborIndices(x, y);

			for (var n = 0, nl = neighbors.length; n < nl; n++) {
				var neighbor = neighbors[n];

				if (board[neighbor.x][neighbor.y].value !== mineVal) {
					board[neighbor.x][neighbor.y].value += 1;
				}
			}
		}

		function getNeighborIndices(x, y) {
			var neighbors = [];

			if (x > 0) {
				neighbors.push({x: x - 1, y: y});
				if (y > 0) { neighbors.push({x: x - 1, y: y - 1}); }
				if (y < dimensions.y - 1) { neighbors.push({x: x - 1, y: y + 1}); }
			}
			if (x < dimensions.x - 1) {
				neighbors.push({x: x + 1, y: y});
				if (y > 0) { neighbors.push({x: x + 1, y: y - 1}); }
				if (y < dimensions.y - 1) { neighbors.push({x: x + 1, y: y + 1}); }
			}
			if (y > 0) { neighbors.push({x: x, y: y - 1}); }
			if (y < dimensions.y - 1) { neighbors.push({x: x, y: y + 1}); }

			return neighbors;
		}

		function reveal(x, y) {
			if (victory === true || victory === false) {
				return victory;
			}

			if (board[x][y].revealed || board[x][y].flagged) {
				return true;
			}

			board[x][y].revealed = true;
			hiddenTileCount--;

			if (board[x][y].value === mineVal) {
				setToLostState();
				return false;
			}

			if (board[x][y].value === 0) {
				revealNeighbors(x, y);
			}

			if (hiddenTileCount === mineCount) {
				setToVictoryState();
			}

			return true;
		}

		function revealNeighbors(x, y) {
			var neighbors = getNeighborIndices(x, y);

			for (var n = 0, nl = neighbors.length; n < nl; n++) {
				var neighbor = neighbors[n];

				reveal(neighbor.x, neighbor.y);
			}

			return typeof victory !== 'undefined' ? victory : true;
		}

		function revealAllMines() {
			for (var y = 0, yl = dimensions.y; y < yl; y++) {
				for (var x = 0, xl = dimensions.x; x < xl; x++) {
					if (board[x][y].value === mineVal) {
						board[x][y].revealed = true;
					}
				}
			}
		}

		function flagAllMines() {
			for (var y = 0, yl = dimensions.y; y < yl; y++) {
				for (var x = 0, xl = dimensions.x; x < xl; x++) {
					if (board[x][y].value === mineVal) {
						board[x][y].flagged = true;
					}
				}
			}
		}

		function flag(x, y) {
			if (victory === true || victory === false) {
				return victory;
			}

			if (!board[x][y].revealed) {
				board[x][y].flagged = !board[x][y].flagged;
				return true;
			}

			return false;
		}

		function setToLostState() {
			victory = false;
			revealAllMines();
		}

		function setToVictoryState() {
			victory = true;
			flagAllMines();
		}

		function regenerateUntilOpening(x, y) {
			while (board[x][y].value !== 0) {
				setupBoardArray();
			}
		}

		function openSurroundings(x, y) {
			if (!board[x][y].revealed) { return false; }
			if (victory === true || victory === false) {
				return victory;
			}

			if (reducedValueAtIndex(x, y) === 0) {
				return revealNeighbors(x, y);
			}

			return false;
		}

		function anyHiddenAdjacentTo(x, y) {
			var neighbors = getNeighborIndices(x, y);

			for (var n = 0, nl = neighbors.length; n < nl; n++) {
				var neighbor = neighbors[n];
				if (!board[neighbor.x][neighbor.y].revealed && !board[neighbor.x][neighbor.y].flagged) {
					return true;
				}
			}

			return false;
		}

		function anyRevealedAdjacentTo(x, y) {
			var neighbors = getNeighborIndices(x, y);

			for (var n = 0, nl = neighbors.length; n < nl; n++) {
				var neighbor = neighbors[n];
				if (board[neighbor.x][neighbor.y].revealed) {
					return true;
				}
			}

			return false;
		}

		function numFlaggedNeighbors(x, y) {
			var neighbors = getNeighborIndices(x, y),
				count = 0;

			for (var n = 0, nl = neighbors.length; n < nl; n++) {
				var neighbor = neighbors[n];
				if (!board[neighbor.x][neighbor.y].revealed && board[neighbor.x][neighbor.y].flagged) {
					count++;
				}
			}

			return count;
		}

		function isRevealed(x, y) {
			return board[x][y].revealed;
		}

		function isFlagged(x, y) {
			return board[x][y].flagged;
		}

		function valueAtIndex(x, y) {
			return board[x][y].revealed ? board[x][y].value : -1;
		}

		function reducedValueAtIndex(x, y) {
			var val = valueAtIndex(x, y);
			if (val !== -1) {
				val -= numFlaggedNeighbors(x, y);
			}

			return val;
		}

		function isInFailState() {
			return victory === false;
		}

		function isGameFinished() {
			return (victory === true || victory === false);
		}

		function victoryState() {
			return victory === true;
		}

		that.reveal = reveal;
		that.regenerateUntilOpening = regenerateUntilOpening;
		that.openSurroundings = openSurroundings;
		that.flag = flag;
		that.anyHiddenAdjacentTo = anyHiddenAdjacentTo;
		that.anyRevealedAdjacentTo = anyRevealedAdjacentTo;
		that.getNeighborIndices = getNeighborIndices;
		that.isRevealed = isRevealed;
		that.isFlagged = isFlagged;
		that.numFlaggedNeighbors = numFlaggedNeighbors;
		that.reducedValueAtIndex = reducedValueAtIndex;
		that.valueAtIndex = valueAtIndex;
		that.isInFailState = isInFailState;
		that.isGameFinished = isGameFinished;
		that.victoryState = victoryState;

		that.dimensions = dimensions;
		that.mineVal = mineVal;

		return that;
	}

	MINESWEEPER.createBoard = createBoard;

	return MINESWEEPER;
}(MINESWEEPER || {}));