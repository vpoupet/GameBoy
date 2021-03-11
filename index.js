"use strict";
import { DMG } from "./src/dmg.js";
const gb = new DMG();

window.gb = gb;     // make accessible in the console

function runToBreak() {
    let breakCondition = document.getElementById("break-condition").value;
    gb.ppu.shouldDrawLines = false;
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
    gb.ppu.shouldDrawLines = true;
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
    const skipBoot = document.getElementById("skip-boot").checked;
    gb.loadRom(`rom/${romSelect.value}.gb`, !skipBoot);
}

window.onload = function () {
    // Screen canvas
    gb.ppu.setScreenCanvas([...document.getElementsByClassName("screen-layer")]);

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
                if (!gb.shouldUpdateEachFrame) {
                    gb.updateInfo();
                }
            });
    document.getElementById("step-button")
        .addEventListener(
            "click",
            e => {
                gb.cpuStep();
                gb.updateInfo();
            });
    document.getElementById("reset-button").addEventListener("click", reset);
    document.getElementById("refresh-button").addEventListener("click",e => gb.updateInfo());
    document.getElementById("upscale-button").addEventListener("click", e => gb.ppu.toggleUpscaleData());

    // ROM select
    const romSelect = document.getElementById("rom-select");
    romSelect.addEventListener("change", reset);

    document.getElementById("update-each-frame").addEventListener("change", e => {
        gb.shouldUpdateEachFrame = e.target.checked;
    });
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
