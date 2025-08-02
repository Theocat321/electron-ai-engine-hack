import { createHotspot } from './components/hotspot.js';
import { addToOverlay, getOverlay } from './components/overlay.js';
import { createFloatingBox } from './components/floatingBox.js';

console.log("Renderer loaded");

// Add floating box
const floatingBox = createFloatingBox(async (instruction, outputEl) => {
    if (!instruction) return;
    outputEl.innerText = 'Sending...';

    try {
        const res = await fetch('https://your-backend.com/instructions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ instruction })
        });
        const data = await res.json();
        outputEl.innerText = data.text || 'No response';

        if (data.coords) {
            const hotspot = createHotspot(data.coords.x, data.coords.y, (e) => {
                console.log('Hotspot clicked at', e.clientX, e.clientY);
                window.electronAPI.sendClick({ type: 'hotspot', x: e.clientX, y: e.clientY });
            });
            addToOverlay(hotspot);
        }
    } catch (err) {
        outputEl.innerText = 'Error sending request';
        console.error(err);
    }
});

document.body.appendChild(floatingBox);

// Add test hotspots
const hotspot1 = createHotspot(300, 400, (e) => console.log('Hotspot 1', e.clientX, e.clientY));
const hotspot2 = createHotspot(600, 500, (e) => console.log('Hotspot 2', e.clientX, e.clientY));
addToOverlay(hotspot1);
addToOverlay(hotspot2);

// Global click logging
getOverlay().addEventListener('click', (e) => {
    const coords = { type: 'click', x: e.clientX, y: e.clientY };
    console.log('Screen click:', coords);
    window.electronAPI.sendClick(coords);
});
