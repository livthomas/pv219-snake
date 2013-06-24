/**
 * This file contains a simple snake game (https://github.com/livthomas/pv219-snake)
 *
 * Copyright (c) 2013 Tomas Livora <livoratom@gmail.com>
 */

var game;

window.onload = function() {
	game = new Game();
}

document.onkeydown = function(e) {
	if (!game) {
		return;
	}
	if ([13,32,37,38,39,40,98,100,102,104].indexOf(e.keyCode) === -1) {
		return;
	}
	e.preventDefault();
	switch (e.keyCode) {
		case 13: // enter
			if (!game.started) {
				game.start();
			}
			break;
		case 32: // spacebar
			if (game.paused) {
				game.run();
			} else {
				game.pause();
			}
			break;
		case 37: // left arrow
		case 100: // numpad 4
			game.snake.turnLeft();
			break;
		case 38: // up arrow
		case 104: // numpad 8
			game.snake.turnUp();
			break;
		case 39: // right arrow
		case 102: // numpad 6
			game.snake.turnRight();
			break;
		case 40: // down arrow
		case 98: // numpad 2
			game.snake.turnDown();
	}
}

/**
 * Class that controls the game
 */

function Game() {
	this.started = false;
	this.stopped = false;
	this.paused = false;

	this.canvas = new Canvas('playingArea', 21, 21, 8);
	this.snake = new Snake(this.canvas, 3, [Math.floor(this.canvas.width/2)+1,Math.floor(this.canvas.height/2)+1]);
	this.apple = new Apple(this.canvas, this.snake);

	this.snake.draw();
}

Game.prototype.start = function() {
	if (this.started || this.stopped) {
		return;
	}
	this.started = true;
	this.ate = false;
	this.run();
}

Game.prototype.stop = function() {
	if (!this.started || this.stopped) {
		return;
	}
	this.stopped = true;
	window.clearInterval(this.interval);
	window.setTimeout(function(obj) {
		obj.canvas.write('GAME OVER', '#666');
	}, 100, this);
}

Game.prototype.run = function() {
	if (!this.started || this.stopped) {
		return;
	}
	this.paused = false;
	// reset direction
	this.snake.deleteNewDirection();
	// draw objects
	this.canvas.clear();
	this.apple.draw();
	this.snake.draw();
	// animate
	this.interval = window.setInterval(function(obj) {
		if (!obj.snake.move(!obj.ate)) {
			obj.stop();
		}
		if (obj.snake.head()[0] === obj.apple.position[0] && obj.snake.head()[1] === obj.apple.position[1]) {
			obj.ate = true;
			obj.apple.reposition();
			obj.apple.draw();
		} else {
			obj.ate = false;
		}
	}, 200, this);
}

Game.prototype.pause = function() {
	if (!this.started || this.paused || this.stopped) {
		return;
	}
	this.paused = true;
	window.clearInterval(this.interval);
	this.canvas.write('PAUSED', '#aaa');
}

/**
 * Class that represents a snake
 */

function Snake(canvas, length, position) {
	this.canvas = canvas;
	this.direction = [[0,1]];

	this.body = [];
	for (var i=length-1; i>=0; --i) {
		if (position[1]-i > 0) {
			this.body.push([position[0], position[1]-i]);
		}
	}
}

Snake.prototype.head = function() {
	return this.body[this.body.length-1];
}

Snake.prototype.draw = function() {
	for (var i=0, cell; cell = this.body[i++];) {
		this.canvas.drawCell(cell[0], cell[1], '#00f');
	}
}

Snake.prototype.move = function(shorten) {
	var dir = (this.direction.length > 1) ? this.direction[1] : this.direction[0];
	var head = [this.head()[0]+dir[0], this.head()[1]+dir[1]];
	// crash check
	if (head[0] <= 0 || head[0] > this.canvas.width || head[1] <= 0 || head[1] > this.canvas.height) {
		return false;
	}
	for (var i=0, cell; cell = this.body[i++];) {
		if (head[0] === cell[0] && head[1] === cell[1]) {
			return false;
		}
	}
	// add new cell
	this.body.push(head);
	this.canvas.drawCell(head[0], head[1], '#00f');
	if (this.direction.length > 1) {
		this.direction.shift();
	}
	// remove old cell
	if (shorten) {
		this.canvas.drawCell(this.body[0][0], this.body[0][1], '#fff');
		this.body.shift();
	}
	return true;
}

Snake.prototype.deleteNewDirection = function() {
	this.direction.splice(1,this.direction.length-1);
}

Snake.prototype.checkLastDirection = function(direction) {
	var last = this.direction[this.direction.length-1];
	if (last[0] === direction[0] && last[1] === direction[1]) {
		return true;
	}
	return false;
}

Snake.prototype.turnUp = function() {
	if (this.checkLastDirection([0,-1])) {
		return;
	}
	this.direction.push([0,1]);
}

Snake.prototype.turnDown = function() {
	if (this.checkLastDirection([0,1])) {
		return;
	}
	this.direction.push([0,-1]);
}

Snake.prototype.turnLeft = function() {
	if (this.checkLastDirection([1,0])) {
		return;
	}
	this.direction.push([-1,0]);
}

Snake.prototype.turnRight = function() {
	if (this.checkLastDirection([-1,0])) {
		return;
	}
	this.direction.push([1,0]);
}

/**
 * Class that represents food for the snake
 */

function Apple(canvas, snake) {
	this.canvas = canvas;
	this.snake = snake;
	this.reposition();
}

Apple.prototype.reposition = function() {
	var placed = false;
	while (!placed) {
		this.position = [Math.floor(Math.random()*this.canvas.width)+1, Math.floor(Math.random()*this.canvas.height)+1];
		placed = true;
		for (var i=0, cell; cell = this.snake.body[i++];) {
			if (this.position[0] === cell[0] && this.position[1] === cell[1]) {
				placed = false;
			}
		}
	}
}

Apple.prototype.draw = function() {
	this.canvas.drawCell(this.position[0], this.position[1], '#f00');
}

/**
 * Class that is responsible for drawing on canvas
 */

function Canvas(id, width, height, size) {
	this.width = width;
	this.pixelWidth = (width+2)*size + width+1;
	this.height = height;
	this.pixelHeight = (height+2)*size + width+1;
	this.size = size;
	// adjust canvas dimensions
	var element = document.getElementById(id);
	element.setAttribute('width', this.pixelWidth);
	element.setAttribute('height', this.pixelHeight);
	// draw border
	this.context = element.getContext('2d');
	this.context.fillStyle = '#000';
	this.context.fillRect(0, 0, this.pixelWidth, this.pixelHeight);
	this.context.fillStyle = '#fff';
	this.context.fillRect(this.size, this.size, this.pixelWidth - 2*this.size, this.pixelHeight - 2*this.size);
}

Canvas.prototype.drawCell = function(x, y, color) {
	this.context.fillStyle = color;
	this.context.fillRect(this.size*x + x, this.pixelHeight - (this.size*(y+1) + y), this.size, this.size);
}

Canvas.prototype.write = function(text, color) {
	this.context.fillStyle = color;
	this.context.font = 'bold '+this.width+'px Arial';
	this.context.textAlign = 'center';
	this.context.textBaseline = 'middle';
	this.context.fillText(text, Math.floor(this.pixelWidth/2), Math.floor(this.pixelHeight/2));
}

Canvas.prototype.clear = function() {
	this.context.fillStyle = '#fff';
	this.context.fillRect(this.size, this.size, this.pixelWidth - 2*this.size, this.pixelHeight - 2*this.size);
}
