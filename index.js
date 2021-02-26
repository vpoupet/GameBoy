import {DMG, pressedButtons} from "./src/dmg.js";
import {roms} from "./src/roms.js";

const gb = new DMG();
const SCREEN_WIDTH = 160;
const SCREEN_HEIGHT = 144;
const buttonMap = {
    "q": "Start",
    "w": "Select",
    "f": "B",
    "g": "A",
    "ArrowUp": "Up",
    "ArrowDown": "Down",
    "ArrowLeft": "Left",
    "ArrowRight": "Right",
}

window.gb = gb;     // make accessible in the console
window.buttonMap = buttonMap;

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

function reset() {
    document.getElementById("serial-output").innerText = "";
    const romSelect = document.getElementById("rom-select");
    const bios = document.getElementById("skip-boot").checked ? undefined : roms['bios'];
    gb.reset(roms[romSelect.value], bios);
    gb.updateInfo();
}

window.onload = function () {
    // Screen canvas
    const canvas = document.getElementById("screen");
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;
    const context = canvas.getContext('2d');
    gb.ppu.setContext(context);

    // Keyboard events
    window.addEventListener("keydown", e => {
        pressedButtons.add(buttonMap[e.key]);
        if (document.activeElement === document.body &&
            ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
            e.preventDefault();
        }
    });
    window.addEventListener("keyup", e => {
        pressedButtons.delete(buttonMap[e.key]);
        if (document.activeElement === document.body) {
            e.preventDefault();
        }
    });

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
    document.getElementById("reset-button").addEventListener("click", reset);
    document.getElementById("refresh-button")
        .addEventListener(
            "click",
            e => {
                gb.updateInfo();
            });

    // ROM select
    const romSelect = document.getElementById("rom-select");
    romSelect.addEventListener("change", reset);

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
    const bgCanvas0 = document.getElementById("background0");
    bgCanvas0.width = 256;
    bgCanvas0.height = 256;
    const bgCanvas1 = document.getElementById("background1");
    bgCanvas1.width = 256;
    bgCanvas1.height = 256;

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

    document.getElementById("button-a").addEventListener("pointerdown", () => press('A'));
    document.getElementById("button-a").addEventListener("pointerup", () => release('A'));
    document.getElementById("button-b").addEventListener("pointerdown", () => press('B'));
    document.getElementById("button-b").addEventListener("pointerup", () => release('B'));
    document.getElementById("button-start").addEventListener("pointerdown", () => press('Start'));
    document.getElementById("button-start").addEventListener("pointerup", () => release('Start'));
    document.getElementById("button-select").addEventListener("pointerdown", () => press('Select'));
    document.getElementById("button-select").addEventListener("pointerup", () => release('Select'));
    document.getElementById("button-up").addEventListener("pointerdown", () => press('Up'));
    document.getElementById("button-up").addEventListener("pointerup", () => release('Up'));
    document.getElementById("button-down").addEventListener("pointerdown", () => press('Down'));
    document.getElementById("button-down").addEventListener("pointerup", () => release('Down'));
    document.getElementById("button-left").addEventListener("pointerdown", () => press('Left'));
    document.getElementById("button-left").addEventListener("pointerup", () => release('Left'));
    document.getElementById("button-right").addEventListener("pointerdown", () => press('Right'));
    document.getElementById("button-right").addEventListener("pointerup", () => release('Right'));

    reset();
    start();
};

function press(buttonName) {
    pressedButtons.add(buttonName);
}

function release(buttonName) {
    pressedButtons.delete(buttonName);
}