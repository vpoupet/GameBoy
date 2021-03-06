import { MBC, MBC1 } from "./mbc.js";


function hex(n, length = 4) {
    const nString = n.toString(16);
    return "0".repeat(length - nString.length) + nString;
}


function decodeBase64(b64string) {
    const byteString = atob(b64string);
    const len = byteString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = byteString.charCodeAt(i);
    }
    return bytes;
}


const dmgBios = decodeBase64('Mf7/ryH/nzLLfCD7ISb/DhE+gDLiDD7z4jI+d3c+/OBHEQQBIRCAGs2VAM2WABN7/jQg8xHYAAYIGhMiIwUg+T4Z6hCZIS+ZDgw9KAgyDSD5Lg8Y82c+ZFfgQj6R4EAEHgIODPBE/pAg+g0g9x0g8g4TJHweg/5iKAYewf5kIAZ74gw+h+LwQpDgQhUg0gUgTxYgGMtPBgTFyxEXwcsRFwUg9SIjIiPJzu1mZswNAAsDcwCDAAwADQAIER+IiQAO3Mxu5t3d2Zm7u2djbg7szN3cmZ+7uTM+PEK5pbmlQjwhBAERqAAaE74g/iN9/jQg9QYZeIYjBSD7hiD+PgHgUA==');


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
        this.bios = dmgBios;
        this.isBiosEnabled = false;
        this.mbc = undefined;
        this.romBank0 = undefined;
        this.romBank1 = undefined;
        this.externalRamEnabled = false;
        this.externalRam = undefined;
        this.dmaTimer = 0;
    }

    /**
     * Get a byte from its memory address
     * @param addr {number} memory address of the byte to read
     * @returns {number} a byte
     */
    get(addr) {
        if (this.dmaTimer > 0 && addr < 0xff80) return 0xff; // during OAM DMA transfer only HRAM can be accessed

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
            case 0xff4d:
                // FF4D - KEY1 - CGB Mode Only - Prepare Speed Switch
                return 0xff;
            case 0xff50:
                // 0xFF50 - BOOT - Boot ROM lock register
                // U-1 U-1 U-1 U-1 U-1 U-1 U-1 R/W-0
                return (this.memory[0xff50] & 0x01) | 0xfe;
            default:
                if (0x0000 <= addr && addr < 0x0100) {
                    // if BIOS is still loaded, read from bios, otherwise from ROM bank 0
                    if (this.isBiosEnabled) {
                        return this.bios[addr];
                    } else {
                        return this.romBank0[addr];
                    }
                } else if (0x0100 <= addr && addr < 0x4000) {
                    // 0000	3FFF	16 KiB ROM bank 00	From cartridge, usually a fixed bank
                    return this.romBank0[addr];
                } else if (0x4000 <= addr && addr < 0x8000) {
                    // 4000	7FFF	16 KiB ROM Bank 01~NN	From cartridge, switchable bank via mapper (if any)
                    return this.romBank1[addr - 0x4000];
                } else if (0x8000 <= addr && addr < 0xa000) {
                    // 8000	9FFF	8KB Video RAM (VRAM)	Only bank 0 in Non-CGB mode Switchable bank 0/1 in CGB mode
                    // VRAM (memory at 8000h-9FFFh) is accessible during Mode 0-2
                    if ((this.memory[0xff40] & 0x80) === 0 || (this.memory[0xff41] & 0x03) !== 0x03) {
                        return this.memory[addr];
                    } else {
                        return 0xff;
                    }
                } else if (0xa000 <= addr && addr < 0xc000) {
                    // A000	BFFF	8 KiB External RAM	From cartridge, switchable bank if any
                    if (this.externalRamEnabled) {
                        return this.externalRam[addr - 0xa000];
                    } else {
                        return 0xff;
                    }
                } else if (0xf000 <= addr && addr < 0xfe00) {
                    // E000 FDFF	Mirror of C000~DDFF (ECHO RAM)	Nintendo says use of this area is prohibited.
                    return this.memory[addr - 0x2000];
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
                    return 0x00;
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
        if (this.dmaTimer > 0 && addr < 0xff80) return; // during OAM DMA transfer only HRAM can be accessed

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
                // FF40 - LCD Control Register (R/W)
                // 7	LCD Display Enable	0=Off, 1=On
                this.memory[addr] = val;
                this.dmg.ppu.setEnabled(!!(val & 0x80));
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
            case 0xff45:
                // FF45 - LYC (LY Compare) (R/W)
                this.memory[addr] = val;
                this.dmg.ppu.updateCoincidenceFlag();
                break;
            case 0xff46:
                // FF46 - DMA - DMA Transfer and Start Address (R/W)
                const offset = val << 8;
                for (let i = 0; i < 160; i++) {
                    this.memory[0xfe00 + i] = this.memory[offset + i];
                }
                this.dmaTimer = 160;
                break;
            case 0xff50:
                // FF50		Set bit-0 to 1 to disable Boot ROM (can only transition from 0 to 1)
                if ((this.memory[addr] & 0x01) === 0 && (val & 0x01) === 1) {
                    this.isBiosEnabled = false;
                    this.memory[addr] |= 0x01;
                }
                break;
            default:
                if (0x0000 <= addr && addr < 0x8000) {
                    // 0000	3FFF	16KB ROM bank 00	From cartridge, usually a fixed bank
                    // 4000	7FFF	16KB ROM Bank 01~NN	From cartridge, switchable bank via MB (if any)
                    this.mbc.set(addr, val);
                } else if (0x8000 <= addr && addr < 0xa000) {
                    // 8000	9FFF	8KB Video RAM (VRAM)	Only bank 0 in Non-CGB mode Switchable bank 0/1 in CGB mode
                    // VRAM (memory at 8000h-9FFFh) is accessible during Mode 0-2
                    if ((this.memory[0xff40] & 0x80) === 0 || (this.memory[0xff41] & 0x03) !== 0x03) {
                        this.memory[addr] = val;
                    }
                } else if (0xa000 <= addr && addr < 0xc000) {
                    // A000	BFFF	8 KiB External RAM	From cartridge, switchable bank if any
                    if (this.externalRamEnabled) {
                        this.externalRam[addr - 0xa000] = val;
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

    reset(cartridge, execBios=true) {
        this.isBiosEnabled = execBios;

        switch (cartridge[0x0147]) {
            case 0x00:
                this.mbc = new MBC(this, cartridge);
                break;
            case 0x01:
            case 0x02:
            case 0x03:
                this.mbc = new MBC1(this, cartridge);
                break;
        }
        this.romBank0 = this.mbc.romBanks[0];
        this.romBank1 = this.mbc.romBanks[1];
        this.externalRamEnabled = false;
        this.externalRam = undefined;

        // initialize RAM
        for (let i = 32768; i < 65536; i++) {
            this.memory[i] = 0x00;
        }

        if (!execBios) {
            // set values after boot sequence (from Pan Docs)
            this.memory[0xff05] = 0x00;
            this.memory[0xff06] = 0x00;
            this.memory[0xff07] = 0x00;
            this.memory[0xff10] = 0x80;
            this.memory[0xff11] = 0xbf;
            this.memory[0xff12] = 0xf3;
            this.memory[0xff14] = 0xbf;
            this.memory[0xff16] = 0x3f;
            this.memory[0xff17] = 0x00;
            this.memory[0xff19] = 0xbf;
            this.memory[0xff1a] = 0x7f;
            this.memory[0xff1b] = 0xff;
            this.memory[0xff1c] = 0x9f;
            this.memory[0xff1e] = 0xbf;
            this.memory[0xff20] = 0xff;
            this.memory[0xff21] = 0x00;
            this.memory[0xff22] = 0x00;
            this.memory[0xff23] = 0xbf;
            this.memory[0xff24] = 0x77;
            this.memory[0xff25] = 0xf3;
            this.memory[0xff26] = 0xf1;
            this.memory[0xff40] = 0x91;
            this.memory[0xff42] = 0x00;
            this.memory[0xff43] = 0x00;
            this.memory[0xff45] = 0x00;
            this.memory[0xff47] = 0xfc;
            this.memory[0xff48] = 0xff;
            this.memory[0xff49] = 0xff;
            this.memory[0xff4a] = 0x00;
            this.memory[0xff4b] = 0x00;
            this.memory[0xffff] = 0x00;
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