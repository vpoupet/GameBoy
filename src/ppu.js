/**
 * Screen colors as "web" hex values, from lightest to darkest
 * @type {string[]}
 */
const hexColors = ["#9BBC0F", "#8BAC0F", "#306230", "#0F380F"];
/**
 * Screen colors, as UInt32
 * @type {number[]}
 */
const colors = hexColors.map(h => Number("0xFF" + h.slice(5, 7) + h.slice(3, 5) + h.slice(1, 3)));


class PPU {
    constructor(dmg) {
        this.dmg = dmg;
        this.mmu = dmg.mmu;
        this.canvasList = [...document.getElementsByClassName("screen-layer")];
        this.contextList = this.canvasList.map(c => c.getContext('2d'));
        this.upscaleFactor = 2;
        for (const canvas of this.canvasList) {
            canvas.width = 160 * this.upscaleFactor;
            canvas.height = 144 * this.upscaleFactor;
        }
        this.imageDataList = this.contextList.map(context => context.createImageData(160 * this.upscaleFactor, 144 * this.upscaleFactor));
        this.reset();
    }

    reset() {
        this.enabled = true;
        this.windowLine = 0;
        this.winY = 0;
        this.lcdcStatus = false;
        this.clock = 0;
        this.shouldDrawLines = true;
        this.mmu.memory[0xff44] = 0;    // reset LY
        this.setMode(0);
        this.updateCoincidenceFlag();
        this.clearScreen();
    }

    setMode(val) {
        this.mmu.memory[0xff41] = this.mmu.memory[0xff41] & 0xfc | val;
    }

    updateCoincidenceFlag() {
        if (this.mmu.memory[0xff44] === this.mmu.memory[0xff45]) {
            this.mmu.memory[0xff41] |= 0x04;    // set coincidence flag
        } else {
            this.mmu.memory[0xff41] &= 0xfb;    // reset coincidence flag
        }
    }

    clearScreen() {
        const width = this.canvasList[0].width;
        const height = this.canvasList[0].height;
        for (const context of this.contextList) {
            context.clearRect(0, 0, width, height);
        }
    }

    toggleRemake() {
        // dummy implementation, should be overridden in subclasses
    }

    setEnabled(val) {
        // TODO: check what happens when display disabled
        if (val && !this.enabled) {
            this.reset();
        }
        this.enabled = val;
    }

    startFrame() {
        for (let i = 0; i < this.contextList.length; i++) {
            this.contextList[i].putImageData(this.imageDataList[i], 0, 0);
            this.imageDataList[i].data.fill(0); // clear ImageData
        }
    }

    endFrame() {
        this.windowLine = 0;
        this.winY = this.mmu.memory[0xff4a];
        this.dmg.isNewFrame = true;
    }

    update(deltaClock) {
        this.clock += deltaClock;
        const lineClock = this.clock % 456;
        const frameClock = this.clock % 70224;

        // FF44 - LY - LCDC Y-Coordinate (R)
        if (lineClock - deltaClock < 0) {
            this.mmu.memory[0xff44] = (this.mmu.memory[0xff44] + 1) % 154;
            this.updateCoincidenceFlag();
        }

        // FF41 - STAT - LCDC Status (R/W)
        // Update LCD Mode Flag (bits 0-1)
        if (frameClock >= 65664) {
            // in V-Blank
            if (frameClock - deltaClock < 65664) {
                this.setMode(1);
                this.mmu.memory[0xff0f] |= 0x01;    // request V-Blank interrupt
                this.endFrame();
            }
        } else if (lineClock - deltaClock < 0) {
            this.setMode(2);    // Reading from OAM (80 cycles)
        } else if (80 <= lineClock && lineClock - deltaClock < 80) {
            this.setMode(3);    // Reading from OAM and VRAM (172 cycles)
            if (this.shouldDrawLines) {
                this.drawLine(this.mmu.memory[0xff44]);    // draw line at beginning of mode 3
            }
        } else if (252 <= lineClock && lineClock - deltaClock < 252) {
            this.setMode(0);    // H-Blank (204 cycles)
        }

        // Update Interrupts
        const previousStatus = this.lcdcStatus;
        const _ff41 = this.mmu.memory[0xff41];
        this.lcdcStatus = (_ff41 & 0x40) && this.mmu.memory[0xff44] === this.mmu.memory[0xff45]
            || (_ff41 & 0x20) && (_ff41 & 0x03) === 2
            || (_ff41 & 0x10) && (_ff41 & 0x03) === 1
            || (_ff41 & 0x08) && (_ff41 & 0x03) === 0;
        if (!previousStatus && this.lcdcStatus) {
            this.mmu.memory[0xff0f] |= 0x02;    // request interrupt
        }
    }

