import { addToOverlay, getOverlay } from './components/overlay.js';

console.log("Main overlay window loaded");

let currentHotspot = null;

// Function to create hotspot HTML element
function createHotspotElement(x, y) {
    const hotspot = document.createElement('div');
    hotspot.className = 'hotspot-indicator';
    hotspot.style.cssText = `
        position: absolute;
        left: ${x - 20}px;
        top: ${y - 20}px;
        width: 40px;
        height: 40px;
        background: rgba(255, 0, 0, 0.9);
        border: 3px solid rgba(255, 255, 255, 0.8);
        border-radius: 50%;
        box-shadow: 0 0 15px rgba(255, 0, 0, 0.8), 0 0 30px rgba(255, 0, 0, 0.4);
        animation: hotspotPulse 2s infinite;
        pointer-events: none;
        z-index: 9999;
    `;
    return hotspot;
}

// Add CSS animation for hotspot pulse
const style = document.createElement('style');
style.textContent = `
    @keyframes hotspotPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);

// Listen for hotspot show/hide messages from main process
if (window.electronAPI && window.electronAPI.ipcRenderer) {
    window.electronAPI.ipcRenderer.on('show-hotspot', (event, coords) => {
        console.log('Showing hotspot at:', coords);
        
        // Remove existing hotspot if any
        if (currentHotspot) {
            currentHotspot.remove();
        }
        
        // Create and add new hotspot
        currentHotspot = createHotspotElement(coords.x, coords.y);
        document.body.appendChild(currentHotspot);
    });

    window.electronAPI.ipcRenderer.on('hide-hotspot', () => {
        console.log('Hiding hotspot');
        if (currentHotspot) {
            currentHotspot.remove();
            currentHotspot = null;
        }
    });
}

// Listen for messages from the input window
window.electronAPI.onMainWindowMessage((data) => {
    if (data.type === 'create-hotspot') {
        console.log('Hotspot creation requested at:', data.coords);
        // This will be handled by the IPC messages above
    }
});

console.log('Overlay ready with HTML hotspot rendering');

// Debug: Check if electronAPI is available
console.log('electronAPI available:', !!window.electronAPI);
if (window.electronAPI) {
    console.log('electronAPI methods:', Object.keys(window.electronAPI));
}
