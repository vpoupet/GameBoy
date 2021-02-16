function hex(n, length = 4) {
    const nString = n.toString(16);
    return "0".repeat(length - nString.length) + nString;
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
    }

    /**
     * Get a byte from its memory address
     * @param addr {number} memory address of the byte to read
     * @returns {number} a byte
     */
    get(addr) {
        switch (addr) {
            case 0xff00:
                // 0xFF00 - P1 - Joypad/Super Game Boy communication register
                // U-1 U-1 W-0 W-0 R-x R-x R-x R-x
                return (this.memory[addr] & 0x0f) | 0xc0;
            case 0xff02:
                // 0xFF02 - SC - Serial control register
                // R/W-0 U-1 U-1 U-1 U-1 U-1 U-1 R/W-0
                return (this.memory[addr] & 0x81) | 0x7e;
            case 0xff41:
                // 0xFF41 - LCDC - PPU status register
                // U-1 R/W-0 R/W-0 R/W-0 R/W-0 R/W-0 R/W-0 R/W-0
                return 0x80 | this.memory[addr];
            case 0xff50:
                // 0xFF50 - BOOT - Boot ROM lock register
                // U-1 U-1 U-1 U-1 U-1 U-1 U-1 R/W-0
                return (this.memory[0xff50] & 0x01) | 0xfe;
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
            case 0xff00:
                // FF00 - P1/JOYP - Joypad (R/W)
                this.memory[addr] = (this.memory[addr] & 0xcf) | (val & 0x30);
                break;
            case 0xff01:
                // FF01 - SB - Serial transfer data (R/W)
                this.dmg.appendToSerialOutput(val);
                this.memory[addr] = val;
                break;
            case 0xff04:
                // FF04 - DIV - Divider Register (R/W)
                // reset to 0 on write
                this.memory[addr] = 0;
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
                this.memory[addr] = val;
                break;
            case 0xff41:
                // FF41 - STAT - LCDC Status (R/W)
                // bit 7 is unused (always returns 1)
                // bits 0-2 are read-only
                this.memory[addr] = (val & 0xf8) | (this.memory[addr] & 0x07);
                break;
            case 0xff44:
                // FF44 - LY - LCDC Y-Coordinate (R)
                break;
            case 0xff46:
                // FF46 - DMA - DMA Transfer and Start Address (R/W)
                const offset = val << 8;
                for (let i = 0; i < 160; i++) {
                    this.memory[0xfe00 + i] = this.memory[offset + i];
                }
                // TODO lock access to memory during 160 cycles
                console.log('DMA');
                break;
            case 0xff50:
                // FF50		Set bit-0 to 1 to disable Boot ROM (can only transition from 0 to 1)
                if ((this.memory[addr] & 0x01) === 0 && (val & 0x01) === 1) {
                    for (let i = 0; i < 256; i++) {
                        this.memory[i] = this.cartridge[i];
                    }
                    this.memory[addr] |= 0x01;
                    console.log("Boot ROM disabled.");
                }
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
        this.memory[0xff00] = 0xff;
        this.memory[0xff40] = 0;
        for (let i = 0; i < 256; i++) {
            this.memory[i] = this.bios[i];
        }
        for (let i = 256; i < 32768; i++) {
            this.memory[i] = this.cartridge[i];
        }
        for (let i = 32768; i < 65536; i++) {
            this.memory[i] = 0x00;
        }
    }

    getRange(addr1, addr2) {
        const values = [];
        for (let i = addr1; i < addr2; i++) {
            values.push(hex(this.memory[i], 2));
        }
        return values.join(" ");
    }
}

export {
    MMU, hex,
};