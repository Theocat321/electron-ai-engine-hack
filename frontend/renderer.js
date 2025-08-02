import { addToOverlay, getOverlay } from './components/overlay.js';

console.log("Main overlay window loaded");

// Listen for messages from the input window (this part is fine)
window.electronAPI.onMainWindowMessage((data) => {
    if (data.type === 'create-hotspot') {
        // This is now handled by the main process moving the hotspot window
        console.log('Hotspot creation requested at:', data.coords);
    }
});

// Debug: Log when overlay is ready
console.log('Overlay ready - hotspot window will be managed separately');

// Debug: Check if electronAPI is available
console.log('electronAPI available:', !!window.electronAPI);
if (window.electronAPI) {
    console.log('electronAPI methods:', Object.keys(window.electronAPI));
}
