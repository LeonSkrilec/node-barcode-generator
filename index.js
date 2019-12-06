const JsBarcode = require("jsbarcode");
const { createCanvas } = require("canvas");
const fs = require("fs");
const { DOMImplementation, XMLSerializer } = require('xmldom');

const settings = {
    inputFile: "./codes.txt",
    outputFormat: "png", // svg || png
    outputFolder: `./output/png/`,
    codeSeparator: "\r\n", // separator which separates each code in inputFile
}

const state = {
    progress: 0,
    barcode: {
        canvas: null,
        ctx: null,
    },
    codes: [],
    svg: {
        XMLSerializer: null,
        document: null,
        node: null
    }
};

function generateBarcode() {
    console.log("progress", state.progress);
    console.log("codes length", state.codes.length);
    if (state.progress === state.codes.length) return false;

    const code = state.codes[state.progress];
    state.progress += 1;

    return saveImage(code);
}

function saveImage(code) {
    if (settings.outputFormat === "png") {
        JsBarcode(state.barcode.canvas, code, {
            format: "CODE39",
            height:120,
            displayValue: false
        });
        
        fs.writeFileSync(`${settings.outputFolder}${code}.png`, state.barcode.canvas.toBuffer());
    }
    else if (settings.outputFormat === "svg") {
        JsBarcode(state.svg.node, code, {
            xmlDocument: state.svg.document,
        });

        const svgText = state.svg.XMLSerializer.serializeToString(state.svg.node);
        fs.writeFileSync(`${settings.outputFolder}${state.progress}.svg`, svgText);
    }
    

    return generateBarcode();
}

function initCanvas() {
    state.barcode.canvas = createCanvas(600, 600);
    state.barcode.ctx = state.barcode.canvas.getContext("2d");
}

function initSvgDocument() {
    state.svg.XMLSerializer = new XMLSerializer();
    state.svg.document = new DOMImplementation().createDocument('http://www.w3.org/1999/xhtml', 'html', null);
    state.svg.node = state.svg.document.createElementNS('http://www.w3.org/2000/svg', 'svg');
}

function initData() {
    // Check if output folder exists - if not create it
    if (!fs.existsSync(settings.outputFolder)) fs.mkdirSync(settings.outputFolder);

    if (settings.outputFormat === "svg") initSvgDocument();
    else if (settings.outputFormat === "png") initCanvas();
    // Load data
    fs.readFile(settings.inputFile, 'utf8', function(err, data) {
        state.codes = data.split(settings.codeSeparator);
        initCanvas();
        generateBarcode();
    });
}

initData();
