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
        this.enabled = true;
        this.windowLine = 0;
        this.winY = 0;
    }

    setContext(context) {
        this.screenContext = context;
        this.lineData = this.screenContext.createImageData(160, 1);
        this.lineArray = new Uint32Array(this.lineData.data.buffer);
    }

    startFrame() {
        this.windowLine = 0;
        this.winY = this.mmu.memory[0xff4a];
    }

    fetchTileLine(tileOffset, lineIndex, buffer, bufferOffset, palette = [0, 1, 2, 3], transparency = false, flip = false) {
        const byte0 = this.mmu.memory[tileOffset + 2 * lineIndex];
        const byte1 = this.mmu.memory[tileOffset + 2 * lineIndex + 1];
        for (let i = 0; i < 8; i++) {
            const j = 7 - i;
            const shade = (byte0 & 1 << j | (byte1 & 1 << j) << 1) >> j;
            if (shade !== 0 || !transparency) {
                if (flip) {
                    buffer[bufferOffset + 7 - i] = colors[palette[shade]];
                } else {
                    buffer[bufferOffset + i] = colors[palette[shade]];
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
            // display is not enabled: clear line and return
            for (let i = 0; i < 160; i++) {
                this.lineArray[i] = colors[0];
            }
            this.screenContext.putImageData(this.lineData, 0, ly);
            return
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
                this.fetchTileLine(tileDataOffset, bgTileLine, this.lineArray, lx, bgPalette);
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
                        this.fetchTileLine(tileDataOffset, winTileLine, this.lineArray, lx, bgPalette);
                        tx += 1;
                        tx %= 32;
                        lx += 8;
                    }
                    this.windowLine += 1;
                }
            }
        } else {
            // clear line
            for (let i = 0; i < 160; i++) {
                this.lineArray[i] = colors[0];
            }
        }

        // Sprites
        // TODO: Redo sprite drawing to handle
        // - 10 sprites per line limitation
        // - sprite priority
        // - sprite transparency (over or under BG and Window)
        if (_ff40 & 0x02) { // Sprites enabled
            const obp0 = this.makePalette(this.mmu.memory[0xff48]); // OBP0 - Object Palette 0 Data
            const obp1 = this.makePalette(this.mmu.memory[0xff49]); // OBP1 - Object Palette 1 Data
            const spriteSize = _ff40 & 0x04 ? 16 : 8;
            for (let spriteOffset = 0xfe00; spriteOffset < 0xfea0; spriteOffset += 4) {
                const spriteAttributes = this.mmu.memory[spriteOffset + 3];
                let spriteLine = ly - (this.mmu.memory[spriteOffset] - 16);
                if (spriteAttributes & 0x40) {  // Y-flip
                    spriteLine = spriteSize - 1 - spriteLine;
                }
                if (0 <= spriteLine && spriteLine < spriteSize) {
                    const spriteX = this.mmu.memory[spriteOffset + 1] - 8;
                    const tileDataOffset = 0x8000 + this.mmu.memory[spriteOffset + 2] * 16;
                    const flipX = (spriteAttributes & 0x20) !== 0;
                    const palette = spriteAttributes & 0x10 ? obp1 : obp0;
                    this.fetchTileLine(
                        tileDataOffset,
                        spriteLine,
                        this.lineArray,
                        spriteX,
                        palette,
                        true,
                        flipX);
                }
            }
        }
        this.screenContext.putImageData(this.lineData, 0, ly);
    }

    reset() {
        this.screenContext.fillStyle = "#9BBC0F";
        this.screenContext.fillRect(0, 0, 160, 144);
    }

    displayTiles() {
        const tilesCanvas = document.getElementById("tiles");
        const tilesContext = tilesCanvas.getContext('2d');
        const tilesData = tilesContext.createImageData(128, 192);
        const tilesArray = new Uint32Array(tilesData.data.buffer);
        for (let tileIndex = 0; tileIndex < 384; tileIndex++) {
            for (let lineIndex = 0; lineIndex < 8; lineIndex++) {
                this.fetchTileLine(
                    0x8000 + 16 * tileIndex,
                    lineIndex,
                    tilesArray,
                    (~~(tileIndex / 16) * 8 + lineIndex) * 128 + (tileIndex % 16) * 8
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
            const bgArray = new Uint32Array(bgData.data.buffer);
            const tileMapOffset = mapIndex === 0 ? 0x9800 : 0x9c00;
            let offset = 0;
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
                        this.fetchTileLine(
                            tileOffset,
                            lineIndex,
                            bgArray,
                            offset,
                            palette,
                        )
                        offset += 8;
                    }
                }
            }
            bgContext.putImageData(bgData, 0, 0);
        }
    }
}

export {PPU};