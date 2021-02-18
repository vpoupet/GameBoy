import {DMG, pressedKeys} from "./dmg.js";

// const gb = new DMG("rom/01-special.gb");
// const gb = new DMG("rom/02-interrupts.gb");
// const gb = new DMG("rom/03-op sp,hl.gb");
// const gb = new DMG("rom/04-op r,imm.gb");
// const gb = new DMG("rom/05-op rp.gb");  // passed
// const gb = new DMG("rom/06-ld r,r.gb"); // passed
// const gb = new DMG("rom/07-jr,jp,call,ret,rst.gb");
// const gb = new DMG("rom/08-misc instrs.gb");    // passed
// const gb = new DMG("rom/09-op r,r.gb");
// const gb = new DMG("rom/10-bit ops.gb");    // passed
// const gb = new DMG("rom/11-op a,(hl).gb");
// const gb = new DMG("rom/cpu_test.gb");
// const gb = new DMG("rom/sml.gb");
const gb = new DMG("rom/tetris.gb");

window.gb = gb;
const SCREEN_WIDTH = 160;
const SCREEN_HEIGHT = 144;


function runToBreak() {
    let breakCondition = document.getElementById("break-condition").value;
    gb.ppu.enabled = false;
    if (typeof eval(breakCondition) === "number") {
        const addr = eval(breakCondition);
        while (gb.cpu.pc !== addr) {
            gb.cpuStep();
        }
    } else {
        while (!eval(breakCondition)) {
            gb.cpuStep();
        }
    }
    gb.ppu.enabled = true;
    gb.updateInfo();
    console.log("Breakpoint reached");
}


window.onload = function () {
    const canvas = document.getElementById("screen");
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;
    gb.ppu.setContext(canvas.getContext('2d'));

    const tilesCanvas = document.getElementById("tiles");
    tilesCanvas.width = 128;
    tilesCanvas.height = 192;
    const bgCanvas = document.getElementById("background");
    bgCanvas.width = 256;
    bgCanvas.height = 256;

    window.addEventListener("keydown", e => {
        pressedKeys.add(e.key);
    });
    window.addEventListener("keyup", e => {
        pressedKeys.delete(e.key);
    });

    const startButton = document.getElementById("start-button");
    startButton.addEventListener("click", e => {
        if (gb.requestID !== undefined) {
            gb.stop();
            startButton.innerHTML = "Start";
            gb.updateInfo();
        } else {
            gb.start();
            startButton.innerHTML = "Stop";
        }
    })
    document.getElementById("frame-button").addEventListener("click", e => {
        gb.execFrame();
        gb.updateInfo();
    });
    document.getElementById("step-button").addEventListener("click", e => {
        gb.cpuStep();
        gb.updateInfo();
    });
    document.getElementById("reset-button").addEventListener("click", e => {
        gb.stop();
        startButton.innerHTML = "Start";
        document.getElementById("serial-output").innerText = "";
        gb.reset();
        gb.updateInfo();
    });
    document.getElementById("refresh-button").addEventListener("click", e => {
        gb.updateInfo();
    });
    document.getElementById("break-condition").addEventListener("keydown", e => {
        if (e.key === 'Enter') {
            runToBreak();
            gb.setViewAddress(parseInt(e.target.value, 16));
        }
    });
    document.getElementById("break-button").addEventListener("click", e => {
        runToBreak();
    });
    document.getElementById("address").addEventListener("keydown", e => {
        if (e.key === 'Enter') {
            gb.setViewAddress(parseInt(e.target.value, 16));
        }
    });
    document.getElementById("address-down-button").addEventListener("click", e => {
        gb.setViewAddress(gb.viewAddress + 0x80);
    });
    document.getElementById("address-up-button").addEventListener("click", e => {
        gb.setViewAddress(gb.viewAddress - 0x80);
    });
};
