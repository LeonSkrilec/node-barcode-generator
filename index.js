const JsBarcode = require("jsbarcode");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const codes = require("./codes.js");
// JsBarcode(canvas, "Hello");

const state = {
    progress: 0,
    canvases: {
        bg: {
            canvas: null,
            ctx: null,
        },
        barcode: {
            canvas: null,
            ctx: null,
        },
    },

    bg: null,
    codes,
};

function start() {
    console.log("progress", state.progress);
    console.log("codes length", state.codes.codes.length);
    if (state.progress === state.codes.codes.length) return false;

    const code = state.codes.codes[state.progress];
    state.progress += 1;

    return saveImage(code);
}

function saveImage(code) {
    JsBarcode(state.canvases.barcode.canvas, code, {
        format: "CODE128",
    });

    state.canvases.bg.ctx.drawImage(state.bg, 0, 0, 600, 600);
    state.canvases.bg.ctx.drawImage(state.canvases.barcode.canvas, 145, 450, 310, 142);

    fs.writeFileSync(`./output/${state.progress}.png`, state.canvases.bg.canvas.toBuffer());

    return start();
}

function initCanvas() {
    state.canvases.bg.canvas = createCanvas(600, 600);
    state.canvases.bg.ctx = state.canvases.bg.canvas.getContext("2d");

    state.canvases.barcode.canvas = createCanvas(600, 600);
    state.canvases.barcode.ctx = state.canvases.barcode.canvas.getContext("2d");
}

function initData() {
    loadImage("./bg.png")
        .then(image => {
            state.bg = image;
            initCanvas();
            start();
        })
        .catch(res => {
            console.log(res);
            throw new Error(res);
        });
}

initData();
