document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('twibbonCanvas');
    const ctx = canvas.getContext('2d');
    const imageInput = document.getElementById('imageInput');
    const zoomSlider = document.getElementById('zoomSlider');
    const downloadBtn = document.getElementById('downloadBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // Default sizes
    canvas.width = 1080;
    canvas.height = 1080;

    let frameImage = new Image();
    let userImage = new Image();
    let userImageLoaded = false;
    let scale = 1;
    let position = { x: 0, y: 0 };
    let isDragging = false;
    let startPos = { x: 0, y: 0 };

    // 1. Load Frame (Simple & Direct)
    // Try bg.png first, then fallback to others
    const frameSrc = './bg.png?v=' + new Date().getTime();

    frameImage.src = frameSrc;

    frameImage.onload = () => {
        console.log("Frame Loaded");
        canvas.width = frameImage.naturalWidth;
        canvas.height = frameImage.naturalHeight;
        loadingOverlay.style.display = 'none';
        draw();
    };

    frameImage.onerror = () => {
        console.warn("Frame failed, trying backups...");
        // Backup 1
        frameImage.src = './Siap Sukseskan_FINAL.png';
        frameImage.onerror = () => {
            // Backup 2
            frameImage.src = './bg.png';
            frameImage.onerror = () => {
                // Give up but allow upload
                loadingOverlay.style.display = 'none';
                alert("Frame tidak ketemu. Tapi Anda tetap bisa upload foto.");
                draw();
            }
        }
    };

    // Force hide overlay after 3s (Safety)
    setTimeout(() => {
        loadingOverlay.style.display = 'none';
    }, 3000);

    // 2. Image Upload
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                userImage = new Image();
                userImage.onload = () => {
                    userImageLoaded = true;
                    // Fit logic
                    const scaleX = canvas.width / userImage.width;
                    const scaleY = canvas.height / userImage.height;
                    scale = Math.max(scaleX, scaleY);
                    position.x = (canvas.width - userImage.width * scale) / 2;
                    position.y = (canvas.height - userImage.height * scale) / 2;

                    // Show controls
                    document.getElementById('instructionOverlay').style.display = 'none';
                    document.getElementById('zoomControl').classList.remove('hidden');
                    document.getElementById('downloadBtn').classList.remove('hidden');

                    draw();
                }
                userImage.src = ev.target.result;
            }
            reader.readAsDataURL(file);
        }
    });

    // 3. Drawing Logic
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // User Image
        if (userImageLoaded) {
            const w = userImage.width * scale * zoomSlider.value;
            const h = userImage.height * scale * zoomSlider.value;
            ctx.drawImage(userImage, position.x, position.y, w, h);
        }

        // Frame
        if (frameImage.complete && frameImage.naturalHeight !== 0) {
            ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
        }
    }

    // 4. Interaction
    zoomSlider.addEventListener('input', draw);

    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'Twibbon.png';
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
    });

    // Drag
    canvas.addEventListener('mousedown', e => { isDragging = true; startPos = { x: e.clientX - position.x, y: e.clientY - position.y }; canvas.style.cursor = 'grabbing'; });
    window.addEventListener('mouseup', () => { isDragging = false; canvas.style.cursor = 'grab'; });
    window.addEventListener('mousemove', e => {
        if (!isDragging || !userImageLoaded) return;
        position.x = e.clientX - startPos.x;
        position.y = e.clientY - startPos.y;
        draw();
    });
    // Touch
    canvas.addEventListener('touchstart', e => { e.preventDefault(); isDragging = true; startPos = { x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y }; }, { passive: false });
    window.addEventListener('touchend', () => isDragging = false);
    window.addEventListener('touchmove', e => {
        if (!isDragging || !userImageLoaded) return;
        e.preventDefault();
        position.x = e.touches[0].clientX - startPos.x;
        position.y = e.touches[0].clientY - startPos.y;
        draw();
    }, { passive: false });
});
