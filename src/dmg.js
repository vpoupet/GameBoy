import {CPU} from './cpu.js';
import {MMU, hex} from './mmu.js';
import {PPU} from './ppu.js';
import {asmCodes, asmCodesCB} from "./opcodes.js";


const pressedKeys = new Set();


class DMG {
    constructor() {
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
        this.lcdcStatus = false;

        this.viewAddress = 0;
    }

    reset(cartridge, bios=undefined) {
        this.clock = 0;
        this.mmu.reset(cartridge, bios);
        this.cpu.reset();
        if (bios) {
            this.ppu.setDisplayEnabled(false);
        } else {
            this.cpu.af = 0x01b0;
            this.cpu.bc = 0x0013;
            this.cpu.de = 0x00d8;
            this.cpu.hl = 0x014d;
            this.cpu.sp = 0xfffe;
            this.cpu.pc = 0x100;
            this.ppu.setDisplayEnabled(true);
            this.ppu.clearScreen();
        }
        this.updateInfo();
    }

    /**
     * Updates the state of the Gameboy after a CPU instruction has been executed
     * @param deltaClock {Number} duration (in clock cycles) of the executed CPU instruction
     */
    update(deltaClock) {
        this.clock += deltaClock;

        // FF00 - P1/JOYP - Joypad (R/W)
        const previousInputs = this.mmu.memory[0xff00] & 0x0f;
        let newInputs = 0x0f;
        if ((this.mmu.memory[0xff00] & 0x20) === 0) {
            // buttons selected
            if (pressedKeys.has("q")) newInputs &= ~0x08;  // Start
            if (pressedKeys.has("w")) newInputs &= ~0x04;  // Select
            if (pressedKeys.has("f")) newInputs &= ~0x02;  // B
            if (pressedKeys.has("g")) newInputs &= ~0x01;  // A
        }
        if ((this.mmu.memory[0xff00] & 0x10) === 0) {
            // directions selected
            if (pressedKeys.has("ArrowDown")) newInputs &= ~0x08;  // Down
            if (pressedKeys.has("ArrowUp")) newInputs &= ~0x04;    // Up
            if (pressedKeys.has("ArrowLeft")) newInputs &= ~0x02;  // Left
            if (pressedKeys.has("ArrowRight")) newInputs &= ~0x01; // Right
        }
        this.mmu.memory[0xff00] = this.mmu.memory[0xff00] & 0xf0 | newInputs;
        // TODO implement joypad interrupt correctly
        // if (previousInputs & ~newInputs) {
        //     this.mmu.memory[0xff0f] |= 0x08;    // request interrupt
        // }

        // FF04 - DIV - Divider Register (R/W)
        if ((this.clock & 0xff) - deltaClock < 0) {
            this.mmu.memory[0xff04] += 1;
        }
        // FF05 - TIMA - Timer counter (R/W)
        // FF06 - TMA - Timer Modulo (R/W)
        // FF07 - TAC - Timer Control (R/W)
        if (this.mmu.memory[0xff07] & 0x04) {
            const timerControlFrequency = [1024, 16, 64, 256][this.mmu.memory[0xff07] & 0x03];
            if ((this.clock % timerControlFrequency) - deltaClock < 0) {
                if (this.mmu.memory[0xff05] === 0xff) {
                    this.mmu.memory[0xff05] = this.mmu.memory[0xff06];
                    this.mmu.memory[0xff0f] |= 0x04;    // request interrupt on bit 2
                } else {
                    this.mmu.memory[0xff05] += 1;
                }
            }
        }

        const lineClock = this.clock % 456;
        const frameClock = this.clock % 70224;
        // FF44 - LY - LCDC Y-Coordinate (R)
        if (lineClock - deltaClock < 0) {
            this.mmu.memory[0xff44] += 1;
            this.mmu.memory[0xff44] %= 154;
        }
        const _ff44 = this.mmu.memory[0xff44];
        // FF41 - STAT - LCDC Status (R/W)
        // Update LCD Mode Flag (bits 0-1)
        let mode;
        if (frameClock >= 65664) {
            mode = 1;   // V-blank (4560 cycles)
            this.mmu.memory[0xff0f] |= 0x01;    // request V-Blank interrupt
        } else if (lineClock < 80) {
            mode = 2;   // Reading from OAM (80 cycles)
        } else if (lineClock < 252) {
            mode = 3;   // Reading from OAM and VRAM (172 cycles)
        } else {
            mode = 0;   // H-Blank (204 cycles)
        }
        this.mmu.memory[0xff41] = this.mmu.memory[0xff41] & 0xfc | mode;
        // Draw line at beginning of mode 3
        if (mode === 3 && lineClock - deltaClock < 80) {
            this.ppu.drawLine(_ff44);
        }
        // Set this.isNewFrame at beginning of frame
        if (frameClock - deltaClock < 0) {
            this.isNewFrame = true;
        }

        // Update Coincidence Flag (bit 2)
        if (_ff44 === this.mmu.memory[0xff45]) {
            this.mmu.memory[0xff41] |= 0x04;    // set coincidence flag
        } else {
            this.mmu.memory[0xff41] &= 0xfb;    // reset coincidence flag
        }
        // Update Interrupts
        const previousStatus = this.lcdcStatus;
        const _ff41 = this.mmu.memory[0xff41];
        this.lcdcStatus = (_ff41 & 0x40) && _ff44 === this.mmu.memory[0xff45]
            || (_ff41 & 0x20) && (_ff41 & 0x03) === 2
            || (_ff41 & 0x10) && (_ff41 & 0x03) === 1
            || (_ff41 & 0x08) && (_ff41 & 0x03) === 0;
        if (!previousStatus && this.lcdcStatus) {
            this.mmu.memory[0xff0f] |= 0x02;    // request interrupt
        }
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

    updateInfo() {
        // Clock
        const cpuClock = document.getElementById("cpu-clock");
        cpuClock.innerHTML = `clk: ${this.clock}`;

        // Registers
        const cpuRegisters = document.getElementById("registers-row");
        cpuRegisters.innerHTML = `<td>${hex(this.cpu.af, 4)}</td><td>${hex(this.cpu.bc, 4)}</td><td>${hex(this.cpu.de, 4)}</td><td>${hex(this.cpu.hl, 4)}</td><td>${hex(this.cpu.sp, 4)}</td><td>${hex(this.cpu.pc, 4)}</td><td>${this.cpu.flagZ}${this.cpu.flagN}${this.cpu.flagH}${this.cpu.flagC}</td>`;

        // Previous instructions
        let instructions = [];
        for (const addr of this.cpu.previousPC) {
            const [instruction, length] = this.getASMInstruction(addr);
            instructions.push(instruction);
        }
        document.getElementById("previous-asm").innerHTML = '<pre>' + instructions.join('\n') + '</pre>';
        // Next instructions
        instructions = [];
        let addr = this.cpu.pc;
        for (let i = 0; i < 10; i++) {
            const [instruction, length] = this.getASMInstruction(addr);
            instructions.push(instruction);
            addr += length;
        }
        document.getElementById("asm").innerHTML = '<pre>' + instructions.join('\n') + '</pre>';

        // Tiles and BG
        this.ppu.displayTiles();
        this.ppu.displayMaps();
        // Memory
        this.updateMemoryView();
    }

    appendToSerialOutput(val) {
        // document.getElementById("serial-output").innerText += String.fromCharCode(val);
    }

    getASMInstruction(addr) {
        let instruction = "";
        const opCode = this.mmu.get(addr);
        let description = asmCodes[opCode][0];
        let [length, duration] = asmCodes[opCode][1].split("  ").map(parseInt);

        if (opCode === 0xCB) {
            const opCodeCB = this.mmu.get(addr + 1);
            description = asmCodesCB[opCodeCB][0];
            [length, duration] = asmCodesCB[opCodeCB][1].split("  ").map(parseInt);
            length -= 1;
        }
        instruction += `${hex(addr, 4)}: ${description}`;

        if (length === 2) {
            instruction += ` (${hex(this.mmu.get(addr + 1), 2)})`;
        } else if (length === 3) {
            instruction += ` (${hex(this.mmu.get16(addr + 1))})`;
        }
        return [instruction, length];
    }

    updateMemoryView() {
        const lines = [];
        for (let addr = this.viewAddress; addr < this.viewAddress + 0x100; addr += 0x10) {
            const line = ["0x" + hex(addr, 4) + ": "];
            for (let i = 0x00; i < 0x10; i++) {
                line.push(hex(this.mmu.get(addr + i), 2));
            }
            lines.push('<tr><td>' + line.join('</td><td>') + '</td></tr>');
        }

        document.getElementById("memory-tbody").innerHTML = lines.join("");
    }

    setViewAddress(addr) {
        if (Number.isNaN(addr)) {
            this.viewAddress = 0;
        } else {
            this.viewAddress = Math.max(0, Math.min(0xff00, addr));
            this.viewAddress >>= 3;
            this.viewAddress <<= 3;
        }
        this.updateMemoryView();
    }
}

export {
    DMG, hex, pressedKeys,
};
