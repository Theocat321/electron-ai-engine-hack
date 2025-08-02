import { renderLiquidComponent } from './Indicator.jsx';

const overlay = document.getElementById('overlay');

function renderHotspot(x, y) {
    const div = document.createElement('div');
    div.className = 'hotspot';
    div.style.left = `${x}px`;
    div.style.top = `${y}px`;

    div.addEventListener('mouseenter', () => {
        window.electronAPI.enableClick();
    });

    div.addEventListener('mouseleave', () => {
        window.electronAPI.disableClick();
    });

    div.addEventListener('click', (e) => {
        e.stopPropagation();
        window.electronAPI.sendClick({ type: 'hotspot', x: e.clientX, y: e.clientY });
    });

    overlay.appendChild(div);
}

// Single liquid component on startup
renderLiquidComponent(400, 300, 'large', 'circle');

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
