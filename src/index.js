import {DMG, pressedKeys} from "./dmg.js";

const gb = new DMG("rom/tetris.gb");
window.gb = gb;
const SCREEN_WIDTH = 160;
const SCREEN_HEIGHT = 144;

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
        gb.reset();
        gb.updateInfo();
    });
    document.getElementById("refresh-button").addEventListener("click", e => {
        gb.updateInfo();
    });
    document.getElementById("break-button").addEventListener("click", e => {
        if (typeof breakCondition === "undefined") return;
        gb.ppu.enabled = false;
        e.target.disabled = true;
        if (typeof breakCondition === "number") {
            while (gb.cpu.pc !== breakCondition) {
                gb.cpuStep();
            }
        } else {
            while (!breakCondition()) {
                gb.cpuStep();
            }
        }
        e.target.disabled = false;
        gb.ppu.enabled = true;
        gb.updateInfo();
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