    fillUpscaledPixel(imageData, x, y, color, factor) {
        if (0 <= x && x * factor < imageData.width) {
            const arrayBuffer = new Uint32Array(imageData.data.buffer);
            for (let i = 0; i < factor; i++) {
                for (let j = 0; j < factor; j++) {
                    arrayBuffer[(y * factor + i) * imageData.width + x * factor + j] = color;
                }
            }
        }
    }

    drawTileLine(tileOffset, lineIndex, imageData, x, y, upscaleFactor, palette = [0, 1, 2, 3]) {
        const byte0 = this.mmu.memory[tileOffset + 2 * lineIndex];
        const byte1 = this.mmu.memory[tileOffset + 2 * lineIndex + 1];
        for (let i = 0; i < 8; i++) {
            const j = 7 - i;
            const shade = (byte0 & 1 << j | (byte1 & 1 << j) << 1) >> j;
            this.fillUpscaledPixel(imageData, x + i, y, colors[palette[shade]], upscaleFactor);
        }
    }

    drawBGTileLine(tileOffset, lineIndex, x, y, upscaleFactor, palette) {
        const byte0 = this.mmu.memory[tileOffset + 2 * lineIndex];
        const byte1 = this.mmu.memory[tileOffset + 2 * lineIndex + 1];
        for (let i = 0; i < 8; i++) {
            const j = 7 - i;
            const shade = (byte0 & 1 << j | (byte1 & 1 << j) << 1) >> j;
            if (shade === 0) {
                this.fillUpscaledPixel(this.imageDataList[0], x + i, y, colors[palette[shade]], upscaleFactor);
                this.fillUpscaledPixel(this.imageDataList[2], x + i, y, 0, upscaleFactor);
            } else {
                this.fillUpscaledPixel(this.imageDataList[2], x + i, y, colors[palette[shade]], upscaleFactor);
            }
        }
    }

    drawObjectTileLine(tileOffset, lineIndex, x, y, upscaleFactor, palette, attributes) {
        const imageData = (attributes & 0x80) ? this.imageDataList[1] : this.imageDataList[3];
        const byte0 = this.mmu.memory[tileOffset + 2 * lineIndex];
        const byte1 = this.mmu.memory[tileOffset + 2 * lineIndex + 1];
        for (let i = 0; i < 8; i++) {
            const j = 7 - i;
            const shade = (byte0 & 1 << j | (byte1 & 1 << j) << 1) >> j;
            if (shade !== 0) {
                if (attributes & 0x20) {
                    this.fillUpscaledPixel(imageData, x + 7 - i, y, colors[palette[shade]], upscaleFactor);
                } else {
                    this.fillUpscaledPixel(imageData, x + i, y, colors[palette[shade]], upscaleFactor);
                }
            }
        }
    }

    makePalette(value) {
        return [value & 0x03, (value >> 2) & 0x03, (value >> 4) & 0x03, value >> 6];
    }

