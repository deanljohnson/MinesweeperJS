var MINESWEEPER = (function(MINESWEEPER) {
	"use strict";
	var canvas = document.getElementById("main-canvas"),
		newGameButton = document.getElementById("new-game-button"),
		solveButton = document.getElementById("solve-button"),
		constantSolvingButton = document.getElementById("constant-solving-toggle"),
		winPercentageField = document.getElementById("win-percentage"),
		timeField = document.getElementById("time"),
		timeTakenField = document.getElementById("time-taken"),
		gamesPlayedField = document.getElementById("games-played"),
		board,
		solvingContinuously = false,
		gameCount = 1,
		winCount = 0,
		currentTime = performance.now(),
		lastTime;

	function setup() {
		board = MINESWEEPER.createBoardDisplay(canvas, 30, 16, 99);
	}

	function update() {
		timeField.innerHTML = "Time: " + (performance.now() / 1000);
		setTimeout(update, 1000 / 60);
	}

	function render() {
		var context = canvas.getContext("2d");

		context.clearRect(0, 0, canvas.width, canvas.height);

		board.render(context);

		requestAnimationFrame(render);
	}

	function getCursorPosition(canvas, event) {
		var rect = canvas.getBoundingClientRect();
		return {x: event.clientX - rect.left, y: event.clientY - rect.top};
	}

	//Prevent scroll wheel from showing up with middle click
	document.body.onmousedown = function(e) { if (e.button === 1) { return false; } };

	//Handles left and middle clicks only
	canvas.onmouseup = function(e) {
		var cursorPos = getCursorPosition(canvas, e);

		if (e.button === 0) {
			board.revealAtPoint(cursorPos);
		} else if (e.button === 1) {
			e.preventDefault();
			board.openSurroundingsAtPoint(cursorPos);
			return false;
		}
	};

	//Handles double click event
	canvas.ondblclick = function(e) {
		var cursorPos = getCursorPosition(canvas, e);

		if (e.button === 0) {
			board.openSurroundingsAtPoint(cursorPos);
		}
	};

	//Handles right clicks only
	canvas.oncontextmenu = function(e) {
		var cursorPos = getCursorPosition(canvas, e);

		//First try to flag. If that fails, open the surroundings
		if (!board.flagAtPoint(cursorPos)) {
			board.openSurroundingsAtPoint(cursorPos);
		}
		e.preventDefault();
		return false;
	};

	window.addEventListener("keydown", onKeyDown, false);
	function onKeyDown(e) {
		e = window.event || e;
		var key = e.keyCode || e.which;
		if (key === 32) {
			board.runSolverOneStep();
			e.preventDefault();
			return false;
		}
	}

	newGameButton.onclick = function() {
		newGame();
	};

	function newGame() {
		if (board.victoryState()) {
			winCount++;
			winPercentageField.innerHTML = "Win Percentage: " + (Math.round((winCount / gameCount) * 100000) / 1000);
		}
		lastTime = currentTime;
		currentTime = performance.now();
		timeTakenField.innerHTML = "Time Taken Last Game: " + ((currentTime - lastTime) / 1000);
		board = MINESWEEPER.createBoardDisplay(canvas, 30, 16, 99);
		gamesPlayedField.innerHTML = "Games Played: " + gameCount;
		gameCount++;
	}

	solveButton.onclick = function() {
		solveTillEnd();
	};

	function solveTillEnd() {
		if (!board.isGameFinished()) {
			if(board.runSolverOneStep()) {
				setTimeout(solveTillEnd, 5);
				return true;
			} else {
				return false;
			}
		}

		return false;
	}

	constantSolvingButton.onclick = function() {
		solvingContinuously = !solvingContinuously;
		solveContinuously();
	};

	function solveContinuously() {
		if (solvingContinuously) {
			if(!solveTillEnd()) {
				newGame();
			}
			setTimeout(solveContinuously, 5);
		}
	}

	setup();
	update();
	render();
}(MINESWEEPER || {}));