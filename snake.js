var game;

window.onload = function() {
	game = new Game();
}

document.onkeydown = function(e) {
	if (!game) {
		return;
	}
	
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

function Game() {
	this.started = false;
	this.paused = true;

	this.canvas = new Canvas('playingArea', 21, 21, 8);
	this.snake = new Snake(this.canvas, 3, [11,11]);
	this.snake.draw();

	this.start = function() {
		this.started = true;

		this.apple = new Apple(this.canvas, this.snake);
		this.apple.draw();

		this.ate = false;

		this.run();
	}

	this.run = function() {
		if (!this.started) {
			return;
		}

		this.paused = false;
		this.interval = window.setInterval(function(obj) {
			if (!obj.snake.move(!obj.ate)) {
				window.clearInterval(obj.interval);
			}
			obj.canvas.clear();

			if (obj.snake.head()[0] === obj.apple.position[0] && obj.snake.head()[1] === obj.apple.position[1]) {
				obj.ate = true;
				obj.apple.reposition();
			} else {
				obj.ate = false;
				obj.apple.draw();
			}

			obj.snake.draw();
		}, 200, this);
	}

	this.pause = function() {
		this.paused = true;
		window.clearInterval(this.interval);
	}
}

function Snake(canvas, size, position) {
	//position = typeof position !== 'undefined' ? position : canvas.;

	this.canvas = canvas;
	this.direction = [0,1];
	this.prevDirection = [0,1];

	this.body = [];
	for (i=size-1; i>=0; --i) {
		this.body.push([position[0], position[1]-i]);
	}

	this.head = function() {
		return this.body[this.body.length-1];
	}

	this.draw = function() {
		for (i=0; i<this.body.length; ++i) {
			this.canvas.drawCell(this.body[i][0], this.body[i][1], '#00f');
		}
	}

	this.move = function(shorten) {
		var head = [this.head()[0]+this.direction[0], this.head()[1]+this.direction[1]];
		// check boundaries
		if (head[0] <= 0 || head[0] > this.canvas.width || head[1] <= 0 || head[1] > this.canvas.height) {
			return false;
		}
		for (i=0; i<this.body.length-1; ++i) {
			if (head[0] === this.body[i][0] && head[1] === this.body[i][1]) {
				return false;
			}
		}
		// add new cell
		this.body.push(head);
		this.prevDirection = this.direction;
		// remove old cell
		if (shorten) {
			this.body.shift();
		}
		return true;
	}

	this.turnUp = function() {
		if (this.prevDirection[0] === 0 && this.prevDirection[1] === -1) {
			return;
		}
		this.direction = [0,1];
	}

	this.turnDown = function() {
		if (this.prevDirection[0] === 0 && this.prevDirection[1] === 1) {
			return;
		}
		this.direction = [0,-1];
	}

	this.turnLeft = function() {
		if (this.prevDirection[0] === 1 && this.prevDirection[1] === 0) {
			return;
		}
		this.direction = [-1,0];
	}

	this.turnRight = function() {
		if (this.prevDirection[0] === -1 && this.prevDirection[1] === 0) {
			return;
		}
		this.direction = [1,0];
	}
}

function Apple(canvas, snake) {
	this.canvas = canvas;

	this.reposition = function() {
		var placed = false;
		while (!placed) {
			this.position = [Math.floor(Math.random()*this.canvas.width)+1, Math.floor(Math.random()*this.canvas.height)+1];
			placed = true;
			for (i=0; i<snake.body.length; ++i) {
				if (this.position[0] === snake.body[i][0] && this.position[1] === snake.body[i][1]) {
					placed = false;
				}
			}
		}
	}

	this.draw = function() {
		this.canvas.drawCell(this.position[0], this.position[1], '#f00');
	}

	this.reposition();
}

function Canvas(id, width, height, size) {
	this.width = width;
	this.pixelWidth = (width+2)*size + width+1;
	this.height = height;
	this.pixelHeight = (height+2)*size + width+1;
	this.size = size;

	var element = document.getElementById(id);
	element.setAttribute('width', this.pixelWidth);
	element.setAttribute('height', this.pixelHeight);

	this.context = element.getContext('2d');
	this.context.fillStyle = '#000';
	this.context.fillRect(0, 0, this.pixelWidth, this.pixelHeight);
	this.context.fillStyle = '#fff';
	this.context.fillRect(this.size, this.size, this.pixelWidth - 2*this.size, this.pixelHeight - 2*this.size);

	this.drawCell = function(x, y, color) {
		this.context.fillStyle = color;
		this.context.fillRect(this.size*x + x, this.pixelHeight - (this.size*(y+1) + y), this.size, this.size);
	}

	this.clear = function() {
		this.context.fillStyle = '#fff';
		this.context.fillRect(this.size, this.size, this.pixelWidth - 2*this.size, this.pixelHeight - 2*this.size);
	}
}