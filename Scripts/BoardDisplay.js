var MINESWEEPER = (function(MINESWEEPER) {
	"use strict";
	function createBoardDisplay(canvas, sizeX, sizeY, mineCount) {
		var tileWidth = 26,
			tileHeight = 26,
			tilesImage = new Image(),
			imagesArray = {},
			board = MINESWEEPER.createBoard(sizeX || 30, sizeY || 19, mineCount || 99),
			firstClick = true,
			hiddenImageIndex = 11,
			flaggedImageIndex = 10,
			that = {};

		canvas.width = tileWidth * board.dimensions.x;
		canvas.height = tileHeight * board.dimensions.y;
		tilesImage.src = "Images/tiles.png";

		(function setupImagesArray() {
			imagesArray[0]={x:82, y: 0};
			imagesArray[1]={x: 1, y: 27};
			imagesArray[2]={x: 28, y: 27};
			imagesArray[3]={x: 55, y: 27};
			imagesArray[4]={x: 82, y: 27};
			imagesArray[5]={x: 1, y: 54};
			imagesArray[6]={x: 28, y: 54};
			imagesArray[7]={x: 55, y: 54};
			imagesArray[8]={x:82, y: 54};
			imagesArray[9]={x:55, y: 0}; //Mine
			imagesArray[10]={x:28, y: 0}; //Flagged
			imagesArray[11]={x:1, y: 0}; //Hidden
		}());

		function pointToIndex(point) {
			return {x: Math.floor(point.x / tileWidth),
				y: Math.floor(point.y / tileHeight)};
		}

		/**
		 * @returns: False if the tile at the given point was a mine or
		 *          if game is already in lost state, true otherwise.
		 * */
		that.revealAtPoint = function(point) {
			var index = pointToIndex(point);

			if (firstClick) {
				board.regenerateUntilOpening(index.x, index.y);
				firstClick = false;
			}
			return board.reveal(index.x, index.y);
		};

		/**
		 * @returns: True if the reveal happened and the game is not in a lost state
		 * */
		that.openSurroundingsAtPoint = function(point) {
			var index = pointToIndex(point);

			return board.openSurroundings(index.x, index.y);
		};

		that.runSolverOneStep = function() {
			if (board.isGameFinished()) {
				return false;
			}
			if (firstClick) {
				that.revealAtPoint({x: Math.floor(Math.random() * canvas.width),
								    y: Math.floor(Math.random() * canvas.height)});
			}
			return MINESWEEPER.SOLVER.solve(board);
		};

		/**
		 * @returns: True if the game is not in a lost state and
		 *           the tile at the given point is now flagged, false otherwise
		 * */
		that.flagAtPoint = function(point) {
			var index = pointToIndex(point);

			return board.flag(index.x, index.y);
		};

		/**
		 * @returns: Number: The value of the tile at the given point,
		 *           or -1 if the tile is not revealed
		 * */
		that.valueAtPoint = function(point) {
			var index = pointToIndex(point);

			return board.valueAtIndex(index.x, index.y);
		};

		that.render = function(context) {
			for (var y = 0, yl = board.dimensions.y; y < yl; y++) {
				for (var x = 0, xl = board.dimensions.x; x < xl; x++) {
					var sourcePos = board.isRevealed(x, y) ? imagesArray[board.valueAtIndex(x, y)]
						: board.isFlagged(x, y) ? imagesArray[flaggedImageIndex]
						: imagesArray[hiddenImageIndex];
					context.drawImage(tilesImage, sourcePos.x, sourcePos.y, tileWidth, tileHeight,
						(x * tileWidth), (y * tileHeight), tileWidth, tileHeight);
				}
			}
		};

		that.isGameFinished = function () { return board.isGameFinished(); };
		that.victoryState = function () { return board.victoryState(); };

		return that;
	}

	MINESWEEPER.createBoardDisplay = createBoardDisplay;

	return MINESWEEPER;
}(MINESWEEPER || {}));