    drawLine(ly) {
        const _ff40 = this.mmu.memory[0xff40];  // LCD Control Register

        if ((_ff40 & 0x80) === 0) {
            // display is not enabled
            return;
        }

        if (_ff40 & 0x01) {
            // draw BG
            const _ff42 = this.mmu.memory[0xff42];  // SCY - Scroll Y
            const _ff43 = this.mmu.memory[0xff43];  // SCX - Scroll X
            const bgPalette = this.makePalette(this.mmu.memory[0xff47]);
            const bgY = (ly + _ff42) & 0xff;
            const bgTileMapOffset = (_ff40 & 0x08 ? 0x9c00 : 0x9800) + 32 * (bgY >> 3);
            const bgTileLine = bgY % 8;
            let tx = _ff43 >> 3;        // x-coord of the current tile in tilemap
            let lx = -(_ff43 & 0x07);   // x-coord along the current line
            while (lx < 160) {
                const tileIndex = this.mmu.memory[bgTileMapOffset + tx];
                const tileDataOffset = _ff40 & 0x10 ? 0x8000 + tileIndex * 16 : 0x9000 + (tileIndex << 24 >> 24) * 16;
                this.drawBGTileLine(tileDataOffset, bgTileLine, lx, ly, this.upscaleFactor, bgPalette);
                tx += 1;
                tx %= 32;
                lx += 8;
            }
            if (_ff40 & 0x20) {
                // draw Window
                const winX = this.mmu.memory[0xff4b] - 7;  // FF4B - WX (Window X Position + 7) (R/W)
                if (this.winY <= ly && winX < 160) {
                    // Window is shown on current line
                    const winTileMapOffset = (_ff40 & 0x40 ? 0x9c00 : 0x9800) + 32 * (this.windowLine >> 3);
                    const winTileLine = this.windowLine % 8;
                    tx = 0;
                    lx = winX;
                    while (lx < 160) {
                        const tileIndex = this.mmu.memory[winTileMapOffset + tx];
                        const tileDataOffset = _ff40 & 0x10 ? 0x8000 + tileIndex * 16 : 0x9000 + (tileIndex << 24 >> 24) * 16;
                        this.drawBGTileLine(tileDataOffset, winTileLine, lx, ly, this.upscaleFactor, bgPalette);
                        tx += 1;
                        tx %= 32;
                        lx += 8;
                    }
                    this.windowLine += 1;
                }
            }
        }

        // Sprites
        if (_ff40 & 0x02) { // Sprites enabled
            const obp0 = this.makePalette(this.mmu.memory[0xff48]); // OBP0 - Object Palette 0 Data
            const obp1 = this.makePalette(this.mmu.memory[0xff49]); // OBP1 - Object Palette 1 Data
            const spriteSize = _ff40 & 0x04 ? 16 : 8;
            const lineObjects = this.searchOAM();
            for (const lineObject of lineObjects) {
                let spriteLine = ly - lineObject.y;
                if (lineObject.attributes & 0x40) {    // Y-flip
                    spriteLine = spriteSize - 1 - spriteLine;
                }
                this.drawObjectTileLine(
                    0x8000 + lineObject.tileIndex * 16,
                    spriteLine,
                    lineObject.x,
                    ly,
                    this.upscaleFactor,
                    (lineObject.attributes & 0x10) ? obp1 : obp0,
                    lineObject.attributes);
            }
        }
    }

    displayTiles() {
        const tilesCanvas = document.getElementById("tiles");
        const tilesContext = tilesCanvas.getContext('2d');
        const tilesData = tilesContext.createImageData(128, 192);
        for (let tileIndex = 0; tileIndex < 384; tileIndex++) {
            for (let lineIndex = 0; lineIndex < 8; lineIndex++) {
                this.drawTileLine(
                    0x8000 + 16 * tileIndex,
                    lineIndex,
                    tilesData,
                    (tileIndex % 16) * 8,
                    ~~(tileIndex / 16) * 8 + lineIndex,
                    1
                );
            }
        }
        tilesContext.putImageData(tilesData, 0, 0);
    }

    displayMaps() {
        const palette = this.makePalette(this.mmu.memory[0xff47]);
        for (let mapIndex = 0; mapIndex < 2; mapIndex++) {
            const bgCanvas = document.getElementById("background" + mapIndex);
            const bgContext = bgCanvas.getContext('2d');
            const bgData = bgContext.createImageData(256, 256);
            const tileMapOffset = mapIndex === 0 ? 0x9800 : 0x9c00;
            let tileOffset;
            for (let ty = 0; ty < 32; ty++) {
                for (let lineIndex = 0; lineIndex < 8; lineIndex++) {
                    for (let tx = 0; tx < 32; tx++) {
                        const tileIndex = this.mmu.memory[tileMapOffset + 32 * ty + tx];
                        if (this.mmu.memory[0xff40] & 0x10) {
                            tileOffset = 0x8000 + 16 * tileIndex;
                        } else {
                            tileOffset = 0x9000 + 16 * (tileIndex << 24 >> 24);
                        }
                        this.drawTileLine(
                            tileOffset,
                            lineIndex,
                            bgData,
                            8 * tx,
                            8 * ty + lineIndex,
                            1,
                            palette,
                        )
                    }
                }
            }
            bgContext.putImageData(bgData, 0, 0);
        }
    }

    searchOAM() {
        this.objSize = this.mmu.memory[0xff40] & 0x04 ? 16 : 8;
        let lineObjects = [];
        const ly = this.mmu.memory[0xff44];
        for (let offset = 0xfe00; offset < 0xfea0; offset += 4) {
            const objY = this.mmu.memory[offset] - 16;
            if (objY <= ly && ly < objY + this.objSize) {
                let tileIndex = this.mmu.memory[offset + 2];
                if (this.objSize === 16) tileIndex &= 0xfe;
                lineObjects.unshift({
                    y: objY,
                    x: this.mmu.memory[offset + 1] - 8,
                    tileIndex: tileIndex,
                    attributes: this.mmu.memory[offset + 3],
                });
                if (lineObjects.length >= 10) break;
            }
        }
        lineObjects.sort((a, b) => b.x - a.x);
        return lineObjects;
    }
}


