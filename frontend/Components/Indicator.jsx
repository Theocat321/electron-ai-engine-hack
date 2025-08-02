/**
 * Liquid Component Indicator
 * Renders a liquid-style component with specified parameters
 */

/**
 * Renders a liquid-style component with specified parameters
 * @param {number} x - X coordinate for center position
 * @param {number} y - Y coordinate for center position
 * @param {string} size - Size: 'small', 'medium', 'large', 'xlarge', or custom dimensions like '100px'
 * @param {string} shape - Shape: 'circle', 'square', 'triangle', 'hexagon', 'star'
 * @param {Object} options - Additional options like onClick handler
 */
export function renderLiquidComponent(x, y, size = 'medium', shape = 'circle', options = {}) {
    const overlay = document.getElementById('overlay');
    const div = document.createElement('div');
    div.className = 'liquid-component';

    // Set position
    div.style.left = `${x}px`;
    div.style.top = `${y}px`;

    // Set size
    if (['small', 'medium', 'large', 'xlarge'].includes(size)) {
        div.classList.add(size);
    } else {
        // Custom size
        div.style.width = size;
        div.style.height = size;
    }

    // Set shape
    div.classList.add(shape);

    // Add event listeners
    div.addEventListener('mouseenter', () => {
        window.electronAPI.enableClick();
    });

    div.addEventListener('mouseleave', () => {
        window.electronAPI.disableClick();
    });

    div.addEventListener('click', (e) => {
        e.stopPropagation();
        const coords = { type: 'liquid-component', x: e.clientX, y: e.clientY, shape, size };
        console.log('Liquid component clicked at', coords);
        window.electronAPI.sendClick(coords);

        // Call custom onClick if provided
        if (options.onClick) {
            options.onClick(e, coords);
        }
    });

    overlay.appendChild(div);
    return div;
}

/**
 * Creates a default indicator at the center of the screen
 */
export function createDefaultIndicator() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    return renderLiquidComponent(centerX, centerY, 'large', 'circle');
}

/**
 * Creates multiple indicators in a pattern
 */
export function createIndicatorPattern() {
    const indicators = [];

    // Create a pattern of indicators
    const positions = [
        { x: 200, y: 200, size: 'medium', shape: 'circle' },
        { x: 400, y: 300, size: 'large', shape: 'square' },
        { x: 600, y: 400, size: 'small', shape: 'triangle' },
        { x: 800, y: 500, size: 'xlarge', shape: 'hexagon' },
        { x: 1000, y: 600, size: 'large', shape: 'star' }
    ];

    positions.forEach(pos => {
        const indicator = renderLiquidComponent(pos.x, pos.y, pos.size, pos.shape);
        indicators.push(indicator);
    });

    return indicators;
} 