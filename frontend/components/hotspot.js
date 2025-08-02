export function createHotspot(x, y, onClick) {
    const div = document.createElement('div');
    div.className = 'hotspot';
    div.style.left = `${x - 10}px`;
    div.style.top = `${y - 10}px`;

    div.addEventListener('click', (e) => {
        e.stopPropagation();
        if (onClick) onClick(e);
    });

    return div;
}