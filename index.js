import {DMG, pressedKeys} from "./src/dmg.js";
import {roms} from "./src/roms.js";

const gb = new DMG();
window.gb = gb;     // make accessible in the console

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
    canvas.addEventListener("keydown", e => {
        pressedKeys.add(e.key);
        e.preventDefault();
    });
    canvas.addEventListener("keyup", e => {
        pressedKeys.delete(e.key);
        e.preventDefault();
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

    reset();
};
