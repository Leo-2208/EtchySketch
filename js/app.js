import * as canvas from "./canvas.js";

const SLIDER = document.querySelector(".slider");

let activeColor, activeColorHex;

activeColor = document.querySelector("#active-color");
activeColorHex = document.querySelector("#hex");


document.querySelector(".tab .options").addEventListener("click", event => {
    //check if clicked tab is active or not
    if (!event.target.classList.contains("active") && event.target.tagName == "LI") {
        let index = Array.prototype.indexOf.call(event.target.parentNode.children, event.target);
        //remove active class from active tab
        document.querySelector(".active").classList.remove("active");
        event.target.classList.add("active");
        //adjust slider
        SLIDER.style.left = `calc(((50% - 4px) * ${index}) + 4px)`;
    }
    event.stopImmediatePropagation();
})

//-------------------color picker-------------------
const colorPicker = new iro.ColorPicker(".color-picker-box", {
    width: 204,
    color: "#EA9A39",
    layout: [
        {
            component: iro.ui.Box,
            options: {
                boxHeight: 104
            }
        },
        {
            component: iro.ui.Slider,
            options: {
                height: 14,
                sliderType: "hue",
                sliderSize: 12
            }
        }
    ],
    display: "flex",
    padding: 0,
    margin: 0,
    borderWidth: 0,
    handleRadius: 8,
    handleSvg: "#color-picker-handle",
    id: "color-picker-iro"
});
colorPicker.on(["mount", "color:change"], updateActiveColor);
activeColorHex.addEventListener("change", (e) => {
    colorPicker.color.hexString = e.target.value;
});
function updateActiveColor() {
    activeColor.style.backgroundColor = colorPicker.color.hexString;
    activeColorHex.value = colorPicker.color.hexString;
}
//-------------help about extension---------------
document.querySelector("#help-about").addEventListener("click", () => {
    document.querySelector(".sidebar-extension").classList.toggle("active");
});
document.querySelector("#close-extension").addEventListener("click", () => {
    document.querySelector(".sidebar-extension").classList.remove("active");
})

//----------------- CANVAS -----------------------

const gridCanvas = document.querySelector("#grid-canvas");
const drawingCanvas = document.querySelector("#drawing-canvas");
const gridLinesElement = document.querySelector("#grid-lines");
gridCanvas.ctx = gridCanvas.getContext("2d");
drawingCanvas.ctx = drawingCanvas.getContext("2d");

let gridLines, canvasSize, cellSize;
gridLines = Number(gridLinesElement.innerText);
let paintingMode = false;
let colorPickerMode = false;
function initializeCanvas() {
    /*
    * Since Canvas is square, we need to take the min value of the container to prevent overflow and keep canvas centered 
    * canvas width == canvas container width or height ( whichever is smaller ) - 50(padding) 
    * Also we need to make sure that the canvas width is equally divided into cols and rows, to prevent fractional grid lines.
    TODO : fix for retina display
    */
    canvasSize = (Math.min(document.querySelector(".canvas-container").clientHeight, document.querySelector(".canvas-container").clientWidth) - 50);
    cellSize = Math.floor(canvasSize / gridLines);
    //changing canvas width to keep everything in whole numbers
    canvasSize = cellSize * gridLines;

    canvas.resizeCanvas(gridCanvas, canvasSize, canvasSize);
    canvas.resizeCanvas(drawingCanvas, canvasSize, canvasSize);
    canvas.clearCanvas(gridCanvas.ctx, canvasSize, canvasSize);
    canvas.clearCanvas(drawingCanvas.ctx, canvasSize, canvasSize);
    canvas.drawGrid(gridCanvas.ctx, canvasSize, canvasSize, cellSize, cellSize, gridLines);
}

initializeCanvas();

//canvas grid lines increase/derease
document.querySelector(".grid-controls").addEventListener("click", event => {
    if (event.target.tagName == "BUTTON" && event.target.id.includes("grid-lines")) {
        if (event.target.id.includes("increase") && gridLines < 99)
            gridLines++;
        else if (event.target.id.includes("decrease") && gridLines > 2)
            gridLines--;
        gridLinesElement.innerText = gridLines;
        initializeCanvas();
    } else if (event.target.tagName == "BUTTON" && event.target.id.includes("toggle-lines")) {
        gridCanvas.classList.toggle("active");
    }
});

//canvas clearAll i.e. clear drawing canvas
document.querySelector("#clear-all").addEventListener("click", () => {
    canvas.clearCanvas(drawingCanvas.ctx, canvasSize, canvasSize);
});
//double click to erase
gridCanvas.addEventListener("dblclick", e => {
    let currentCell = canvas.getCurrentCell(gridCanvas, e.clientX, e.clientY, cellSize, cellSize);
    canvas.clearCell(drawingCanvas.ctx,currentCell.x, currentCell.y, cellSize, cellSize);
});
//canvas drawing
//document.querySelector("#grid-canvas").addEventListener("click", () => paintingMode = !paintingMode);
gridCanvas.addEventListener("mousedown", () => paintingMode = true);
/*listening for mouseup on documentElement
so that when mouse is released outside canvas, drawingMode is still turned off*/
document.documentElement.addEventListener("mouseup", () => paintingMode = false);
gridCanvas.addEventListener("mousemove", e => {
    if (colorPickerMode) {
        let mousePos = canvas.getCanvasMousePosition(gridCanvas, e.clientX, e.clientY);
        activeColor.style.backgroundColor= canvas.getPixelColor(drawingCanvas.ctx,mousePos.x,mousePos.y);
    }
    else if (paintingMode) {
        let currentCell = canvas.getCurrentCell(gridCanvas, e.clientX, e.clientY, cellSize, cellSize);
        canvas.drawCell(drawingCanvas.ctx,currentCell.x, currentCell.y, cellSize, cellSize, activeColorHex.value);
    }
});

//color picker
document.querySelector("#eye-dropper").addEventListener("click", () => {
    colorPickerMode = !colorPickerMode;
    gridCanvas.classList.toggle("color-picker-mode");
    updateActiveColor();
});
gridCanvas.addEventListener("click", (e) =>{
    if(colorPickerMode){
        colorPickerMode = false;
        gridCanvas.classList.remove("color-picker-mode");
        //get color
        let mousePos = canvas.getCanvasMousePosition(gridCanvas, e.clientX, e.clientY);
        colorPicker.color.rgbaString = canvas.getPixelColor(drawingCanvas.ctx,mousePos.x,mousePos.y);
    }
});