export function createHotspot(x, y, onClick) {
    const div = document.createElement('div');
    div.className = 'hotspot';
    div.style.left = `${x - 10}px`;
    div.style.top = `${y - 10}px`;
    
    // Store the position for reference
    div.dataset.positionX = x;
    div.dataset.positionY = y;

    // Handle clicks on the hotspot
    div.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevents the click from affecting other elements
        const position = { x: parseInt(div.dataset.positionX), y: parseInt(div.dataset.positionY) };
        console.log('Hotspot clicked at position:', position);
        
        // Send to main process
        if (window.electronAPI && window.electronAPI.hotspotClick) {
            window.electronAPI.hotspotClick(position);
        }
        
        if (onClick) onClick(e);
    });

    // Handle mousedown for additional feedback
    div.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        console.log('Hotspot mousedown at position:', { x: parseInt(div.dataset.positionX), y: parseInt(div.dataset.positionY) });
    });

    return div;
}