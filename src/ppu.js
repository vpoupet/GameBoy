// const colors = [0xFF3DBAA2, 0xFF38AA92, 0xFF36603D, 0xFF14371B];
const colors = [0xFF0FBC9B, 0xFF0FAC8B, 0xFF306230, 0xFF0F380F, 0xFF9FDCCA];

class PPU {
    constructor(dmg) {
        this.dmg = dmg;
        this.mmu = dmg.mmu;
        this.isDisplayEnabled = false;
    }

    setContext(context) {
        this.screenContext = context;
        this.lineData = this.screenContext.createImageData(160, 1);
        this.lineArray = new Uint32Array(this.lineData.data.buffer);
    }

    drawLine(ly) {
        if (this.screenContext === undefined || !this.isDisplayEnabled) {
            return;
        }
        const y = (ly + this.mmu.memory[0xff42]) & 0xff;
        const tileY = y >> 3;
        const pixelY = y & 0x07;
        let x = this.mmu.memory[0xff43];
        let tileX = x >> 3;
        let pixelX = 7 - (x & 0x07);
        const tileMapOffset = (this.mmu.memory[0xff40] & 0x08 ? 0x9c00 : 0x9800) + tileY * 32;
        let tileIndex;
        let tileDataOffset;
        const palette = [
            this.mmu.memory[0xff47] & 0x03,
            (this.mmu.memory[0xff47] >> 2) & 0x03,
            (this.mmu.memory[0xff47] >> 4) & 0x03,
            this.mmu.memory[0xff47] >> 6,
        ];
        for (let i = 0; i < 160; i++) {
            tileIndex = this.mmu.memory[tileMapOffset + tileX];
            tileDataOffset = this.mmu.memory[0xff40] & 0x10 ? 0x8000 + tileIndex * 16 : 0x9000 + (tileIndex << 24 >> 24) * 16;
            let lineByte0 = this.mmu.memory[tileDataOffset + 2 * pixelY];
            let lineByte1 = this.mmu.memory[tileDataOffset + 2 * pixelY + 1];
            let pixelValue = palette[((lineByte0 >> pixelX) & 0x01) | (((lineByte1 >> pixelX) & 0x01) << 1)];
            this.lineArray[i] = colors[pixelValue];
            x += 1;
            x &= 0xff;
            tileX = x >> 3;
            pixelX = 7 - (x & 0x07);
        }
        this.screenContext.putImageData(this.lineData, 0, ly);
    }

    setDisplayEnabled(val) {
        this.isDisplayEnabled = val;
        if (!val) {
            this.screenContext.fillStyle = "#CADC9F";
            this.screenContext.fillRect(0, 0, 160, 144);
        }
    }
}

export {
    PPU,
};