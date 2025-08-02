const overlay = document.getElementById('overlay');

// Example: Render hotspot dynamically
function renderHotspot(x, y) {
    const div = document.createElement('div');
    div.className = 'hotspot';
    div.style.left = `${x}px`;
    div.style.top = `${y}px`;

    // When hovering over hotspot, disable click-through so it can capture click
    div.addEventListener('mouseenter', () => {
        window.electronAPI.sendClick({ type: 'hover', x, y });
    });

    // When clicking hotspot, log the click
    div.addEventListener('click', (e) => {
        e.stopPropagation(); // Avoid event bubbling
        const coords = { type: 'click', x: e.clientX, y: e.clientY };
        console.log('Hotspot click at', coords);
        window.electronAPI.sendClick(coords);
    });

    overlay.appendChild(div);
}

// Example hotspot
renderHotspot(300, 400);
renderHotspot(600, 500);

// Capture all click events anywhere
overlay.addEventListener('click', (e) => {
    const coords = { type: 'click', x: e.clientX, y: e.clientY };
    console.log('Screen click at', coords);
    window.electronAPI.sendClick(coords);
});

// Example: Send screenshot to backend
async function sendScreenshot() {
    const imgBase64 = await window.electronAPI.getScreenshot();
    await fetch('https://your-backend.com/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imgBase64 })
    });
}

// Call screenshot periodically or on demand
// sendScreenshot();
