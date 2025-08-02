import { addToOverlay, getOverlay } from './components/overlay.js';

console.log("Main overlay window loaded");

// Hotspot management
let currentHotspot = null;

// Function to create and show hotspot
function showHotspot(coords) {
    console.log('Renderer: Showing hotspot at coords:', coords);
    window.electronAPI.log(`[FloatingBox] at coords: ${JSON.stringify(coords)}`);

    // Remove existing hotspot if any
    if (currentHotspot) {
        currentHotspot.remove();
        currentHotspot = null;
    }

    // Create hotspot element
    const hotspot = document.createElement('div');
    hotspot.className = 'hotspot';
    hotspot.style.cssText = `
        position: absolute;
        left: ${coords.x - 20}px;
        top: ${coords.y - 20}px;
        width: 40px;
        height: 40px;
        background: rgba(255, 0, 0, 0.9);
        border-radius: 50%;
        cursor: pointer;
        border: 3px solid rgba(255, 255, 255, 0.8);
        transition: all 0.2s ease;
        box-shadow: 0 0 15px rgba(255, 0, 0, 0.8), 0 0 30px rgba(255, 0, 0, 0.4);
        animation: pulse 2s infinite;
        z-index: 1000;
    `;

    // Add pulse animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        .hotspot:hover {
            background: rgba(255, 0, 0, 0.9);
            border-color: rgba(255, 255, 255, 0.8);
            transform: scale(1.1);
            box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
        }
        
        .hotspot:active {
            transform: scale(0.95);
        }
    `;
    document.head.appendChild(style);

    // Add click handler
    hotspot.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Hotspot clicked at:', coords);

        // Send click to main process
        if (window.electronAPI && window.electronAPI.hotspotClick) {
            window.electronAPI.hotspotClick(coords);
        }

        // Hide hotspot after click
        hideHotspot();
    });

    // Add to overlay
    const overlay = getOverlay();
    overlay.appendChild(hotspot);
    currentHotspot = hotspot;

    console.log('Hotspot created and added to overlay');
}

// Function to hide hotspot
function hideHotspot() {
    console.log('Hiding hotspot');
    if (currentHotspot) {
        currentHotspot.remove();
        currentHotspot = null;
    }
}

// Listen for hotspot show/hide messages from main process
if (window.electronAPI) {
    window.electronAPI.onShowHotspot((coords) => {
        showHotspot(coords);
    });

    window.electronAPI.onHideHotspot(() => {
        hideHotspot();
    });
}

// Listen for messages from the input window (this part is fine)
window.electronAPI.onMainWindowMessage((data) => {
    if (data.type === 'create-hotspot') {
        // This is now handled by the main process moving the hotspot window
        console.log('Hotspot creation requested at:', data.coords);
    }
});

// Debug: Log when overlay is ready
console.log('Overlay ready - hotspot rendering integrated');

// Debug: Check if electronAPI is available
console.log('electronAPI available:', !!window.electronAPI);
if (window.electronAPI) {
    console.log('electronAPI methods:', Object.keys(window.electronAPI));
}
