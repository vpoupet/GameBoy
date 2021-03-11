"use strict";

const AXES_THRESHOLD = .4;
let pressedButtons = [];
let pressedKeys = new Set();
let buttonMap = {
    start: "q",
    select: "w",
    a: "g",
    b: "f",
    up: "ArrowUp",
    down: "ArrowDown",
    left: "ArrowLeft",
    right: "ArrowRight",
};
window.buttonMap = buttonMap;   // make accessible in the console


    // Gamepad events
    window.addEventListener("gamepadconnected", (event) => {
        console.log("A gamepad connected:");
        console.log(event.gamepad);
        pressedButtons[event.gamepad.index] = new Set();
    });

    window.addEventListener("gamepaddisconnected", (event) => {
        console.log("A gamepad disconnected:");
        console.log(event.gamepad);
        pressedButtons[event.gamepad.index] = undefined;
    });

    // Keyboard events
    window.addEventListener("keydown", e => {
        pressedKeys.add(e.key);
        if (document.activeElement === document.body &&
            ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
            e.preventDefault();
        }
    });

    window.addEventListener("keyup", e => {
        pressedKeys.delete(e.key);
    });


function isButtonPressed(buttonName) {
    return pressedKeys.has(buttonMap[buttonName]);
}


export {
    isButtonPressed,
};