class SuperMarioLandPPU extends PPU {
    constructor(dmg) {
        super(dmg);
        this.windowY = undefined;
        this.state = 0;
        this.remakeLoaded = false;
        this.remakeEnabled = false;
        this.backgroundImage = 'none';
        this.parallaxImage = 'none';
        this.parallaxDiv = document.getElementById("parallax");
        this.scrollX = 0;
        this.isInLevel = false;

        fetch(`remake/${dmg.gameTitle}/data.json`)
            .then(response => {
                if (response.ok) {
                    return response.json()
                }
            })
            .then(data => {
                this.remakeData = data;
                this.tilesImage = new Image();
                this.tilesImage.onload = function () {
                    const canvas = document.createElement('canvas');
                    canvas.width = this.tilesImage.width;
                    canvas.height = this.tilesImage.height;
                    const context = canvas.getContext('2d');
                    context.drawImage(this.tilesImage, 0, 0, canvas.width, canvas.height);
                    this.tilesImageData = context.getImageData(0, 0, canvas.width, canvas.height);
                    this.remakeloaded = true;
                    this.onRemakeLoad();
                }.bind(this);
                this.tilesImage.src = 'remake/SUPER MARIOLAND/tiles.png';
            });
    }

    reset() {
        super.reset();
        if (this.remakeLoaded) {
            this.onStateChange();
        }
    }

    onRemakeLoad() {
        this.onStateChange();
        this.tilemapIndex = 0;
    }

    onStateChange() {
        // set background image
        const bg = this.remakeData['bg'][this.state];
        this.backgroundImage = bg ? `url('remake/SUPER MARIOLAND/background/${bg}')` : 'none';
        // set parallax image
        const parallax = this.remakeData['parallax'][this.state];
        this.parallaxImage = parallax ? `url('remake/SUPER MARIOLAND/parallax/${parallax}')` : 'none';
        // set tilemap
        this.tilemapIndex = this.remakeData['tilemapIndex'][this.state];
        if (this.remakeEnabled) {
            this.canvasList[2].style.backgroundImage = this.backgroundImage;
            this.parallaxDiv.style.backgroundImage = this.parallaxImage;
        } else {
            this.canvasList[2].style.backgroundImage = 'none';
            this.parallaxDiv.style.backgroundImage = 'none';
        }
    }

    updateState() {
        let state;
        this.isInLevel = false;
        switch (this.mmu.memory[0x9800]) {
            case 0x16:
                this.isInLevel = true;
                // Playing a level
                if (this.mmu.memory[0x9840] === 0x7f) {
                    // inside a pipe
                    state = 12;
                    break;
                }
                const worldNumber = this.mmu.memory[0x982c];
                const stageNumber = this.mmu.memory[0x982e];
                state = 3 * (worldNumber - 1) + stageNumber - 1;
                break;
            case 0x3c:
                // Title screen
                state = 13;
                break;
            case 0xf5:
                // Bonus screen
                state = 14;
                break;
        }
        if (state !== undefined && this.state !== state) {
            this.state = state;
            this.onStateChange();
        }
    }

    endFrame() {
        super.endFrame();
        if (this.remakeEnabled) {
            this.updateState();

            let bgX = 0;
            if (this.state < 12) {
                const scx = this.mmu.memory[0xff43];
                const _c0ab = this.mmu.memory[0xc0ab] - 0x0c;
                bgX = -(_c0ab * 16 + (scx << 28 >> 28)) * this.upscaleFactor;
            }
            this.canvasList[2].style.backgroundPosition = `${bgX}px 0px`;
            this.parallaxDiv.style.backgroundPosition = `${bgX / 2}px 0px`;

            this.drawObjects();
            this.drawWindow();
        }
    }

    toggleRemake() {
        this.remakeEnabled = !this.remakeEnabled;
        this.canvasList[2].style.backgroundImage = this.remakeEnabled ? this.backgroundImage : 'none';
        this.parallaxDiv.style.backgroundImage = this.remakeEnabled ? this.parallaxImage : 'none';
    }

