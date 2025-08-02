export function createHotspot(x, y, onClick) {
    const div = document.createElement('div');
    div.className = 'hotspot';
    div.style.left = `${x - 10}px`;
    div.style.top = `${y - 10}px`;

    // ✨ ADD THIS: Make the main window interactive when the mouse is over the hotspot.
    div.addEventListener('mouseenter', () => {
        window.electronAPI.enableClick();
    });

    // ✨ ADD THIS: Make the main window click-through again when the mouse leaves.
    div.addEventListener('mouseleave', () => {
        window.electronAPI.disableClick();
    });

    // This existing click listener will now work correctly.
    div.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevents the click from affecting other elements
        if (onClick) onClick(e);
    });

    return div;
}