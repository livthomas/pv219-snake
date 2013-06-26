/**
 * This file contains a simple snake game (https://github.com/livthomas/pv219-snake)
 *
 * Copyright (c) 2013 Tomas Livora <livoratom@gmail.com>
 */

var game;

window.onload = function() {
	var select = document.getElementById("players");
	game = new Game(parseInt(select.options[select.selectedIndex].value));	
	select.onchange = function() {
		game.stop(false);
		game = new Game(parseInt(select.options[select.selectedIndex].value));
	}
}



document.onkeydown = function(e) {
	if (!game || [13,32,37,38,39,40,65,68,73,74,75,76,83,87,98,100,101,102,104].indexOf(e.keyCode) === -1) {
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
			game.snakes[0].turnLeft();
			break;
		case 38: // up arrow
			game.snakes[0].turnUp();
			break;
		case 39: // right arrow
			game.snakes[0].turnRight();
			break;
		case 40: // down arrow
			game.snakes[0].turnDown();
			break;
		case 87: // w
			game.snakes[1].turnUp();
			break;
		case 65: // a
			game.snakes[1].turnLeft();
			break;
		case 83: // s
			game.snakes[1].turnDown();
			break;
		case 68: // d
			game.snakes[1].turnRight();
			break;
		case 73: // i
			game.snakes[2].turnUp();
			break;
		case 74: // j
			game.snakes[2].turnLeft();
			break;
		case 75: // k
			game.snakes[2].turnDown();
			break;
		case 76: // l
			game.snakes[2].turnRight();
			break;
		case 100: // numpad 4
			game.snakes[3].turnLeft();
			break;
		case 104: // numpad 8
			game.snakes[3].turnUp();
			break;
		case 102: // numpad 6
			game.snakes[3].turnRight();
			break;
		case 98: // numpad 2
		case 101: // numpad 5
			game.snakes[3].turnDown();
	}
}

/**
 * Class that controls the game
 */

function Game(players) {
	this.started = false;
	this.stopped = false;
	this.paused = false;

	this.canvas = new Canvas('playingArea', 31, 31, 8);
	this.snakes = [];
	this.mouses = [];

	switch (players) {
		case 4:
			this.snakes.unshift(new Snake(this, [Math.floor(this.canvas.width*3/4)+1, Math.floor(this.canvas.height/2)+1], [-1,0], 3, '#fa0'));
			this.mouses.push(new Mouse(this, '#730'));
		case 3:
			this.snakes.unshift(new Snake(this, [Math.floor(this.canvas.width*1/4)+1, Math.floor(this.canvas.height/2)+1], [1,0], 3, '#f00'));
			this.mouses.push(new Mouse(this, '#730'));
		case 2:
			this.snakes.unshift(new Snake(this, [Math.floor(this.canvas.width/2)+1, Math.floor(this.canvas.height*3/4)+1], [0,-1], 3, '#00f'));
			this.mouses.push(new Mouse(this, '#730'));
		case 1:
			this.snakes.unshift(new Snake(this, [Math.floor(this.canvas.width/2)+1, Math.floor(this.canvas.height*1/4)+1], [0,1], 3, '#0a0'));
			this.mouses.push(new Mouse(this, '#730'));
			break;
		default:
			return;
	}

	for (var i=0, snake; snake = this.snakes[i++];) {
		snake.draw();
	}
}

Game.prototype.start = function() {
	if (this.started || this.stopped) {
		return;
	}
	this.started = true;
	this.run();
}

Game.prototype.stop = function(message) {
	if (!this.started || this.stopped) {
		return;
	}
	this.stopped = true;
	window.clearInterval(this.interval);
	if (!message) {
		return;
	}
	window.setTimeout(function(obj) {
		if (obj.snakes.length === 1) {
			obj.canvas.write('GAME OVER', '#666');
		} else {
			for (var i=0, snake; snake = obj.snakes[i++];) {
				if (snake.alive) {
					obj.canvas.write('PLAYER '+i+' WINS', '#666');
				}
			}
		}		
	}, 10, this);
}

