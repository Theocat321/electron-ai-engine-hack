export function createHotspot(x, y, onClick) {
    const div = document.createElement('div');
    div.className = 'hotspot';
    div.style.left = `${x - 10}px`;
    div.style.top = `${y - 10}px`;


    // Store the position for reference
    div.dataset.positionX = x;
    div.dataset.positionY = y;

    // These listeners correctly make the window interactive
    div.addEventListener('mouseenter', () => {
        if (window.electronAPI && window.electronAPI.enableClick) {
            window.electronAPI.enableClick();
        }
    });

    div.addEventListener('mouseleave', () => {
        if (window.electronAPI && window.electronAPI.disableClick) {
            window.electronAPI.disableClick();
        }
    });

    // Your click handler will now work as expected
    div.addEventListener('click', (e) => {
        e.stopPropagation(); // StopPropagation is fine here
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
        // ❌ REMOVE e.stopPropagation() FROM HERE
        console.log('Hotspot mousedown at position:', { x: parseInt(div.dataset.positionX), y: parseInt(div.dataset.positionY) });
    });

    return div;
}