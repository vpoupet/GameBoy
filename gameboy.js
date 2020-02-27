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
         * Program counter
         * @type {number}
         */
        this.pc = 0;
        /**
         * Stack pointer
         * @type {number}
         */
        this.sp = 0;
        /**
         * A register
         * @type {number}
         */
        this.a = 0;
        /**
         * B register
         * @type {number}
         */
        this.b = 0;
        /**
         * C register
         * @type {number}
         */
        this.c = 0;
        /**
         * D register
         * @type {number}
         */
        this.d = 0;
        /**
         * E register
         * @type {number}
         */
        this.e = 0;
        /**
         * F register
         * @type {number}
         */
        this.f = 0;
        /**
         * H register
         * @type {number}
         */
        this.h = 0;
        /**
         * L register
         * @type {number}
         */
        this.l = 0;
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

    mmu_set(addr, val) {
        if (0xE000 <= addr && addr < 0xFE00) {
            this.memory[addr - 0x2000] = val;
        } else {
            this.memory[addr] = val;
        }
    }

    mmu_get16(addr) {
        return this.mmu_get(addr) | (this.mmu_get(addr + 1) << 8);
    }

    mmu_set16(addr, val) {
        this.mmu_set(addr, val & 0xFF);
        this.mmu_set(addr + 1, val >> 8);
    }

    cpu_getAF() {
        return this.a | (this.f << 8);
    }

    cpu_setAF(val) {
        this.a = val & 0xFF;
        this.f = val >> 8;
    }

    cpu_getBC() {
        return this.b | (this.c << 8);
    }

    cpu_setBC(val) {
        this.b = val & 0xFF;
        this.c = val >> 8;
    }

    cpu_getDE() {
        return this.d | (this.e << 8);
    }

    cpu_setDE(val) {
        this.d = val & 0xFF;
        this.e = val >> 8;
    }

    cpu_getHL() {
        return this.h | (this.l << 8);
    }

    cpu_setHL(val) {
        this.h = val & 0xFF;
        this.l = val >> 8;
    }

    mmu_getPC() {
        return this.mmu_get(this.pc++);
    }

    cpu_execOp() {
        opCodes[this.mmu_getPC()].bind(this)();
    }
}

let gb = new GameBoy();
