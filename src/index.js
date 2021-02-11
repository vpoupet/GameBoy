import {DMG} from "./dmg.js";
import {asmCodes, asmCodesCB} from "./opcodes";

const gb = new DMG("rom/tetris.gb");
const SCREEN_WIDTH = 160;
const SCREEN_HEIGHT = 144;
const cpuRegisters = document.getElementById("registers-row");
const cpuClock = document.getElementById("cpu-clock");
const asm = document.getElementById("asm");


function hex(n, length = 4) {
    const nString = n.toString(16);
    return "0".repeat(length - nString.length) + nString;
}


window.onload = function () {
    const canvas = document.getElementById("screen");
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;
    gb.ppu.setContext(canvas.getContext('2d'));

    const startButton = document.getElementById("start-button");
    startButton.addEventListener("click", e => {
        if (gb.requestID !== undefined) {
            gb.stop();
            startButton.innerHTML = "Start";
            updateCPUInfo();
        } else {
            gb.start();
            startButton.innerHTML = "Stop";
        }
    })
    document.getElementById("frame-button").addEventListener("click", e => {
        gb.execFrame();
        updateCPUInfo();
    });
    document.getElementById("step-button").addEventListener("click", e => {
        gb.cpuStep();
        updateCPUInfo();
    });
    document.getElementById("reset-button").addEventListener("click", e => {
        gb.stop();
        startButton.innerHTML = "Start";
        gb.reset();
        updateCPUInfo();
    });
};


function showInstructions(gb, nbLines) {
    let addr = gb.cpu.pc;
    let result = "";
    for (let i = 0; i < nbLines; i++) {
        const opCode = gb.mmu.get(addr);
        let description = asmCodes[opCode][0];
        let [length, duration] = asmCodes[opCode][1].split("  ").map(parseInt);

        if (opCode === 0xCB) {
            const opCodeCB = gb.mmu.get(addr + 1);
            description = asmCodesCB[opCodeCB][0];
            [length, duration] = asmCodesCB[opCodeCB][1].split("  ").map(parseInt);
            length -= 1;
        }
        result += `${hex(addr, 4)}: ${description}`;

        if (length === 2) {
            result += ` (${hex(gb.mmu.get(gb.cpu.pc + 1), 2)})`;
        } else if (length === 3) {
            result += ` (${hex(gb.mmu.get16(gb.cpu.pc + 1))})`;
        }
        result += "\n";
        addr += length;
    }
    return result;
}


function updateCPUInfo() {
    cpuClock.innerHTML = `clk: ${gb.clock}`;
    cpuRegisters.innerHTML = `<td>${hex(gb.cpu.af, 4)}</td><td>${hex(gb.cpu.bc, 4)}</td><td>${hex(gb.cpu.de, 4)}</td><td>${hex(gb.cpu.hl, 4)}</td><td>${hex(gb.cpu.pc, 4)}</td><td>${hex(gb.cpu.sp, 4)}</td><td>${gb.cpu.flagZ}${gb.cpu.flagN}${gb.cpu.flagH}${gb.cpu.flagC}</td>`;
    asm.innerHTML = '<pre>' + showInstructions(gb, 10) + '</pre>';
}
