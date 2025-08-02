export function createHotspot(x, y, onClick) {
    const div = document.createElement('div');
    div.className = 'hotspot';
    div.style.left = `${x - 10}px`;
    div.style.top = `${y - 10}px`;

    // Add a slight random delay to each hotspot animation to create staggered effect
    const randomDelay = Math.random() * 2;
    div.style.animationDelay = `${randomDelay}s`;

    div.addEventListener('click', (e) => {
        e.stopPropagation();
        if (onClick) onClick(e);
    });

    return div;
}