// const colors = [0xFF3DBAA2, 0xFF38AA92, 0xFF36603D, 0xFF14371B];
const colors = [0xFF0FBC9B, 0xFF0FAC8B, 0xFF306230, 0xFF0F380F, 0xFF9FDCCA];


class PPU {
    constructor(dmg) {
        this.dmg = dmg;
        this.mmu = dmg.mmu;
        this.isDisplayEnabled = false;
        this.enabled = true;
    }

    setContext(context) {
        this.screenContext = context;
        this.lineData = this.screenContext.createImageData(160, 1);
        this.lineArray = new Uint32Array(this.lineData.data.buffer);
    }

    fetchTileLine(tileOffset, lineIndex, buffer, bufferOffset, palette = [0, 1, 2, 3]) {
        const byte0 = this.mmu.memory[tileOffset + 2 * lineIndex];
        const byte1 = this.mmu.memory[tileOffset + 2 * lineIndex + 1];
        for (let i = 0; i < 8; i++) {
            const j = 7 - i;
            const shade = (byte0 & 1 << j | (byte1 & 1 << j) << 1) >> j;
            buffer[bufferOffset + i] = colors[palette[shade]];
        }
    }

    makePalette(value) {
        return [value & 0x03, (value >> 2) & 0x03, (value >> 4) & 0x03, value >> 6];
    }

    drawLine(ly) {
        if (!this.enabled || !this.isDisplayEnabled) return;
        const _ff40 = this.mmu.memory[0xff40];  // LCD Control Register
        if (_ff40 & 0x01) {
            // draw BG
            const _ff42 = this.mmu.memory[0xff42];  // SCY - Scroll Y
            const _ff43 = this.mmu.memory[0xff43];  // SCX - Scroll X
            const bgPalette = this.makePalette(this.mmu.memory[0xff47]);
            const bgY = (ly + _ff42) & 0xff;
            const bgTileMapOffset = (_ff40 & 0x08 ? 0x9c00 : 0x9800) + 32 * (bgY >> 3);
            const bgTileLine = bgY % 8;
            let tx = _ff43 >> 3;        // x-coord of the current tile in tilemap
            let lx = -(_ff43 & 0x0f);   // x-coord along the current line
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
                const _ff4a = this.mmu.memory[0xff4a];  // WY - Window Y Position
                const _ff4b = this.mmu.memory[0xff4b];  // WX - Window X Position minus 7
                if (_ff4a <= ly) {
                    // Window is shown on current line
                    const winY = ly - _ff4a;
                    const winTileMapOffset = (_ff40 & 0x40 ? 0x9c00 : 0x9800) + 32 * (winY >> 3);
                    const winTileLine = winY % 8;
                    tx = _ff4b >> 3;
                    lx = _ff4a - 7;
                    while (lx < 160) {
                        const tileIndex = this.mmu.memory[winTileMapOffset + tx];
                        const tileDataOffset = _ff40 & 0x10 ? 0x8000 + tileIndex * 16 : 0x9000 + (tileIndex << 24 >> 24) * 16;
                        this.fetchTileLine(tileDataOffset, winTileLine, this.lineArray, lx, bgPalette);
                        tx += 1;
                        tx %= 32;
                        lx += 8;
                    }
                }
            }
        } else {
            // clear line
            for (let i = 0; i < 160; i++) { // clear line
                this.lineData[i] = colors[0];
            }
        }
        this.screenContext.putImageData(this.lineData, 0, ly);
    }

    setDisplayEnabled(val) {
        if (val) {
            this.isDisplayEnabled = true;
        } else {
            this.isDisplayEnabled = false;
            this.screenContext.fillStyle = "#CADC9F";
            this.screenContext.fillRect(0, 0, 160, 144);
        }
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

    displayBG() {
        const bgCanvas = document.getElementById("background");
        const bgContext = bgCanvas.getContext('2d');
        const bgData = bgContext.createImageData(256, 256);
        const bgArray = new Uint32Array(bgData.data.buffer);
        const tileMapOffset = this.mmu.memory[0xff40] & 0x08 ? 0x9c00 : 0x9800;
        const palette = makePalette(this.mmu.memory[0xff47]);
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

export {
    PPU,
};