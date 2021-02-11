import { CPU } from './cpu.js';
import { MMU } from './mmu.js';
import { PPU } from './ppu.js';

class DMG {
    constructor(romFile) {
        this.mmu = new MMU(this);
        this.cpu = new CPU(this);
        this.ppu = new PPU(this);
        /**
         * Clock counter
         * @type {number}
         */
        this.clock = 0;
        this.isNewFrame = false;
        this.requestID = undefined;

        // open BIOS and Cartridge
        Promise.all([
            fetch("rom/dmg.bin")
                .then(response => response.arrayBuffer())
                .then(data => {
                    this.mmu.bios = new Uint8Array(data);
                }),
            fetch(romFile)
                .then(response => response.arrayBuffer())
                .then(data => {
                    this.mmu.cartridge = new Uint8Array(data);
                }),
        ]).then(this.reset.bind(this));
    }

    reset() {
        this.clock = 0;
        this.mmu.reset();
        this.cpu.reset();
        this.ppu.setDisplayEnabled(false);
        console.log("Reset.");
    }

    /**
     * Updates the state of the Gameboy after a CPU instruction has been executed
     * @param deltaClock {Number} duration (in clock cycles) of the executed CPU instruction
     */
    update(deltaClock) {
        // FF04 - DIV - Divider Register (R/W)
        if ((this.clock & 0xff) + deltaClock >= 256) {
            this.mmu.memory[0xff04] += 1;
        }
        // FF05 - TIMA - Timer counter (R/W)
        // FF06 - TMA - Timer Modulo (R/W)
        // FF07 - TAC - Timer Control (R/W)
        if (this.mmu.memory[0xff07] & 0x04) {
            const timerControlFrequency = [1024, 16, 64, 256][this.mmu.memory[0xff07] & 0x03];
            if ((this.clock % timerControlFrequency) + deltaClock >= timerControlFrequency) {
                if (this.mmu.memory[0xff05] === 0xff) {
                    this.mmu.memory[0xff05] = this.mmu.memory[0xff06];
                    this.mmu.memory[0xff0f] |= 0x04;    // request interrupt on bit 2
                } else {
                    this.mmu.memory[0xff05] += 1;
                }
            }
        }
        const lineClock = this.clock % 456;
        // FF44 - LY - LCDC Y-Coordinate (R)
        if (lineClock + deltaClock >= 456) {
            this.mmu.memory[0xff44] += 1;
            this.mmu.memory[0xff44] %= 154;
        }
        // FF41 - STAT - LCDC Status (R/W)
        switch (this.mmu.memory[0xff41] & 0x03) {
            case 2:
                // Reading from OAM (80 cycles)
                if (80 - deltaClock <= lineClock && lineClock < 80) {
                    // switch to mode 3 (OAM + VRAM)
                    this.mmu.memory[0xff41] &= 0xfc;
                    this.mmu.memory[0xff41] |= 0x03;
                    this.ppu.drawLine(this.mmu.memory[0xff44]);
                }
                break;
            case 3:
                // Reading from OAM and VRAM (172 cycles)
                if (252 - deltaClock <= lineClock && lineClock < 252) {
                    // switch to mode 0 (H-Blank)
                    this.mmu.memory[0xff41] &= 0xfc;
                    if (this.mmu.memory[0xff41] & 0x08) {
                        // request interrupt
                        this.mmu.memory[0xff0f] |= 0x02;
                    }
                }
                break;
            case 0:
                // H-Blank (204 cycles)
                if (lineClock + deltaClock >= 456) {
                    if (this.mmu.memory[0xff44] === 144) {
                        // switch to mode 1 (V-Blank)
                        this.mmu.memory[0xff41] &= 0xfc;
                        this.mmu.memory[0xff41] |= 0x01;
                        if (this.mmu.memory[0xff41] & 0x10) {
                            // request interrupt
                            this.mmu.memory[0xff0f] |= 0x01;
                        }
                    } else {
                        // switch to mode 2 (OAM)
                        this.mmu.memory[0xff41] &= 0xfc;
                        this.mmu.memory[0xff41] |= 0x02;
                        if (this.mmu.memory[0xff41] & 0x20) {
                            // request interrupt
                            this.mmu.memory[0xff0f] |= 0x02;
                        }
                    }
                }
                break;
            case 1:
                // V-blank (4560 cycles)
                const frameClock = this.clock % 70224;
                if (frameClock + deltaClock >= 70224) {
                    // switch to mode 2
                    this.mmu.memory[0xff41] &= 0xfc;
                    this.mmu.memory[0xff41] |= 0x02;
                    if (this.mmu.memory[0xff41] & 0x20) {
                        // request interrupt
                        this.mmu.memory[0xff0f] |= 0x02;
                    }
                    this.isNewFrame = true;
                }
                break;
        }

        // LYC=LY Coincidence Interrupt and Flag
        if (this.mmu.memory[0xff44] === this.mmu.memory[0xff45]) {
            // LY == LYC
            if (!(this.mmu.memory[0xff41] & 0x04) && this.mmu.memory[0xff41] & 0x40) {
                this.mmu.memory[0xff0f] |= 0x02;    // request interrupt
            }
            this.mmu.memory[0xff41] |= 0x04;    // set coincidence flag
        } else {
            // LY != LYC
            this.mmu.memory[0xff41] &= 0xfb;    // reset coincidence flag
        }

        this.clock += deltaClock;
    }

    cpuStep() {
        const deltaTime = this.cpu.exec();
        this.update(deltaTime);
    }

    execFrame() {
        this.isNewFrame = false;
        while (!this.isNewFrame) {
            this.cpuStep();
        }
    }

    start() {
        this.execFrame();
        this.requestID = requestAnimationFrame(this.start.bind(this));
    }

    stop() {
        window.cancelAnimationFrame(this.requestID);
        this.requestID = undefined;
    }
}

export {
    DMG,
};
