/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Tomas Livora <livoratom@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
 * Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
    this.active = true;

    this.maxNumber = 2;
    this.winNumber = winNumber;
    this.score = 0;

    for (x = 0; x < width; x++) {
        this.tiles[x] = [];
        for (y = 0; y < height; y++) {
            this.tiles[x][y] = null;
            this.canvas.drawTile(x, y, null);
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
    if (!this.active || !this.tiles[fromX][fromY]) {
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

            // check maximum number
            this.maxNumber = Math.max(this.maxNumber, newTile.number);
            if (this.maxNumber === this.winNumber) {
                this.active = false;
                this.canvas.write("You win!")
            }

            this.score += newTile.number;
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
    if (this.active && this.moved) {
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
    } else if (this.freeTiles === 0) {
        this.active = false;
        this.canvas.write("Game over")
    }
    // print score
    document.getElementById("score").innerHTML = this.score.toString();
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
    this.pixelWidth = width * Math.floor(size * 1.1);
    this.pixelHeight = height * Math.floor(size * 1.1);
    this.size = size;

    // adjust canvas dimensions
    var element = document.getElementById(id);
    element.setAttribute('width', this.pixelWidth);
    element.setAttribute('height', this.pixelHeight);

    this.context = element.getContext('2d');
}

Canvas.prototype.drawTile = function (x, y, tile) {
    var color = '#f8f8f8';
    if (tile) {
        switch (tile.number) {
            case 2:
                color = '#ddd';
                break;
            case 4:
                color = '#dca';
                break;
            case 8:
                color = '#f93';
                break;
            case 16:
                color = '#f60';
                break;
            case 32:
                color = '#f30';
                break;
            case 64:
                color = '#f00';
                break;
            case 128:
            case 256:
                color = '#fc0';
                break;
            case 512:
            case 1024:
            case 2048:
                color = '#fc6';
                break;
            default:
                color = '#000';
        }
    }

    var rectX = Math.floor(this.size * 1.1) * x;
    var rectY = this.pixelHeight - (Math.floor(this.size * 1.1) * (y + 1));
    var rectWidth = this.size;
    var rectHeight = this.size;
    var cornerRadius = Math.floor(this.size * 0.5);

    this.context.fillStyle = '#fff';
    this.context.fillRect(rectX, rectY, rectWidth, rectHeight);

    this.context.fillStyle = color;
    this.context.strokeStyle = color;

    this.context.lineJoin = "round";
    this.context.lineWidth = cornerRadius;

    this.context.strokeRect(rectX + (cornerRadius / 2), rectY + (cornerRadius / 2), rectWidth - cornerRadius,
        rectHeight - cornerRadius);
    this.context.fillRect(rectX + (cornerRadius / 2), rectY + (cornerRadius / 2), rectWidth - cornerRadius,
        rectHeight - cornerRadius);

    // write number
    if (tile) {
        this.context.fillStyle = '#000';
        this.context.font = 'bold ' + Math.floor(this.size / 3) + 'px Arial';
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        this.context.fillText(tile.number, Math.floor(this.size * 1.1 * (x + 0.45)),
            this.pixelHeight - Math.floor(this.size * 1.1 * (y + 0.55)));
    }
};

Canvas.prototype.write = function (text) {
    this.context.fillStyle = '#000';
    this.context.font = 'bold ' + Math.floor(this.size * 0.75) + 'px Arial';
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
    this.context.fillText(text, Math.floor(this.pixelWidth / 2), Math.floor(this.pixelHeight / 2));
};
