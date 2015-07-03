var MINESWEEPER = (function(MINESWEEPER) {
	"use strict";
	function toReducedRowEchelonForm(arr, numRows, numColumns) {
		var lead = 0;
		for (var r = 0; r < numRows; r++) {
			if (numColumns <= lead) {
				return arr;
			}
			var i = r;
			while (arr[i][lead] === 0) {
				i++;
				if (numRows === i) {
					i = r;
					lead++;
					if (numColumns === lead) {
						return arr;
					}
				}
			}

			var tmp = arr[i];
			arr[i] = arr[r];
			arr[r] = tmp;

			var val = arr[r][lead];
			if (val !== 0)
			{
				for (var j = 0; j < numColumns; j++) {
					arr[r][j] /= val;
				}
			}

			for (i = 0; i < numRows; i++) {
				if (i === r) { continue; }
				val = arr[i][lead];
				for (var k = 0; k < numColumns; k++) {
					arr[i][k] -= val * arr[r][k];
				}
			}
			lead++;
		}
		return arr;
	}

	MINESWEEPER.SOLVER = MINESWEEPER.SOLVER || {};
	MINESWEEPER.SOLVER.toReducedRowEchelonForm = toReducedRowEchelonForm;

	return MINESWEEPER;
}(MINESWEEPER || {}));