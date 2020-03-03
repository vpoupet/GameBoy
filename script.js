let canvas;
let ctx;
const scale = 1;
const screenWidth = 160;
const screenHeight = 144;

const colors = ['#A2BA3D', '#92AA38', '#3D6036', '#1B3714'];

window.onload = function() {
    canvas = document.getElementById("screen");
    canvas.width = screenWidth * scale;
    canvas.height = screenHeight * scale;
    ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    ctx.fillStyle = colors[0];
    ctx.fillRect(0, 0, screenWidth, screenHeight);
    randScreen();
};

function randScreen() {
    for (let i = 0; i < screenHeight; i++) {
        for (let j = 0; j < screenWidth; j++) {
            ctx.fillStyle = colors[~~(Math.random() * 4)];
            ctx.fillRect(j, i, 1, 1);
        }
    }
    window.requestAnimationFrame(randScreen);
}