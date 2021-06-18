"use strict";
import {DMG} from "./src/dmg.js";

let gb = undefined;

function saveState() {
    document.activeElement.blur();
    if (gb.gameTitle) {
        const stateName = gb.gameTitle;
        localforage.setItem(stateName, gb.saveState())
            .then(function (value) {
                console.log('State saved.');
            });
    }
}

function loadState() {
    document.activeElement.blur();
    if (gb.gameTitle) {
        const stateName = gb.gameTitle;
        localforage.getItem(stateName)
            .then(function (value) {
                gb.loadState(value);
            })
            .catch(function (err) {
                console.log(`Error loading state: ${err}`);
            });
    }
}

function reset() {
    gb?.stop();
    document.activeElement.blur();
    document.getElementById("serial-output").innerText = "";
    const romSelect = document.getElementById("rom-select");
    const skipBoot = document.getElementById("skip-boot").checked;
    gb = new DMG();
    window.gb = gb;
    gb.loadRom(`rom/${romSelect.value}.gb`, !skipBoot);
}

window.addEventListener("load", () => {
    // Execution buttons
    document.getElementById("start-button").addEventListener("click", e => {
        gb.toggleStart();
    });
    document.getElementById("frame-button").addEventListener("click", e => {
        gb.execFrame();
        if (!gb.shouldUpdateEachFrame) {
            gb.updateInfo();
        }
    });
    document.getElementById("step-button").addEventListener("click", e => {
        gb.cpuStep();
        gb.updateInfo();
    });
    document.getElementById("reset-button").addEventListener("click", reset);
    document.getElementById("refresh-button").addEventListener("click", e => gb.updateInfo());
    document.getElementById("savestate-button").addEventListener("click", saveState);
    document.getElementById("loadstate-button").addEventListener("click", loadState);
    document.getElementById("remake-button").addEventListener("click", e => gb.ppu.toggleRemake());

    // ROM select
    document.getElementById("rom-select").addEventListener("change", reset);

    // Update each frame checkbox
    document.getElementById("update-each-frame").addEventListener("change", e => {
        gb.shouldUpdateEachFrame = e.target.checked;
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
});
