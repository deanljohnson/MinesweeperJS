var MINESWEEPER = (function(MINESWEEPER) {
	"use strict";
	function solve(board) {
		var moveMade = matrixSolve(board);

		if (!moveMade) {
			moveMade = (solveReveal(board)) ? true : moveMade;
		}

		if (!moveMade) {
			moveMade = (solvePossibleDependencies(board)) ? true : moveMade;
		}

		return moveMade;
	}

	function solvePossibleDependencies(board) {
		var unsolvedTiles = getAllUnsolvedNumberedTiles(board),
			unsolvedTile,
			reducedValue,
			neighbors,
			currentLocation,
			otherLocation,
			currentIndex,
			otherIndex,
			otherContainedInCurrent = false,
			possibleLocations = [],
			o, ol, c, cl, i, il, j, jl;

		var isNotRevealedOrFlagged = function(index) {
			return !(board.isRevealed(index.x, index.y) || board.isFlagged(index.x, index.y));

		};

		//Determine all possible locations
		for (var ut = 0, utl = unsolvedTiles.length; ut < utl; ut++) {
			unsolvedTile = unsolvedTiles[ut];
			reducedValue = board.reducedValueAtIndex(unsolvedTile.x, unsolvedTile.y);

			if (reducedValue === -1) {
				console.log("Error: reducedValue is -1 while determining possible location");
			} //Should never happen

			//Remove revealed or flagged
			neighbors = board.getNeighborIndices(unsolvedTile.x, unsolvedTile.y).filter(isNotRevealedOrFlagged);

			currentLocation = {indices: neighbors, mineCount: reducedValue};
			possibleLocations.push(currentLocation);
		}

		//Reduce the locations to be as simple as possible
		for (i = 0, il = possibleLocations.length; i < il; i++) {
			currentLocation = possibleLocations[i];
			for (j = 0, jl = il; j < jl; j++) {
				if (i === j) { continue; }
				otherLocation = possibleLocations[j];

				//Check if all indices in otherLocation are in currentLocation
				otherContainedInCurrent = true;
				for (o = 0, ol = otherLocation.indices.length; o < ol; o++) {
					otherIndex = otherLocation.indices[o];
					var currentContainsOtherIndex = false;
					for (c = 0, cl = currentLocation.indices.length; c < cl; c++) {
						currentIndex = currentLocation.indices[c];
						if (currentIndex.x === otherIndex.x &&
							currentIndex.y === otherIndex.y) {
							currentContainsOtherIndex = true;
						}
					}

					if (!currentContainsOtherIndex) {
						otherContainedInCurrent = false;
						break;
					}
				}

				if (otherContainedInCurrent) {
					//Remove otherLocation indices from currentLocation indices and update it's mineCount
					for (o = 0, ol = otherLocation.indices.length; o < ol; o++) {
						otherIndex = otherLocation.indices[o];
						for (c = 0, cl = currentLocation.indices.length; c < cl; c++) {
							currentIndex = currentLocation.indices[c];
							if (currentIndex.x === otherIndex.x &&
								currentIndex.y === otherIndex.y) {
								currentLocation.indices.splice(c, 1);
								c--;
								cl--;
							}
						}
					}
					currentLocation.mineCount -= otherLocation.mineCount;
				}
			}
		}

		//Analyze the possible locations, make reveals and marks if possible
		for (i = 0, il = possibleLocations.length; i < il; i++) {
			currentLocation = possibleLocations[i];
			reducedValue = currentLocation.mineCount;

			if (reducedValue < 0) { console.log("reducedValue is less than 0, error"); }

			if (reducedValue === 0) {
				//Reveal all indices of this location
				for (c = 0, cl = currentLocation.indices.length; c < cl; c++) {
					currentIndex = currentLocation.indices[c];
					board.reveal(currentIndex.x, currentIndex.y);
					if (board.isInFailState()) {
						console.log("Solver failed and made a bad move. Shouldn't happen...");
					}
				}
			} else if (reducedValue === currentLocation.indices.length) {
				//Flag all indices of this location
				for (c = 0, cl = currentLocation.indices.length; c < cl; c++) {
					currentIndex = currentLocation.indices[c];
					board.flag(currentIndex.x, currentIndex.y);
				}
			}
		}
	}

	function solveReveal(board) {
		var unsolvedTiles = getAllUnsolvedNumberedTiles(board),
			unsolvedTile,
			currentValue,
			moveMade = false;

		for (var ut = 0, utl = unsolvedTiles.length; ut < utl; ut++) {
			unsolvedTile = unsolvedTiles[ut];
			currentValue = board.reducedValueAtIndex(unsolvedTile.x, unsolvedTile.y);

			if (currentValue === -1) { continue; }

			var neighbors = board.getNeighborIndices(unsolvedTile.x, unsolvedTile.y);

			if (currentValue === 0) {
				moveMade = (revealAllNonMarkedHiddenTiles(board, neighbors)) ? true : moveMade;
			}
		}

		return moveMade;
	}

	function revealAllNonMarkedHiddenTiles(board, arr) {
		var moveMade = false;

		for (var i = 0, il = arr.length; i < il; i++) {
			var a = arr[i];
			if (!board.isRevealed(a.x, a.y) && !board.isFlagged(a.x, a.y)) {
				moveMade = (board.reveal(a.x, a.y)) ? true : moveMade;
			}
		}

		if (!board.victoryState) { console.log("SOLVER.revealAllNonMarkedHiddenTiles self-destructed"); }

		return moveMade;
	}

	function matrixSolve(board) {
		var unsolvedTiles = getAllUnsolvedNumberedTiles(board),
			hiddenEdgeTiles = getAllEdgeHiddenTiles(board),
			solvingMatrix = new Array(unsolvedTiles.length);

		if (unsolvedTiles.length === 0 || hiddenEdgeTiles.length === 0) { return false; }

		populateMatrix(board, solvingMatrix, unsolvedTiles, hiddenEdgeTiles);

		solvingMatrix = MINESWEEPER.SOLVER.toReducedRowEchelonForm(solvingMatrix, unsolvedTiles.length, hiddenEdgeTiles.length + 1);

		var results = getResults(solvingMatrix, hiddenEdgeTiles.length + 1, unsolvedTiles.length);

		return applyResults(board, results, hiddenEdgeTiles);
	}

	function populateMatrix(board, solvingMatrix, unsolvedTiles, hiddenEdgeTiles) {
		for (var ut = 0, utl = unsolvedTiles.length; ut < utl; ut++) {
			var unsolvedTile = unsolvedTiles[ut];
			solvingMatrix[ut] = new Array(hiddenEdgeTiles.length + 1);

			//Initialize to all zeros
			for (var ht = 0, htl = hiddenEdgeTiles.length; ht < htl; ht++) {
				solvingMatrix[ut][ht] = 0;
			}
			//Set the augmented value
			solvingMatrix[ut][hiddenEdgeTiles.length] = board.valueAtIndex(unsolvedTile.x, unsolvedTile.y);

			var neighbors = board.getNeighborIndices(unsolvedTile.x, unsolvedTile.y);
			for (var n = 0, nl = neighbors.length; n < nl; n++) {
				var neighbor = neighbors[n];

				if (!board.isRevealed(neighbor.x, neighbor.y) &&
					!board.isFlagged(neighbor.x, neighbor.y))
				{
					var index = indexThatMatches(hiddenEdgeTiles, neighbor);
					if (index === -1) { continue; }

					//This neighbor is adjacent to the unsolvedTile
					solvingMatrix[ut][index] = 1;
				} else if (board.isFlagged(neighbor.x, neighbor.y)) {
					//Flags reduce the effective value of a tile
					solvingMatrix[ut][hiddenEdgeTiles.length] -= 1;
				}
			}
		}
	}

	function getResults(solvingMatrix, matrixWidth, matrixHeight) {
		var firstNonZeroRow = 0;

		//Find first non zero row
		for (var y = matrixHeight - 1; y >= 0 && y < matrixHeight; --y) {
			var currentRow = solvingMatrix[y],
				foundNonZero = false;

			for (var x = 0; x < matrixWidth && !foundNonZero; x++) {
				foundNonZero |= currentRow[x] !== 0; // jshint ignore:line
			}

			if (foundNonZero) {
				firstNonZeroRow = y;
				break;
			}
		}

		var maxVariableColumn = matrixWidth - 1,
			results = new Array(matrixWidth - 1);
		for (var row = firstNonZeroRow; row >= 0 && row <= firstNonZeroRow; row--) {

			var failedToFindValue = false,
				pivot = row,
				pivotVal = solvingMatrix[row][pivot],
				val = solvingMatrix[row][maxVariableColumn],
				currentVal;

			for (var col = row + 1; col < maxVariableColumn; col++) {
				currentVal = solvingMatrix[row][col];

				if (pivotVal === 0 && currentVal !== 0) {
					pivot = col;
					pivotVal = currentVal;
				}

				if (currentVal !== 0) {
					if (typeof results[col] !== 'undefined') {
						val -= currentVal * (results[col] ? 1 : 0);
						solvingMatrix[row][col] = 0;
					} else {
						failedToFindValue = true;
					}
				}
			}

			if (pivotVal !== 0) {
				if (failedToFindValue) {
					var minValue = 0, maxValue = 0;

					for (col = row; col < maxVariableColumn; col++) {
						currentVal = solvingMatrix[row][col];
						if (currentVal > 0) {
							maxValue += currentVal;
						}
						if (currentVal < 0) {
							minValue += currentVal;
						}
					}

					if (val === minValue) {
						for (col = row; col < maxVariableColumn; col++) {
							currentVal = solvingMatrix[row][col];
							if (currentVal > 0) {
								results[col] = false;
							}
							if (currentVal < 0) {
								results[col] = true;
							}
						}
					} else if (val === maxValue) {
						for (col = row; col < maxVariableColumn; col++) {
							currentVal = solvingMatrix[row][col];
							if (currentVal > 0) {
								results[col] = true;
							}
							if (currentVal < 0) {
								results[col] = false;
							}
						}
					}
				} else {
					if (typeof results[pivot] === 'undefined') {
						if (val === 0 || val === 1) {
							results[pivot] = (val === 1);
						}
					}
				}
			}
		}

		return results;
	}

	function applyResults(board, results, indices) {
		var madeMove = false;
		for (var r = 0, rl = results.length; r < rl; r++) {
			if (results[r] === false) {
				madeMove = true;
				board.reveal(indices[r].x, indices[r].y);
			} else if (results[r] === true) {
				madeMove = true;
				board.flag(indices[r].x, indices[r].y);
			}
		}

		if (!board.victoryState) { console.log("SOLVER.applyResults self-destructed"); }

		return madeMove;
	}

	//Returns the index in arr that has the same x/y values as loc
	function indexThatMatches(arr, loc) {
		for (var i = 0, il = arr.length; i < il; i++) {
			if (arr[i].x === loc.x && arr[i].y === loc.y) {
				return i;
			}
		}

		return -1;
	}

	function getAllUnsolvedNumberedTiles(board) {
		var arr = [];
		for (var y = 0, yMax = board.dimensions.y; y < yMax; y++) {
			for (var x = 0, xMax = board.dimensions.x; x < xMax; x++) {
				if (board.isRevealed(x, y) && board.anyHiddenAdjacentTo(x, y)) {
					arr.push({x: x, y: y});
				}
			}
		}
		return arr;
	}

	function getAllEdgeHiddenTiles(board) {
		var arr = [];
		for (var y = 0, yMax = board.dimensions.y; y < yMax; y++) {
			for (var x = 0, xMax = board.dimensions.x; x < xMax; x++) {
				if (!board.isRevealed(x, y) && !board.isFlagged(x, y) && board.anyRevealedAdjacentTo(x, y)) {
					arr.push({x: x, y: y});
				}
			}
		}
		return arr;
	}

	MINESWEEPER.SOLVER = MINESWEEPER.SOLVER || {};
	MINESWEEPER.SOLVER.solve = solve;
	MINESWEEPER.SOLVER.matrixSolve = matrixSolve;

	return MINESWEEPER;
}(MINESWEEPER || {}));