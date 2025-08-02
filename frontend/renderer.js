import { createHotspot } from './components/hotspot.js';
import { addToOverlay, getOverlay } from './components/overlay.js';

console.log("Main overlay window loaded");

// Listen for messages from input window
window.electronAPI.onMainWindowMessage((event, data) => {
    if (data.type === 'create-hotspot') {
        const hotspot = createHotspot(data.coords.x, data.coords.y, (e) => {
            console.log('Hotspot clicked at', e.clientX, e.clientY);
            window.electronAPI.sendClick({ type: 'hotspot', x: e.clientX, y: e.clientY });
        });
        addToOverlay(hotspot);
    }
});

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
