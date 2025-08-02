let overlay = null;

export function getOverlay() {
    if (!overlay) {
        overlay = document.getElementById('overlay');
    }
    return overlay;
}

export function addToOverlay(element) {
    const overlayElement = getOverlay();
    if (overlayElement && element) {
        overlayElement.appendChild(element);
    }
    return element;
}

export function removeFromOverlay(element) {
    const overlayElement = getOverlay();
    if (overlayElement && element && element.parentNode === overlayElement) {
        overlayElement.removeChild(element);
    }
}
