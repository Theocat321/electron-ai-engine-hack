export function getOverlay() {
    return document.getElementById('overlay');
}

export function addToOverlay(element) {
    const overlay = getOverlay();
    if (overlay) overlay.appendChild(element);
}
