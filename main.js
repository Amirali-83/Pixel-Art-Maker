const gridEl = document.getElementById("grid");
const colorEl = document.getElementById("color");
const eraserEl = document.getElementById("eraser");
const clearEl = document.getElementById("clear");
const saveEl = document.getElementById("save");
const sizeEl = document.getElementById("size");
const newGridEl = document.getElementById("newGrid");
const eyedropEl = document.getElementById("eyedrop");

let gridSize = parseInt(sizeEl.value, 10);
let isMouseDown = false;
let eraseMode = false;
let lastPainted = null;
const STORAGE_KEY = "pixel-art-state";

// Create grid
function makeGrid(n) {
    gridEl.style.setProperty("--n", n);
    gridEl.innerHTML = "";
    for (let i = 0; i < n * n; i++) {
        const px = document.createElement("div");
        px.className = "pixel";
        px.dataset.i = i;
        gridEl.appendChild(px);
    }
    loadFromStorage();
}

// Paint cell
function paint(cell, color) {
    if (!cell || !cell.classList.contains("pixel")) return;
    cell.style.background = color;
    const state = readState();
    state[cell.dataset.i] = color;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ n: gridSize, state }));
}

// Read from localStorage
function readState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw).state || {} : {};
}

// Load saved art
function loadFromStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const { state } = JSON.parse(raw);
    Object.entries(state).forEach(([i, col]) => {
        const cell = gridEl.querySelector(`.pixel[data-i="${i}"]`);
        if (cell) cell.style.background = col;
    });
}

// Clear grid
function clearGrid() {
    [...gridEl.children].forEach(c => (c.style.background = "#0b0e23"));
    localStorage.removeItem(STORAGE_KEY);
}

// Export PNG
function exportPNG() {
    const canvas = document.createElement("canvas");
    const px = gridEl.querySelector(".pixel");
    const size = parseInt(getComputedStyle(px).width, 10);
    canvas.width = gridSize * size;
    canvas.height = gridSize * size;
    const ctx = canvas.getContext("2d");

    [...gridEl.children].forEach((cell, idx) => {
        const x = (idx % gridSize) * size;
        const y = Math.floor(idx / gridSize) * size;
        ctx.fillStyle = getComputedStyle(cell).backgroundColor;
        ctx.fillRect(x, y, size, size);
    });

    const link = document.createElement("a");
    link.download = "pixel-art.png";
    link.href = canvas.toDataURL();
    link.click();
}

// Eyedropper helper
function rgbToHex(rgb) {
    const [r, g, b] = rgb.match(/\d+/g).map(Number);
    return "#" + [r, g, b].map(n => n.toString(16).padStart(2, "0")).join("");
}

// Handle draw
function handleDraw(e) {
    const target = e.target;
    if (!target.classList.contains("pixel")) return;

    if (eyedropEl.checked) {
        colorEl.value = rgbToHex(getComputedStyle(target).backgroundColor);
        eyedropEl.checked = false;
        return;
    }

    paint(target, eraseMode ? "#0b0e23" : colorEl.value);
    lastPainted = target;
}

// Event listeners
gridEl.addEventListener("mousedown", e => { isMouseDown = true; handleDraw(e); });
gridEl.addEventListener("mousemove", e => { if (isMouseDown) handleDraw(e); });
window.addEventListener("mouseup", () => { isMouseDown = false; lastPainted = null; });

eraserEl.addEventListener("click", () => {
    eraseMode = !eraseMode;
    eraserEl.setAttribute("aria-pressed", eraseMode);
});
clearEl.addEventListener("click", clearGrid);
saveEl.addEventListener("click", exportPNG);
newGridEl.addEventListener("click", () => {
    gridSize = parseInt(sizeEl.value, 10);
    localStorage.removeItem(STORAGE_KEY);
    makeGrid(gridSize);
});

// Init grid
makeGrid(gridSize);
