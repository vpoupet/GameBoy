import {isButtonPressed, updateGamepadButtons} from './input.js';
import {CPU} from './cpu.js';
import {MMU, hex} from './mmu.js';
import {PPU, GamePPU} from './ppu.js';
import {asmCodes, asmCodesCB} from "./opcodes.js";


class DMG {
    constructor() {
        /**
         * Memory Management Unit
         * @type {MMU}
         */
        this.mmu = new MMU(this);
        /**
         * Central Processing Unit
         * @type {CPU}
         */
        this.cpu = new CPU(this);
        /**
         * Pixel Processing Unit
         * @type {PPU}
         */
        this.ppu = new PPU(this);
        /**
         * Clock counter
         * @type {number}
         */
        this.clock = 0;
        this.isNewFrame = false;
        this.shouldUpdateEachFrame = false;
        this.requestID = undefined;
        this.viewAddress = 0;
        this.gameTitle = undefined;
    }

    loadRom(romFile, execBios = true) {
        fetch(romFile)
            .then(response => response.arrayBuffer())
            .then(data => {
                const bytes = new Uint8Array(data);
                // get game title from cartridge header
                this.gameTitle = "";
                for (let offset = 0x0134; offset < 0x0144; offset++) {
                    if (bytes[offset] === 0) break;
                    this.gameTitle += String.fromCharCode(bytes[offset]);
                }
                if (this.gameTitle in GamePPU) {
                    this.ppu = new GamePPU[this.gameTitle](this);
                }
                this.reset(bytes, execBios);
            });
    }

    reset(cartridge, execBios = true) {
        this.stop();
        this.clock = 0;
        this.mmu.reset(cartridge, execBios);
        this.cpu.reset(execBios);
        this.ppu.reset();
        this.updateInfo();
        this.start();

        // clear backgrounds (from possible remakes)
        for (const canvas of document.getElementsByClassName("screen-layer")) {
            canvas.style.backgroundImage = "none";
        }
        document.getElementById("parallax").style.backgroundImage = "none";
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
            if (isButtonPressed("start")) newInputs &= ~0x08;  // Start
            if (isButtonPressed("select")) newInputs &= ~0x04;  // Select
            if (isButtonPressed("b")) newInputs &= ~0x02;  // B
            if (isButtonPressed("a")) newInputs &= ~0x01;  // A
        }
        if ((this.mmu.memory[0xff00] & 0x10) === 0) {
            // directions selected
            if (isButtonPressed("down")) newInputs &= ~0x08;  // Down
            if (isButtonPressed("up")) newInputs &= ~0x04;    // Up
            if (isButtonPressed("left")) newInputs &= ~0x02;  // Left
            if (isButtonPressed("right")) newInputs &= ~0x01; // Right
        }
        this.mmu.memory[0xff00] = this.mmu.memory[0xff00] & 0xf0 | newInputs;
        // TODO implement joypad interrupt correctly
        // if (previousInputs & ~newInputs) {
        //     this.mmu.memory[0xff0f] |= 0x08;    // request interrupt
        // }

        // FF04 - DIV - Divider Register (R/W)
        const div = this.mmu.dataView.getInt16(0xff03, true);
        this.mmu.dataView.setUint16(0xff03, div + deltaClock, true);
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

        // DMA Timer
        if (this.mmu.dmaTimer > 0) {
            this.mmu.dmaTimer -= deltaClock;
        }

        // Update PPU
        if (this.ppu.enabled) {
            this.ppu.update(deltaClock);
        }
    }

    cpuStep() {
        const deltaTime = this.cpu.exec();
        this.update(deltaTime);
    }

    execFrame() {
        this.isNewFrame = false;
        updateGamepadButtons();
        this.ppu.startFrame();
        while (!this.isNewFrame) {
            this.cpuStep();
        }
        if (this.shouldUpdateEachFrame) {
            this.updateInfo();
        }
    }

    start() {
        this.execFrame();
        this.requestID = requestAnimationFrame(this.start.bind(this));
        document.getElementById("start-button").innerText = "Stop";
    }

    stop() {
        if (this.requestID) {
            window.cancelAnimationFrame(this.requestID);
            this.requestID = undefined;
            this.updateInfo();
        }
        document.getElementById("start-button").innerText = "Start";
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
    DMG, hex,
};
