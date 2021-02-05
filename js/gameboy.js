"use strict";

const colors = [0xFF3DBAA2, 0xFF38AA92, 0xFF36603D, 0xFF14371B];

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

class GameBoy {
    constructor(canvas) {
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
         * Clock counter
         * @type {number}
         */
        this.clock = 0;
        /**
         * Timers (take action when clock counter exceeds a timer)
         * @type {number}
         */
        this.gpuModeTimer = 80;
        this.gpuLYTimer = Number.MAX_SAFE_INTEGER;
        this.frameTimer = 70224;
        /**
         * 64KB Memory array
         * @type {Uint8Array}
         */
        this.memory = new Uint8Array(new ArrayBuffer(0x10000));
        /**
         * Interrupt Master Enable Flag (IME)
         * @type {boolean}
         */
        this.interruptMasterEnable = true;

        this.screenContext = canvas.getContext('2d');
        this.lineData = this.screenContext.createImageData(160, 1);
        this.lineArray = new Uint32Array(this.lineData.data.buffer);
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

    /**
     * Get a byte from its memory address
     * @param addr {number} memory address of the byte to read
     * @returns {number} a byte
     */
    mmu_get(addr) {
        if (0xE000 <= addr && addr < 0xFE00) {
            return this.memory[addr - 0x2000];
        } else {
            return this.memory[addr];
        }
    }

    /**
     * Get a word (2 bytes) from its memory address
     * @param addr {number} memory address of the word
     * @returns {number} a word
     */
    mmu_get16(addr) {
        return this.mmu_get(addr) | (this.mmu_get(addr + 1) << 8);
    }

    /**
     * Set the value of a byte in memory
     * @param addr {number} address of the byte to change
     * @param val {number} value of the byte
     */
    mmu_set(addr, val) {
        if (0xE000 <= addr && addr < 0xFE00) {
            this.memory[addr - 0x2000] = val;
        } else {
            this.memory[addr] = val;
        }
    }

    /**
     * Set the value of a word in memory
     * @param addr {number} address of the word to change
     * @param val {number} value of the word
     */
    mmu_set16(addr, val) {
        this.mmu_set(addr, val);
        this.mmu_set(addr + 1, val >> 8);
    }

    cpu_step() {
        // check for interrupts
        if (this.interruptMasterEnable && (this.memory[0xffff] & this.memory[0xff0f] & 0x1f)) {
            // execute interrupt
            const mask = this.memory[0xffff] & this.memory[0xff0f];
            for (let i = 0; i < 5; i++) {
                if (mask & (1 << i)) {
                    this.memory[0xff0f] &= ~(1 << i);   // reset IF flag
                    this.interruptMasterEnable = false; // disable interrupts
                    this.sp -= 2;
                    this.mmu_set16(this.sp, this.pc);
                    this.pc = 0x40 + (i << 3);
                    this.clock += 20;
                    return;
                }
            }
        }

        // execute opcode at pc
        opCodes[this.mmu_get(this.pc)].bind(this)();

        // handle timers
        if (this.clock >= this.gpuLYTimer) {
            // increment LY during V-Blank
            this.memory[0xff44] += 1;
            this.gpuLYTimer += 456;
        }
        if (this.clock >= this.gpuModeTimer) {
            switch (this.memory[0xff41] & 0x03) {
                case 2:
                    // Reading from OAM (80 cycles) -> switch to mode 3 (OAM+VRAM)
                    this.memory[0xff41] ^= 0x01;
                    this.gpuModeTimer += 172;
                    this.drawLine(this.memory[0xff44]);
                    break;
                case 3:
                    // Reading from OAM and VRAM (172 cycles) -> switch to mode 0 (H-Blank)
                    this.memory[0xff41] ^= 0x03;
                    this.gpuModeTimer += 204
                    break;
                case 0:
                    // H-Blank (204 cycles)
                    this.memory[0xff44] += 1;   // increment LY
                    if (this.memory[0xff44] === 144) {
                        // -> switch to mode 1 (V-Blank)
                        this.memory[0xff41] ^= 0x01;
                        this.gpuModeTimer += 4560;
                        this.gpuLYTimer = this.gpuModeTimer + 456;  // run LY timer during V-Blank
                    } else {
                        // -> switch to mode 2 (OAM)
                        this.memory[0xff41] ^= 0x02;
                        this.gpuModeTimer += 80;
                    }
                    break;
                case 1:
                    // V-blank (4560 cycles) -> switch to mode 2 (OAM)
                    this.memory[0xff41] ^= 0x03;
                    this.gpuModeTimer += 80;
                    this.memory[0xff44] = 0;                    // reset LY to 0
                    this.gpuLYTimer = Number.MAX_SAFE_INTEGER;  // disable LY timer
                    break;
            }
        }
    }

    drawLine(ly) {
        const y = (ly + this.memory[0xff42]) & 0xff;
        const x = this.memory[0xff43];
        for (let j = 0; j < 160; j++) {
            this.lineArray[j] = colors[~~(Math.random() * 4)];
        }
        this.screenContext.putImageData(this.lineData, 0, ly);
    }

    exec_frame() {
        while (this.clock < this.frameTimer) {
            this.cpu_step();
        }
        this.frameTimer += 70224;
    }

    debug_step() {
        console.log(assemblyCode[this.mmu_get(this.pc)].bind(this)());
        opCodes[this.mmu_get(this.pc)].bind(this)();
    }

    jumpTo(pcValue) {
        while (this.pc !== pcValue) {
            this.cpu_step();
        }
    }

    run() {
        this.exec_frame();
        requestAnimationFrame(this.run.bind(this));
    }

    loadRom(filename) {
        fetch(filename)
            .then(response => response.arrayBuffer())
            .then(data => {
                this.cartridge = new Uint8Array(data);
                memcpy(this.cartridge, 0, this.memory, 0, 32768);
                this.loadBios();
            });
    }

    loadBios() {
        fetch("rom/dmg.bin")
            .then(response => response.arrayBuffer())
            .then(data => {
                memcpy(new Uint8Array(data), 0, this.memory, 0, 256);
                console.log("Ready...");
            });
    }
}
