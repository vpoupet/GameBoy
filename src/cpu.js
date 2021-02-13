import {
    opCodes,
    opCodesCB,
} from "./opcodes.js"

class CPU {
    constructor(dmg) {
        this.dmg = dmg;
        this.mmu = dmg.mmu;

        /**
         * 8bit registers F A C B E D L H (followed by SP and PC)
         * @type {Uint8Array}
         */
        this.registers = new Uint8Array(12);
        /**
         * 16bit registers AF BC DE HL SP PC
         * @type {Uint16Array}
         */
        this.registers16 = new Uint16Array(this.registers.buffer);
        /**
         * Interrupt Master Enable Flag (IME)
         * @type {boolean}
         */
        this.interruptMasterEnable = false;
        this.clock = 0;
        this.previousPC = new Array(5).fill(0);
    }

    // 8-bit registers getters and setters
    get a() {
        return this.registers[1];
    }

    set a(val) {
        this.registers[1] = val;
    }

    get f() {
        return this.registers[0];
    }

    set f(val) {
        this.registers[0] = val;
    }

    get b() {
        return this.registers[3];
    }

    set b(val) {
        this.registers[3] = val;
    }

    get c() {
        return this.registers[2];
    }

    set c(val) {
        this.registers[2] = val;
    }

    get d() {
        return this.registers[5];
    }

    set d(val) {
        this.registers[5] = val;
    }

    get e() {
        return this.registers[4];
    }

    set e(val) {
        this.registers[4] = val;
    }

    get h() {
        return this.registers[7];
    }

    set h(val) {
        this.registers[7] = val;
    }

    get l() {
        return this.registers[6];
    }

    set l(val) {
        this.registers[6] = val;
    }

    // 16-bit registers getters and setters
    get af() {
        return this.registers16[0];
    }

    set af(val) {
        this.registers16[0] = val;
    }

    get bc() {
        return this.registers16[1];
    }

    set bc(val) {
        this.registers16[1] = val;
    }

    get de() {
        return this.registers16[2];
    }

    set de(val) {
        this.registers16[2] = val;
    }

    get hl() {
        return this.registers16[3];
    }

    set hl(val) {
        this.registers16[3] = val;
    }

    get sp() {
        return this.registers16[4];
    }

    set sp(val) {
        this.registers16[4] = val;
    }

    get pc() {
        return this.registers16[5];
    }

    set pc(val) {
        this.registers16[5] = val;
    }

    // Flags getters and setters
    get flagZ() {
        return this.registers[0] >> 7;
    }

    set flagZ(val) {
        val ? this.registers[0] |= 0b10000000 : this.registers[0] &= 0b01111111;
    }

    get flagN() {
        return (this.registers[0] >> 6) & 1;
    }

    set flagN(val) {
        val ? this.registers[0] |= 0b01000000 : this.registers[0] &= 0b10111111;
    }

    get flagH() {
        return (this.registers[0] >> 5) & 1;
    }

    set flagH(val) {
        val ? this.registers[0] |= 0b00100000 : this.registers[0] &= 0b11011111;
    }

    get flagC() {
        return (this.registers[0] >> 4) & 1;
    }

    set flagC(val) {
        val ? this.registers[0] |= 0b00010000 : this.registers[0] &= 0b11101111;
    }

    exec() {
        this.clock = 0;
        // execute opcode at pc
        this.previousPC.shift();
        this.previousPC.push(this.pc);
        opCodes[this.mmu.get(this.pc)].bind(this)();

        // check for interrupts
        const interruptMask = this.mmu.memory[0xffff] & this.mmu.memory[0xff0f] & 0x1f;
        if (this.interruptMasterEnable && interruptMask) {
            // execute interrupt
            for (let i = 0; i < 5; i++) {
                if (interruptMask & (1 << i)) {
                    this.mmu.memory[0xff0f] &= ~(1 << i); // reset IF flag
                    this.interruptMasterEnable = false; // disable interrupts
                    this.sp -= 2;
                    this.mmu.set16(this.sp, this.pc);
                    this.pc = 0x40 + (0x08 * i);
                    this.clock += 20;
                    break;
                }
            }
        }
        return this.clock;
    }

    reset() {
        this.af = 0;
        this.bc = 0;
        this.de = 0;
        this.hl = 0;
        this.pc = 0;
        this.sp = 0;
        this.interruptMasterEnable = false;
        this.previousPC = new Array(5).fill(0);
        // this.af = 0x01b0;
        // this.bc = 0x0013;
        // this.de = 0x00d8;
        // this.hl = 0x014d;
        // this.pc = 0x0100;
    }
}

export {
    CPU,
};