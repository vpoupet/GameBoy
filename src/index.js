import {DMG, pressedKeys} from "./dmg.js";

const gb = new DMG();
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

function start() {
    gb.start();
    document.getElementById("start-button").innerHTML = "Stop";
}

function stop() {
    gb.stop();
    document.getElementById("start-button").innerHTML = "Start";
    gb.updateInfo();
}

window.onload = function () {
    // Keyboard events
    window.addEventListener("keydown", e => pressedKeys.add(e.key));
    window.addEventListener("keyup", e => pressedKeys.delete(e.key));

    // Screen canvas
    const canvas = document.getElementById("screen");
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;
    gb.ppu.setContext(canvas.getContext('2d'));

    // Execution buttons
    document.getElementById("start-button")
        .addEventListener("click", e => {
            if (gb.requestID !== undefined) stop();
            else start();
        });
    document.getElementById("frame-button")
        .addEventListener(
            "click",
            e => {
                gb.execFrame();
                gb.updateInfo();
            });
    document.getElementById("step-button")
        .addEventListener(
            "click",
            e => {
                gb.cpuStep();
                gb.updateInfo();
            });
    document.getElementById("reset-button")
        .addEventListener(
            "click",
            e => {
                stop();
                document.getElementById("serial-output").innerText = "";
                gb.reset();
                gb.updateInfo();
            });
    document.getElementById("refresh-button")
        .addEventListener(
            "click",
            e => {
                gb.updateInfo();
            });

    // ROM select
    const romSelect = document.getElementById("rom-select");
    romSelect.addEventListener(
        "change",
        e => {
            stop();
            gb.loadRom("rom/" + e.target.value);
        }
    )
    gb.loadRom("rom/" + romSelect.value);

    // Break condition
    document.getElementById("break-condition")
        .addEventListener(
            "keydown",
            e => {
                if (e.key === 'Enter') {
                    runToBreak();
                    gb.setViewAddress(parseInt(e.target.value, 16));
                }
            });
    document.getElementById("break-button")
        .addEventListener(
            "click",
            e => {
                runToBreak();
            });

    // Tiles and BG canvas
    const tilesCanvas = document.getElementById("tiles");
    tilesCanvas.width = 128;
    tilesCanvas.height = 192;
    const bgCanvas = document.getElementById("background");
    bgCanvas.width = 256;
    bgCanvas.height = 256;

    // Address view buttons
    document.getElementById("address")
        .addEventListener(
            "keydown",
            e => {
                if (e.key === 'Enter') {
                    gb.setViewAddress(parseInt(e.target.value, 16));
                }
            });
    document.getElementById("address-down-button")
        .addEventListener(
            "click",
            e => {
                gb.setViewAddress(gb.viewAddress + 0x80);
            });
    document.getElementById("address-up-button")
        .addEventListener(
            "click",
            e => {
                gb.setViewAddress(gb.viewAddress - 0x80);
            });
};
