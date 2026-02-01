document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const canvas = document.getElementById('twibbonCanvas');
    const ctx = canvas.getContext('2d');
    const imageInput = document.getElementById('imageInput');
    const zoomSlider = document.getElementById('zoomSlider');
    const downloadBtn = document.getElementById('downloadBtn');
    const zoomControl = document.getElementById('zoomControl');
    const instructionOverlay = document.getElementById('instructionOverlay');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const resetBtn = document.getElementById('resetBtn');

    // State Variables
    let frameImage = new Image();
    let userImage = new Image();
    let frameLoaded = false;
    let userImageLoaded = false;

    // Transform State
    let scale = 1;
    let position = { x: 0, y: 0 };
    let isDragging = false;
    let startPos = { x: 0, y: 0 };

    // --- Core Logic ---

    // 1. Initialize & Frame Loading
    function init() {
        console.log("App Initializing...");

        // List of candidates to try loading
        const candidates = [
            './bg.png?v=' + new Date().getTime(), // Force new cache
            './bg.png',
            './Siap Sukseskan_FINAL.png',
            './Siap Sukseskan.png',
            './assets/frame.png',
            './frame.png'
        ];

        loadFrameRecursive(candidates, 0);
    }

    function loadFrameRecursive(list, index) {
        if (index >= list.length) {
            console.error("All frame candidates failed.");
            // Even if frame fails, we allow user to use the app (white background)
            loadingOverlay.style.display = 'none';
            alert("Warning: Frame gambar tidak ditemukan. Anda masih bisa mengupload foto, tapi frame tidak akan muncul.");
            frameLoaded = false;
            // Set default canvas size
            canvas.width = 1080;
            canvas.height = 1080;
            loadDefaultCanvas();
            return;
        }

        const src = list[index];
        console.log(`Attempting to load frame: ${src}`);

        const img = new Image();
        // Removed crossOrigin to avoid CORS issues with local files or diff domains

        img.onload = () => {
            console.log("Frame loaded successfully!");
            frameImage = img;
            frameLoaded = true;

            // Set canvas size to match frame
            canvas.width = img.naturalWidth || 1080;
            canvas.height = img.naturalHeight || 1080;

            loadingOverlay.style.display = 'none';
            loadDefaultCanvas();
            if (userImageLoaded) updateCanvas();
        };

        img.onerror = () => {
            console.warn(`Failed: ${src}`);
            loadFrameRecursive(list, index + 1);
        };

        img.src = src;
    }

    // Safety Timeout: Force hide overlay after 4 seconds no matter what
    setTimeout(() => {
        if (loadingOverlay.style.display !== 'none') {
            console.warn("Loading timeout reached. Forcing UI unlock.");
            loadingOverlay.style.display = 'none';
            if (!frameLoaded) {
                // If frame stuck, set defaults
                canvas.width = 1080;
                canvas.height = 1080;
            }
        }
    }, 4000);

    // 2. Canvas Drawing
    function loadDefaultCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background (CHECKERBOARD for transparency)
        // or just white/transparent
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (frameLoaded) {
            ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
        } else {
            // Draw placeholder text
            ctx.fillStyle = '#ccc';
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.fillText("Frame Missing", canvas.width / 2, canvas.height / 2);
        }
    }

    function updateCanvas() {
        if (!userImageLoaded) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // A. Draw User Image
        const currentWidth = userImage.width * scale * zoomSlider.value;
        const currentHeight = userImage.height * scale * zoomSlider.value;

        // Center pivot
        const centerX = position.x + (currentWidth / 2);
        const centerY = position.y + (currentHeight / 2);

        // We draw purely based on top-left position logic for simplicity
        ctx.drawImage(userImage, position.x, position.y, currentWidth, currentHeight);

        // B. Draw Frame (Overlay)
        if (frameLoaded) {
            ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
        }
    }

    // 3. User Interaction - Image Upload
    imageInput.addEventListener('change', handleImageUpload);

    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        console.log("User selected image:", file.name);
        loadingOverlay.style.display = 'none'; // Force hide overlay just in case

        const reader = new FileReader();
        reader.onload = (event) => {
            userImage = new Image();
            userImage.onload = () => {
                console.log("User image loaded.");
                userImageLoaded = true;
                resetLayout();
                showControls();
                updateCanvas();
            };
            userImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    function resetLayout() {
        scale = 1;
        zoomSlider.value = 1;

        // Fit logic: Cover or Contain? usually 'Contain' inside the hole is better, 
        // but 'Cover' screen is easier. Let's try to fit roughly.
        const scaleX = canvas.width / userImage.width;
        const scaleY = canvas.height / userImage.height;
        // Start slightly larger to fill holes
        scale = Math.max(scaleX, scaleY);

        // Center it
        position.x = (canvas.width - userImage.width * scale) / 2;
        position.y = (canvas.height - userImage.height * scale) / 2;
    }

    function showControls() {
        instructionOverlay.style.display = 'none';
        zoomControl.classList.remove('hidden');
        downloadBtn.classList.remove('hidden');
        resetBtn.classList.remove('hidden');
    }

    // 4. Dragging Logic
    // Mouse
    canvas.addEventListener('mousedown', startDrag);
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('mousemove', drag);
    // Touch
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDrag(e.touches[0]); }, { passive: false });
    window.addEventListener('touchend', stopDrag);
    window.addEventListener('touchmove', (e) => { e.preventDefault(); drag(e.touches[0]); }, { passive: false });

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

    // 5. Controls
    zoomSlider.addEventListener('input', updateCanvas);

    resetBtn.addEventListener('click', () => {
        resetLayout();
        updateCanvas();
    });

    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'Twibbon-Result.png';
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
    });

    // Run!
    init();
});
