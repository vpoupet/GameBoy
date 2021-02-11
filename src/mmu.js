function memcpy(src, srcOffset, dst, dstOffset, length) {
    let i;
    src = src.subarray || src.slice ? src : src.buffer;
    dst = dst.subarray || dst.slice ? dst : dst.buffer;
    src = srcOffset ? src.subarray ?
        src.subarray(srcOffset, length && srcOffset + length) :
        src.slice(srcOffset, length && srcOffset + length) : src;
    if (dst.set) {
        dst.set(src, dstOffset);
    } else {
        for (i = 0; i < src.length; i++) {
            dst[i + dstOffset] = src[i];
        }
    }
    return dst;
}

class MMU {
    constructor(dmg) {
        this.dmg = dmg;
        /**
         * 64KB Memory array
         * @type {Uint8Array}
         */
        this.memory = new Uint8Array(new ArrayBuffer(0x10000));
        /**
         * 256 bytes array containing the BIOS instructions
         * @type {Uint8Array}
         */
        this.bios = undefined;
        /**
         * Byte array containing the cartridge data (can be loaded into memory)
         * @type {Uint8Array}
         */
        this.cartridge = undefined;
        this.isBiosLoaded = false;
    }

    /**
     * Get a byte from its memory address
     * @param addr {number} memory address of the byte to read
     * @returns {number} a byte
     */
    get(addr) {
        switch (addr) {
            case 0xff00:
                return 0xff;
            default:
                if (0xE000 <= addr && addr < 0xFE00) {
                    // E000 FDFF	Mirror of C000~DDFF (ECHO RAM)	Nintendo says use of this area is prohibited.
                    return this.memory[addr - 0x2000];
                } else if (0x8000 <= addr && addr < 0xa000) {
                    // 8000	9FFF	8KB Video RAM (VRAM)	Only bank 0 in Non-CGB mode Switchable bank 0/1 in CGB mode
                    // VRAM (memory at 8000h-9FFFh) is accessible during Mode 0-2
                    if ((this.memory[0xff40] & 0x80) === 0 || (this.memory[0xff41] & 0x03) !== 0x03) {
                        return this.memory[addr];
                    } else {
                        return 0xff;
                    }
                } else if (0xfe00 <= addr && addr < 0xfea0) {
                    // FE00	FE9F	Sprite attribute table (OAM)
                    // OAM (memory at FE00h-FE9Fh) is accessible during Mode 0-1
                    if ((this.memory[0xff40] & 0x80) === 0 || (this.memory[0xff41] & 0x02) === 0) {
                        return this.memory[addr];
                    } else {
                        return 0xff;
                    }
                } else if (0xfea0 <= addr && addr < 0xff00) {
                    // FEA0	FEFF	Not Usable	Nintendo says use of this area is prohibited
                    return 0xff;
                } else {
                    return this.memory[addr];
                }
        }
    }

    /**
     * Get a word (2 bytes) from its memory address
     * @param addr {number} memory address of the word
     * @returns {number} a word
     */
    get16(addr) {
        return this.get(addr) | (this.get(addr + 1) << 8);
    }

    /**
     * Set the value of a byte in memory
     * @param addr {number} address of the byte to change
     * @param val {number} value of the byte
     */
    set(addr, val) {
        switch (addr) {
            case 0xff04:
                // FF04 - DIV - Divider Register (R/W)
                // reset to 0 on write
                this.memory[0xff04] = 0;
                break;
            case 0xff40:
                // FF40 - LCD Control Register
                // 7	LCD Display Enable	0=Off, 1=On
                // 6	Window Tile Map Display Select	0=9800-9BFF, 1=9C00-9FFF
                // 5	Window Display Enable	0=Off, 1=On
                // 4	BG & Window Tile Data Select	0=8800-97FF, 1=8000-8FFF
                // 3	BG Tile Map Display Select	0=9800-9BFF, 1=9C00-9FFF
                // 2	OBJ (Sprite) Size	0=Off, 1=On
                // 1	OBJ (Sprite) Display Enable	0=Off, 1=On
                // 0	BG/Window Display/Priority	0=Off, 1=On
                this.dmg.ppu.setDisplayEnabled(val & 0x80);
                this.memory[0xff40] = val;
                break;
            case 0xff41:
                // FF41 - STAT - LCDC Status (R/W)
                // bits 0-2 are read-only
                this.memory[0xff41] = val & 0xfc | this.memory[0xff41] & 0x03;
                break;
            case 0xff44:
                // FF44 - LY - LCDC Y-Coordinate (R)
                break;
            case 0xff50:
                // FF50		DMG	Set to non-zero to disable boot ROM
                if (this.isBiosLoaded && val !== 0) {
                    memcpy(this.cartridge, 0, this.memory, 0, 256);
                    this.isBiosLoaded = false;
                }
                this.memory[addr] = val;
                break;
            default:
                if (0x0000 <= addr && addr < 0x8000) {
                    // 0000	3FFF	16KB ROM bank 00	From cartridge, usually a fixed bank
                    // 4000	7FFF	16KB ROM Bank 01~NN	From cartridge, switchable bank via MB (if any)
                    return;
                } else if (0x8000 <= addr && addr < 0xa000) {
                    // 8000	9FFF	8KB Video RAM (VRAM)	Only bank 0 in Non-CGB mode Switchable bank 0/1 in CGB mode
                    // VRAM (memory at 8000h-9FFFh) is accessible during Mode 0-2
                    if ((this.memory[0xff40] & 0x80) === 0 || (this.memory[0xff41] & 0x03) !== 0x03) {
                        this.memory[addr] = val;
                    }
                } else if (0xe000 <= addr && addr < 0xfe00) {
                    // E000 FDFF	Mirror of C000~DDFF (ECHO RAM)	Nintendo says use of this area is prohibited.
                    this.memory[addr - 0x2000] = val;
                } else if (0xfe00 <= addr && addr < 0xfea0) {
                    // FE00	FE9F	Sprite attribute table (OAM)
                    // OAM (memory at FE00h-FE9Fh) is accessible during Mode 0-1
                    if ((this.memory[0xff40] & 0x80) === 0 || (this.memory[0xff41] & 0x02) === 0) {
                        this.memory[addr] = val;
                    }
                } else if (0xfea0 <= addr && addr < 0xff00) {
                    // FEA0	FEFF	Not Usable	Nintendo says use of this area is prohibited
                    return;
                } else {
                    this.memory[addr] = val;
                }
        }
    }

    /**
     * Set the value of a word in memory
     * @param addr {number} address of the word to change
     * @param val {number} value of the word
     */
    set16(addr, val) {
        this.set(addr, val);
        this.set(addr + 1, val >> 8);
    }

    reset() {
        this.memory[0xff40] = 0;
        memcpy(this.cartridge, 0, this.memory, 0, 32768);
        memcpy(this.bios, 0, this.memory, 0, 256);
        this.isBiosLoaded = true;
    }
}

export {
    MMU,
};