Game.prototype.run = function() {
	if (!this.started || this.stopped) {
		return;
	}
	this.paused = false;
	// reset direction
	for (var i=0, snake; snake = this.snakes[i++];) {
		snake.deleteNewDirection();
	}
	// draw objects
	this.canvas.clear();
	for (var i=0, mouse; mouse = this.mouses[i++];) {
		mouse.draw();
	}
	for (var i=0, snake; snake = this.snakes[i++];) {
		snake.draw();
	}
	// animate
	this.interval = window.setInterval(function(obj) {
		var alive = [];
		for (var i=0, snake; snake = obj.snakes[i++];) {
			if (snake.alive) {
				alive.push(i-1);
			}
		}
		for (var i=0, snake; snake = obj.snakes[alive[i++]];) {
			if (obj.snakes.length === 1 || alive.length > 1) {
				snake.move();
			}
		}
		if (alive.length === 0 || (obj.snakes.length > 1 && alive.length === 1)) {
			obj.stop(true);
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

function Snake(game, position, direction, length, color) {
	this.alive = true;
	this.canvas = game.canvas;
	this.snakes = game.snakes;
	this.mouses = game.mouses;
	this.color = color;
	this.direction = [direction];

	this.body = [];
	for (var i=length-1; i>=0; --i) {
		this.body.push([position[0]-i*direction[0], position[1]-i*direction[1]]);
	}
}

Snake.prototype.head = function() {
	return this.body[this.body.length-1];
}

Snake.prototype.draw = function() {
	for (var i=0, cell; cell = this.body[i++];) {
		this.canvas.drawCell(cell[0], cell[1], this.color);
	}
}

Snake.prototype.move = function() {
	var dir = (this.direction.length > 1) ? this.direction[1] : this.direction[0];
	var head = [this.head()[0]+dir[0], this.head()[1]+dir[1]];
	// crash check
	if (head[0] <= 0 || head[0] > this.canvas.width || head[1] <= 0 || head[1] > this.canvas.height) {
		this.alive = false;
		return;
	}
	for (var i=0, snake; snake = this.snakes[i++];) {
		for (var j=0, cell; cell = snake.body[j++];) {
			if (head[0] === cell[0] && head[1] === cell[1]) {
				this.alive = false;
				return;
			}
		}
	}	
	// add new cell
	this.body.push(head);
	this.canvas.drawCell(head[0], head[1], this.color);
	if (this.direction.length > 1) {
		this.direction.shift();
	}
	// food detection
	var ate = false;
	for (var i=0, mouse; mouse = this.mouses[i++];) {
		if (mouse.position[0] === head[0] && mouse.position[1] === head[1]) {
			ate = true;
			mouse.reposition();
			mouse.draw();
		}
	}
	// remove old cell
	if (!ate) {
		this.canvas.clearCell(this.body[0][0], this.body[0][1]);
		this.body.shift();
	}
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

function Mouse(game, color) {
	this.canvas = game.canvas;
	this.snakes = game.snakes;
	this.color = color;
	this.reposition();
}

Mouse.prototype.reposition = function() {
	var placed = false;
	while (!placed) {
		this.position = [Math.floor(Math.random()*this.canvas.width)+1, Math.floor(Math.random()*this.canvas.height)+1];
		placed = true;
		for (var i=0, cell; cell = this.snakes[0].body[i++];) {
			if (this.position[0] === cell[0] && this.position[1] === cell[1]) {
				placed = false;
			}
		}
	}
}

Mouse.prototype.draw = function() {
	this.canvas.drawCell(this.position[0], this.position[1], this.color);
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

Canvas.prototype.clearCell = function(x, y) {
	this.drawCell(x, y, '#fff');
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
