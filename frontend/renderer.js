import { createHotspot } from './components/hotspot.js';
import { addToOverlay, getOverlay } from './components/overlay.js';

console.log("Main overlay window loaded");

// Listen for messages from the input window (this part is fine)
window.electronAPI.onMainWindowMessage((data) => {
    if (data.type === 'create-hotspot') {
        const hotspot = createHotspot(data.coords.x, data.coords.y, (e) => {
            // This callback now works correctly
            console.log('Hotspot clicked at', e.clientX, e.clientY);
            window.electronAPI.sendClick({ type: 'hotspot', x: e.clientX, y: e.clientY });
        });
        addToOverlay(hotspot);
    }
});

const hotspot1 = createHotspot(300, 400, (e) => {
    console.log('Hotspot 1 clicked at:', { x: e.clientX, y: e.clientY });
});
const hotspot2 = createHotspot(600, 500, (e) => {
    console.log('Hotspot 2 clicked at:', { x: e.clientX, y: e.clientY });
});

addToOverlay(hotspot1);
addToOverlay(hotspot2);
