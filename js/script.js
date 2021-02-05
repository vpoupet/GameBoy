const scale = 1;
const screenWidth = 160;
const screenHeight = 144;
let gb;

['#A2BA3D', '#92AA38', '#3D6036', '#1B3714'];


window.onload = function() {
    const canvas = document.getElementById("screen");
    canvas.width = screenWidth * scale;
    canvas.height = screenHeight * scale;
    gb = new GameBoy(canvas);
    gb.loadRom("rom/tetris.gb");

    // ctx = canvas.getContext('2d');
    // ctx.scale(scale, scale);
    // ctx.fillStyle = colors[0];
    // ctx.fillRect(0, 0, screenWidth, screenHeight);
};

