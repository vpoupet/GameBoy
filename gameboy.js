"use strict";

/**
 * Convert an unsigned byte into a signed byte
 *
 * @param x {number} an unsigned byte in [0, 255]
 * @returns {number} a signed byte in [-128, 127]
 */
function int8(x) {
    return x & 0x80 ? x - 0x100 : x;
}

class GameBoy {
    constructor() {
        /**
         * 8bit registers A F B C D E H L (followed by SP and PC)
         * @type {Uint16Array}
         */
        this.registers = new Uint8Array(12);
        /**
         * 16bit registers AF BC DE HL SP PC
         * @type {Uint16Array}
         */
        this.registers16 = new Uint16Array(this.registers.buffer);
        /**
         * Clock counter
         * @type {number}
         */
        this.clock = 0;
        /**
         * 64KB Memory array
         * @type {Int8Array}
         */
        this.memory = new Int8Array(new ArrayBuffer(0x10000));
    }

    mmu_get(addr) {
        if (0xE000 <= addr && addr < 0xFE00) {
            return this.memory[addr - 0x2000];
        } else {
            return this.memory[addr];
        }
    }
    /**
     * Increments a memory value
     * @param addr
     * @returns {number} the value before increment
     */
    mmu_inc(addr) {
        if (0xE000 <= addr && addr < 0xFE00) {
            return this.memory[addr - 0x2000]++;
        } else {
            return this.memory[addr]++;
        }
    }
    mmu_dec(addr) {
        if (0xE000 <= addr && addr < 0xFE00) {
            return this.memory[addr - 0x2000]--;
        } else {
            return this.memory[addr]--;
        }
    }

    mmu_get16(addr) {
        return this.mmu_get(addr) | (this.mmu_get(addr + 1) << 8);
    }

    mmu_set(addr, val) {
        if (0xE000 <= addr && addr < 0xFE00) {
            this.memory[addr - 0x2000] = val;
        } else {
            this.memory[addr] = val;
        }
    }
    mmu_set16(addr, val) {
        this.mmu_set(addr, val);
        this.mmu_set(addr + 1, val >> 8);
    }

    cpu_execOp() {
        opCodes[this.mmu_get(this.registers16[5]++)].bind(this)();
    }
}


module.exports = {
    GameBoy: GameBoy,
    int8: int8,
};