    drawLine(ly) {
        if (!this.remakeEnabled) {
            return super.drawLine(ly);
        } else {
            const _ff40 = this.mmu.memory[0xff40];  // LCD Control Register

            if (ly % 8 === 0) {
                // draw a row of BG tiles
                const y = ly >> 3;
                const tilemapIndex = (this.isInLevel && y < 2) ? 2  : this.tilemapIndex;
                const bgTileMapOffset = (_ff40 & 0x08 ? 0x9c00 : 0x9800);
                const _ff43 = ly === 0 ? 0 : this.mmu.memory[0xff43];  // SCX - Scroll X (hack to fix first line shaking)
                const x0 = _ff43 >> 3; // x-coordinate of top-left drawn tile in tile map
                for (let x = x0; x <= x0 + 20; x++) {
                    const indexInTileMap = 32 * (y % 32) + (x % 32);
                    const tileIndex = this.mmu.memory[bgTileMapOffset + indexInTileMap];
                    const tileOffset = _ff40 & 0x10 ? 0x8000 + tileIndex * 16 : 0x9000 + (tileIndex << 24 >> 24) * 16;
                    let tileX = 8 * (x % 32) - _ff43;
                    if (tileX <= -8) {
                        tileX &= 0xff;
                    }
                    this.drawTile(tileOffset, tileX, ly, 2, tilemapIndex);
                }
                // check for window
                if (_ff40 & 0x20) {
                    this.windowY = this.mmu.memory[0xff4a];
                }
            }
        }
    }

    drawWindow() {
        if (this.windowY !== undefined) {
            const _ff40 = this.mmu.memory[0xff40];  // LCD Control Register
            const windowX = this.mmu.memory[0xff4b] - 7;
            const windowTileMapOffset = (_ff40 & 0x40 ? 0x9c00 : 0x9800);
            for (let x = 0; windowX + 8 * x < 160; x++) {
                const tileIndex = this.mmu.memory[windowTileMapOffset + x];
                const tileOffset = _ff40 & 0x10 ? 0x8000 + tileIndex * 16 : 0x9000 + (tileIndex << 24 >> 24) * 16;
                this.drawTile(tileOffset, 8 * x + windowX, this.windowY, 2, 2);
            }
        }
        this.windowY = undefined;
    }

    drawTile(tileOffset, x, y, layerIndex, tilemapIndex=undefined) {
        if (tilemapIndex === undefined) tilemapIndex = this.tilemapIndex;
        const tileCode = this.mmu.memory.slice(tileOffset, tileOffset + 16);
        const remakeIndex = this.remakeData['tilemaps'][tilemapIndex][tileOffset]?.[tileCode];
        if (remakeIndex !== undefined) {
            this.contextList[layerIndex].drawImage(
                this.tilesImage,
                8 * (remakeIndex % 16) * this.upscaleFactor,
                8 * ~~(remakeIndex / 16) * this.upscaleFactor,
                8 * this.upscaleFactor,
                8 * this.upscaleFactor,
                x * this.upscaleFactor,
                y * this.upscaleFactor,
                8 * this.upscaleFactor,
                8 * this.upscaleFactor,
            )
        }
    }

    drawObjects() {
        let objects = [];
        for (let offset = 0xfe00; offset < 0xfea0; offset += 4) {
            objects.push({
                y: this.mmu.memory[offset] - 16,
                x: this.mmu.memory[offset + 1] - 8,
                tileIndex: this.mmu.memory[offset + 2],
                attributes: this.mmu.memory[offset + 3],
            });
        }
        objects.sort((a, b) => b.x - a.x);
        for (const object of objects) {
            const offset = 0x8000 + object.tileIndex * 16;
            const tileCode = this.mmu.memory.slice(offset, offset + 16);
            const remakeIndex = this.remakeData['tilemaps'][this.tilemapIndex][offset]?.[tileCode];
            if (remakeIndex !== undefined) {
                const context = object.attributes & 0x80 ? this.contextList[1] : this.contextList[3];
                const yScale = object.attributes & 0x40 ? -1 : 1;
                const xScale = object.attributes & 0x20 ? -1 : 1;
                context.save();
                context.scale(xScale, yScale);
                context.drawImage(
                    this.tilesImage,
                    8 * this.upscaleFactor * (remakeIndex % 16),
                    8 * this.upscaleFactor * ~~(remakeIndex / 16),
                    8 * this.upscaleFactor,
                    8 * this.upscaleFactor,
                    xScale * object.x * this.upscaleFactor,
                    yScale * object.y * this.upscaleFactor,
                    xScale * 8 * this.upscaleFactor,
                    yScale * 8 * this.upscaleFactor,
                );
                context.restore();
            }
        }
    }
}


const GamePPU = {
    "SUPER MARIOLAND": SuperMarioLandPPU,
}

export {PPU, GamePPU};