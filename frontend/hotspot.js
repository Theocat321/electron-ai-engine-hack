console.log('Hotspot window loaded');

// Get the hotspot element
const hotspot = document.getElementById('hotspot');

// Store the current position
let currentPosition = { x: 0, y: 0 };

// Handle hotspot clicks
hotspot.addEventListener('click', (e) => {
    e.stopPropagation();
    console.log('Hotspot clicked at position:', currentPosition);
    
    // Send click event to main process
    if (window.electronAPI && window.electronAPI.hotspotClick) {
        window.electronAPI.hotspotClick(currentPosition);
    }
});

// Handle mousedown for feedback
hotspot.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    console.log('Hotspot mousedown at position:', currentPosition);
});

// Listen for position updates from main process
if (window.electronAPI && window.electronAPI.onPositionUpdate) {
    window.electronAPI.onPositionUpdate((position) => {
        currentPosition = position;
        console.log('Hotspot position updated to:', position);
    });
}

// Log when hotspot is ready
console.log('Hotspot element ready for interaction'); 