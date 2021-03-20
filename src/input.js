let pressedKeys = new Set();
let pressedButtons = new Set();
let pressedGamepadButtons = new Set();
let gamepadIndex = undefined;
let keyboardMap = {
    start: "q",
    select: "w",
    a: "g",
    b: "f",
    up: "ArrowUp",
    down: "ArrowDown",
    left: "ArrowLeft",
    right: "ArrowRight",
};
window.keyboardMap = keyboardMap;   // make accessible in the console
let gamepadMap = {
    start: 9,
    select: 8,
    a: 1,
    b: 0,
    up: 12,
    down: 13,
    left: 14,
    right: 15,
}


// Gamepad events
window.addEventListener("gamepadconnected", (event) => {
    console.log("A gamepad connected:");
    console.log(event.gamepad);
    gamepadIndex = event.gamepad.index;
});

window.addEventListener("gamepaddisconnected", (event) => {
    console.log("A gamepad disconnected:");
    console.log(event.gamepad);
    gamepadIndex = undefined
});

// Keyboard events
window.addEventListener("keydown", e => {
    pressedKeys.add(e.key);
    if (document.activeElement === document.body &&
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
    }
    if (e.key === "t") {
        gb.ppu.toggleRemake();
    }
});

window.addEventListener("keyup", e => {
    pressedKeys.delete(e.key);
});

window.addEventListener("load", e => {
// Clickable input elements
    for (const buttonName of ["a", "b", "start", "select", "up", "down", "left", "right"]) {
        const button = document.getElementById(`button-${buttonName}`);
        button.addEventListener("mousedown", e => {
            pressedButtons.add(buttonName);
            e.preventDefault();
        });
        button.addEventListener("mouseup", e => {
            pressedButtons.delete(buttonName);
            e.preventDefault();
        });
        button.addEventListener("mouseleave", e => {
            pressedButtons.delete(buttonName);
            e.preventDefault();
        });
        button.addEventListener("touchstart", e => {
            pressedButtons.add(buttonName);
            e.preventDefault();
        });
        button.addEventListener("touchend", e => {
            pressedButtons.delete(buttonName);
            e.preventDefault();
        });
    }
});

function updateGamepadButtons() {
    pressedGamepadButtons.clear();
    for (const gamepad of navigator.getGamepads()) {
        if (gamepad === null) continue;
        for (let i = 0; i < gamepad.buttons.length; i++) {
            if (gamepad.buttons[i].pressed) {
                pressedGamepadButtons.add(i);
            }
        }
    }
}

function isButtonPressed(buttonName) {
    return pressedButtons.has(buttonName)
        || pressedKeys.has(keyboardMap[buttonName])
        || pressedGamepadButtons.has(gamepadMap[buttonName]);
}


export {
    isButtonPressed,
    updateGamepadButtons,
};
