/**
 * This file contains a simple 2048 game (https://github.com/livthomas/2048)
 *
 * Copyright (c) 2015 Tomas Livora <livoratom@gmail.com>
 */

var game;

window.onload = function () {
    game = new Game(4, 4, 2048);
};

document.onkeydown = function (e) {
    if (!game || [37, 38, 39, 40].indexOf(e.keyCode) === -1) {
        return;
    }
    e.preventDefault();
    switch (e.keyCode) {
        case 37:
            game.moveLeft();
            break;
        case 38:
            game.moveUp();
            break;
        case 39:
            game.moveRight();
            break;
        case 40:
            game.moveDown();
    }
};

/**
 * Class that controls the game
 */
function Game(width, height, winNumber) {

    this.canvas = new Canvas('playingArea', width, height, 100);
    this.tiles = [];
    this.freeTiles = width * height;

    this.moved = false;

    this.maxNumber = 2;
    this.winNumber = winNumber;

    for (x = 0; x < width; x++) {
        this.tiles[x] = [];
        for (y = 0; y < height; y++) {
            this.tiles[x][y] = null;
        }
    }

    this.addTile();
    this.addTile();

}

Game.prototype.addTile = function () {
    if (!this.freeTiles) {
        return;
    }

    var tilePosition = Math.floor(Math.random() * this.freeTiles) + 1;

    for (x = 0; x < this.tiles.length; x++) {
        for (y = 0; y < this.tiles[x].length; y++) {
            if (!this.tiles[x][y] && !--tilePosition) {
                var tile = new Tile(2, false);
                this.tiles[x][y] = tile;
                this.canvas.drawTile(x, y, tile);
                this.freeTiles--;
            }
        }
    }
};

Game.prototype.moveTile = function (fromX, fromY, deltaX, deltaY) {
    // original position empty
    if (!this.tiles[fromX][fromY]) {
        return;
    }
    while (0 <= fromX + deltaX && fromX + deltaX < this.tiles.length && 0 <= fromY + deltaY && fromY + deltaY < this.tiles[0].length) {
        // next position empty
        if (!this.tiles[fromX + deltaX][fromY + deltaY]) {
            this.tiles[fromX + deltaX][fromY + deltaY] = this.tiles[fromX][fromY];
            this.canvas.drawTile(fromX + deltaX, fromY + deltaY, this.tiles[fromX + deltaX][fromY + deltaY]);
            this.tiles[fromX][fromY] = null;
            this.canvas.drawTile(fromX, fromY, null);
            this.moved = true;
        }
        // same number
        var tile1 = this.tiles[fromX][fromY];
        var tile2 = this.tiles[fromX + deltaX][fromY + deltaY];
        if (tile1 && tile2 && tile1.number === tile2.number && !tile1.changed && !tile2.changed) {
            var newTile = new Tile(tile1.number * 2, true);
            this.tiles[fromX + deltaX][fromY + deltaY] = newTile;
            this.canvas.drawTile(fromX + deltaX, fromY + deltaY, newTile);
            this.tiles[fromX][fromY] = null;
            this.canvas.drawTile(fromX, fromY, null);
            this.freeTiles++;
            this.maxNumber = Math.max(this.maxNumber, newTile.number);
            this.moved = true;
            return;
        }
        // move directions
        fromX += deltaX;
        fromY += deltaY;
    }
};

Game.prototype.moveLeft = function () {
    for (x = 1; x < 4; x++) {
        for (y = 0; y < 4; y++) {
            this.moveTile(x, y, -1, 0);
        }
    }
    this.afterMove();
};

Game.prototype.moveUp = function () {
    for (y = 2; y >= 0; y--) {
        for (x = 0; x < 4; x++) {
            this.moveTile(x, y, 0, 1);
        }
    }
    this.afterMove();
};

Game.prototype.moveRight = function () {
    for (x = 2; x >= 0; x--) {
        for (y = 0; y < 4; y++) {
            this.moveTile(x, y, 1, 0);
        }
    }
    this.afterMove();
};

Game.prototype.moveDown = function () {
    for (y = 1; y < 4; y++) {
        for (x = 0; x < 4; x++) {
            this.moveTile(x, y, 0, -1);
        }
    }
    this.afterMove();
};

Game.prototype.afterMove = function () {
    if (this.moved) {
        this.addTile();
        this.moved = false;
        // mark all tiles as not changed
        for (x = 0; x < this.tiles.length; x++) {
            for (y = 0; y < this.tiles[x].length; y++) {
                if (this.tiles[x][y]) {
                    this.tiles[x][y].changed = false;
                }
            }
        }
    }
};

/**
 * Class that represents a single tile
 */
function Tile(number, changed) {
    this.number = number;
    this.changed = changed;
}

/**
 * Class that is responsible for drawing on the canvas
 */
function Canvas(id, width, height, size) {
    this.width = width;
    this.pixelWidth = width * size;
    this.height = height;
    this.pixelHeight = height * size;
    this.size = size;

    // adjust canvas dimensions
    var element = document.getElementById(id);
    element.setAttribute('width', this.pixelWidth);
    element.setAttribute('height', this.pixelHeight);

    this.context = element.getContext('2d');
}

Canvas.prototype.drawTile = function (x, y, tile) {
    if (tile) {
        switch (tile.number) {
            case 2:
                this.context.fillStyle = '#ddd';
                break;
            case 4:
                this.context.fillStyle = '#D6C2AD';
                break;
            case 8:
                this.context.fillStyle = '#f93';
                break;
            case 16:
                this.context.fillStyle = '#f60';
                break;
            case 32:
                this.context.fillStyle = '#f30';
                break;
            case 64:
                this.context.fillStyle = '#f00';
                break;
            case 128:
            case 256:
                this.context.fillStyle = '#fc0';
                break;
            case 512:
            case 1024:
            case 2048:
                this.context.fillStyle = '#fc6';
                break;
            default:
                this.context.fillStyle = '#000';
        }
    } else {
        this.context.fillStyle = '#fff';
    }

    this.context.fillRect(this.size * x, this.pixelHeight - (this.size * (y + 1)), this.size, this.size);

    if (tile) {
        this.context.fillStyle = '#000';
        this.context.font = 'bold ' + Math.floor(this.size / 3) + 'px Arial';
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        this.context.fillText(tile.number, Math.floor(this.size * (x + 0.5)), this.pixelHeight - Math.floor(this.size * (y + 0.5)));
    }
};
