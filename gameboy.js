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
         * Program counter
         * @type {number}
         */
        this._pc = 0;
        /**
         * Stack pointer
         * @type {number}
         */
        this._sp = 0;
        /**
         * A register
         * @type {number}
         */
        this._a = 0;
        /**
         * B register
         * @type {number}
         */
        this._b = 0;
        /**
         * C register
         * @type {number}
         */
        this._c = 0;
        /**
         * D register
         * @type {number}
         */
        this._d = 0;
        /**
         * E register
         * @type {number}
         */
        this._e = 0;
        /**
         * F register
         * @type {number}
         */
        this._f = 0;
        /**
         * H register
         * @type {number}
         */
        this._h = 0;
        /**
         * L register
         * @type {number}
         */
        this._l = 0;
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
            this.memory[addr - 0x2000] = val & 0xFF;
        } else {
            this.memory[addr] = val & 0xFF;
        }
    }

    mmu_get16(addr) {
        return this.mmu_get(addr) | (this.mmu_get(addr + 1) << 8);
    }

    mmu_set16(addr, val) {
        this.mmu_set(addr, val & 0xFF);
        this.mmu_set(addr + 1, (val >> 8) & 0xFF);
    }

    cpu_getA() {
        return this._a;
    }

    cpu_getB() {
        return this._b;
    }

    cpu_getC() {
        return this._c;
    }

    cpu_getD() {
        return this._d;
    }

    cpu_getE() {
        return this._e;
    }

    cpu_getF() {
        return this._f;
    }

    cpu_getG() {
        return this._h;
    }

    cpu_getL() {
        return this._l;
    }

    cpu_setA(val) {
        this._a = val & 0xFF;
    }

    cpu_setB(val) {
        this._b = val & 0xFF;
    }

    cpu_setC(val) {
        this._c = val & 0xFF;
    }

    cpu_setD(val) {
        this._d = val & 0xFF;
    }

    cpu_setE(val) {
        this._e = val & 0xFF;
    }

    cpu_setF(val) {
        this._f = val & 0xFF;
    }

    cpu_setH(val) {
        this._h = val & 0xFF;
    }

    cpu_setL(val) {
        this._l = val & 0xFF;
    }

    cpu_getSP() {
        return this._sp;
    }

    cpu_setSP(val) {
        this._sp = val & 0xFFFF;
    }

    cpu_getPC() {
        return this._pc;
    }

    cpu_setPC(val) {
        this._pc = val & 0xFFFF;
    }

    cpu_getAF() {
        return this._a | (this._f << 8);
    }

    cpu_setAF(val) {
        this._a = val & 0xFF;
        this._f = (val >> 8) & 0xFF;
    }

    cpu_getBC() {
        return this._b | (this._c << 8);
    }

    cpu_setBC(val) {
        this._b = val & 0xFF;
        this._c = (val >> 8) & 0xFF;
    }

    cpu_getDE() {
        return this._d | (this._e << 8);
    }

    cpu_setDE(val) {
        this._d = val & 0xFF;
        this._e = (val >> 8) & 0xFF;
    }

    cpu_getHL() {
        return this._h | (this._l << 8);
    }

    cpu_setHL(val) {
        this._h = val & 0xFF;
        this._l = (val >> 8) & 0xFF;
    }

    mmu_get_d8() {
        const val = this.mmu_get(this._pc);
        this.cpu_setPC(this._pc + 1);
        return val;
    }

    mmu_get_d16() {
        const val = this.mmu_get(this._pc) | (this.mmu_get(this._pc + 1) << 8);
        this.cpu_setPC(this._pc + 2);
        return val;
    }

    cpu_execOp() {
        opCodes[this.mmu_get_d8()].bind(this)();
    }
}


module.exports = {
    GameBoy: GameBoy,
    int8: int8,
};
