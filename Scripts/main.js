var MINESWEEPER = (function(MINESWEEPER) {
	"use strict";
	var canvas = document.getElementById("main-canvas"),
		newGameButton = document.getElementById("new-game-button"),
		solveButton = document.getElementById("solve-button"),
		constantSolvingButton = document.getElementById("constant-solving-toggle"),
		resetStatsButton = document.getElementById("reset-stats-button"),
		winPercentageField = document.getElementById("win-percentage"),
		timeField = document.getElementById("time"),
		timeTakenField = document.getElementById("time-taken"),
		gamesPlayedField = document.getElementById("games-played"),
		board,
		solvingContinuously = false,
		gameCount = 1,
		winCount = 0,
		currentTime = performance.now(),
		lastTime,
		startTime = performance.now();

	function setup() {
		board = MINESWEEPER.createBoardDisplay(canvas, 30, 16, 99);
	}

	function update() {
		var time = ((performance.now() - startTime) / 1000);
		timeField.innerHTML = "Time: " + roundFloat(time, 2);
		setTimeout(update, 1000 / 30);
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
			winPercentageField.innerHTML = "Win Percentage: " + roundFloat(winCount / gameCount, 2);
		}
		lastTime = currentTime;
		currentTime = performance.now();
		timeTakenField.innerHTML = "Time Taken Last Game: " + roundFloat((currentTime - lastTime) / 1000, 2);
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

	resetStatsButton.onclick = function(){
		winCount = 0;
		gameCount = 0;
		currentTime = performance.now();
		lastTime = currentTime;
		startTime = currentTime;
	};

	setup();
	update();
	render();

	function roundFloat(value, decimalPlaces){
		return Math.round(value * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
	}
}(MINESWEEPER || {}));