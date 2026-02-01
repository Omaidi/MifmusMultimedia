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
// Configuration
let currentScale = 1;
let scale = 1;
let position = { x: 0, y: 0 };
let isDragging = false;
let startPos = { x: 0, y: 0 };

// Initialize
function init() {
    // Canvas size will be set after frame loads

    // Load Frame
    loadingOverlay.style.display = 'flex';
    // Removed crossOrigin = "anonymous" to prevent tainted canvas issues with local/relative images
    // frameImage.crossOrigin = "anonymous"; 
    // Using the final image with new QR code
    // Using the simplified background name with Cache Buster to force reload
    frameImage.src = './bg.png?v=2';
    frameImage.onload = () => {
        // Direct load - No complex processing
        finishLoadingFrame();
    };

    // Aggressive Timeout: 3 seconds max
    setTimeout(() => {
        if (loadingOverlay.style.display !== 'none') {
            loadingOverlay.style.display = 'none';
            // Alert user if legacy cache is suspected or file missing
            console.log("Forcing load due to timeout.");
            // If checking fails, we just let the canvas be (it might show nothing but at least UI is usable)
        }
    }, 3000);

    frameImage.onerror = () => {
        console.error("BG.png not found.");
        // Try fallback to old names just in case user didn't upload new one yet
        frameImage.src = './bg.png?v=2';
        frameImage.onerror = () => {
            // Fallback to original if new one fails
            console.warn("New frame not found, trying default.");
            frameImage.src = './frame.png';
            frameImage.onload = () => {
                loadDefaultCanvas();
                loadingOverlay.style.display = 'none';
            };
            // Add another error handler for the fallback
            frameImage.onerror = () => {
                loadingOverlay.style.display = 'none';
                alert("ERROR: File 'bg.png' tidak ditemukan di GitHub! Mohon upload file tersebut.");
            }
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
            // Set canvas to match frame resolution EXACTLY
            canvas.width = frameImage.naturalWidth;
            canvas.height = frameImage.naturalHeight;

            loadDefaultCanvas();
            loadingOverlay.style.display = 'none';
            updateCanvas();
        };
        try {
            processedImage.src = hiddenCanvas.toDataURL();
        } catch (e) {
            console.error("Canvas tainted or error:", e);
            // Fallback: If processing fails (e.g. CORS), just use original
            frameImage.onload = null; // Prevent recursion
            loadDefaultCanvas();
            loadingOverlay.style.display = 'none';
        }
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

        // Fit user image to canvas
        let scaleEffect = Math.max(canvas.width / userImage.width, canvas.height / userImage.height);
        scale = scaleEffect;

        // Reset position to center
        position.x = (canvas.width - userImage.width * scale) / 2;
        position.y = (canvas.height - userImage.height * scale) / 2;
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
        ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
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
        // Use maximum quality for PNG (though PNG is lossless, sometimes browser implementation varies)
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
    });

    // Reset
    resetBtn.addEventListener('click', () => {
        resetPosition();
        updateCanvas();
    });

    // Initialize app
    init();
