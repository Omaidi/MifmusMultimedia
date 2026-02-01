const canvas = document.getElementById('twibbonCanvas');
const ctx = canvas.getContext('2d');
const imageInput = document.getElementById('imageInput');
const zoomSlider = document.getElementById('zoomSlider');
const downloadBtn = document.getElementById('downloadBtn');
const zoomControl = document.getElementById('zoomControl');
const instructionOverlay = document.getElementById('instructionOverlay');
const loadingOverlay = document.getElementById('loadingOverlay');
const resetBtn = document.getElementById('resetBtn');

let frameImage = new Image();
let userImage = new Image();
let userImageLoaded = false;

// Configuration
const CANVAS_SIZE = 1080;
let scale = 1;
let position = { x: 0, y: 0 };
let isDragging = false;
let startPos = { x: 0, y: 0 };

// Initialize
function init() {
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    // Load Frame
    loadingOverlay.style.display = 'flex';
    frameImage.crossOrigin = "anonymous";
    // Using the user's uploaded file "Siap Sukseskan.png"
    frameImage.src = './assets/Siap Sukseskan.png';
    frameImage.onload = () => {
        // Process frame to remove blue color
        processFrameTransparency();
    };
    frameImage.onerror = () => {
        // Fallback to original if new one fails
        console.warn("New frame not found, trying default.");
        frameImage.src = './assets/frame.png';
        frameImage.onload = loadDefaultCanvas;
    };
}

function processFrameTransparency() {
    const hiddenCanvas = document.createElement('canvas');
    hiddenCanvas.width = frameImage.width;
    hiddenCanvas.height = frameImage.height;
    const hCtx = hiddenCanvas.getContext('2d');
    hCtx.drawImage(frameImage, 0, 0);

    const imageData = hCtx.getImageData(0, 0, hiddenCanvas.width, hiddenCanvas.height);
    const data = imageData.data;

    // Chroma Key: Remove Blue
    // Logic: Blue > Red + threshold AND Blue > Green + threshold
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Thresholds can be tuned. 
        // If it's a "Blue" screen, B is usually dominant.
        if (b > r + 20 && b > g + 20 && b > 100) {
            data[i + 3] = 0; // Alpha = 0 (Transparent)
        }
    }

    hCtx.putImageData(imageData, 0, 0);

    // Replace frameImage source with processed one
    const processedImage = new Image();
    processedImage.onload = () => {
        frameImage = processedImage;
        loadDefaultCanvas();
        loadingOverlay.style.display = 'none';
        updateCanvas();
    };
    processedImage.src = hiddenCanvas.toDataURL();
}

// Initial draw: Just the frame
function loadDefaultCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw placeholder background if transparent
    ctx.fillStyle = '#f0f0f0'; // Light grey bg for transparency check
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(frameImage, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
}

// Handle Image Upload
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            userImage = new Image();
            userImage.onload = () => {
                userImageLoaded = true;
                resetPosition();
                updateCanvas();
                showControls();
            };
            userImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

function resetPosition() {
    scale = 1;
    zoomSlider.value = 1;

    // Center the image initially logic could be improved to 'cover'
    // For now, center based on aspect ratio
    const ratio = Math.min(CANVAS_SIZE / userImage.width, CANVAS_SIZE / userImage.height);
    // Actually, let's start with scale 1 as user might want to zoom out
    // Better UX: Start 'fitted' cover

    let scaleEffect = Math.max(CANVAS_SIZE / userImage.width, CANVAS_SIZE / userImage.height);
    scale = scaleEffect; // base scale
    zoomSlider.value = 1; // slider represents multiplier of base scale? Or just raw scale?
    // Let's make slider relative multiplier: 0.5x to 3x of the "cover" scale

    // Reset position to center
    position.x = (CANVAS_SIZE - userImage.width * scale) / 2;
    position.y = (CANVAS_SIZE - userImage.height * scale) / 2;
}

function showControls() {
    instructionOverlay.style.display = 'none';
    zoomControl.classList.remove('hidden');
    downloadBtn.classList.remove('hidden');
    resetBtn.classList.remove('hidden');

    // Remove dashed border looks better
    document.querySelector('.canvas-container').style.border = 'none';
}

function updateCanvas() {
    if (!userImageLoaded) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw User Image
    // Apply transformations
    // We need to pivot zoom around center? or just simple scaling top-left
    // Simple scaling is easier for MVP. 

    // Helper to calculate current dimensions
    const currentWidth = userImage.width * scale * zoomSlider.value;
    const currentHeight = userImage.height * scale * zoomSlider.value;

    // Draw
    ctx.drawImage(userImage, position.x, position.y, currentWidth, currentHeight);

    // 2. Draw Frame on top
    ctx.drawImage(frameImage, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
}

// Zoom Control
zoomSlider.addEventListener('input', () => {
    // Optional: Zoom towards center logic could be added here
    // For now simple redraw
    updateCanvas();
});

// Dragging Logic
// Mouse
canvas.addEventListener('mousedown', startDrag);
window.addEventListener('mouseup', stopDrag);
window.addEventListener('mousemove', drag);

// Touch
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // prevent scrolling
    startDrag(e.touches[0]);
}, { passive: false });
window.addEventListener('touchend', stopDrag);
window.addEventListener('touchmove', (e) => {
    e.preventDefault();
    drag(e.touches[0]);
}, { passive: false });

function startDrag(e) {
    if (!userImageLoaded) return;
    isDragging = true;
    startPos.x = e.clientX - position.x;
    startPos.y = e.clientY - position.y;
    canvas.style.cursor = 'grabbing';
}

function stopDrag() {
    isDragging = false;
    canvas.style.cursor = 'grab';
}

function drag(e) {
    if (!isDragging) return;
    position.x = e.clientX - startPos.x;
    position.y = e.clientY - startPos.y;
    updateCanvas();
}

// Download
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'Twibbon-Haflah-Miftahul-Mustarsyidin.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});

// Reset
resetBtn.addEventListener('click', () => {
    resetPosition();
    updateCanvas();
});

// Initialize app
init();
