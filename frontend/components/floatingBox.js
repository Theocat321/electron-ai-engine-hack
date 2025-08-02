export function createFloatingBox(sendCallback, width = 300, height = 50) {
    const box = document.createElement('div');
    box.className = 'floating-box';
    box.style.width = `${width}px`;
    box.style.height = `${height}px`;

    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Enter instructions';

    const button = document.createElement('button');
    button.innerText = 'Send';

    const output = document.createElement('div');
    output.id = 'response-output';

    box.appendChild(textarea);
    box.appendChild(button);
    box.appendChild(output);

    // Drag logic
    let isDragging = false, offsetX, offsetY;

    box.addEventListener('mousedown', (e) => {
        if (e.target === textarea || e.target === button) return;
        isDragging = true;
        offsetX = e.clientX - box.offsetLeft;
        offsetY = e.clientY - box.offsetTop;
        box.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        box.style.left = `${e.clientX - offsetX}px`;
        box.style.top = `${e.clientY - offsetY}px`;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        box.style.cursor = 'grab';
    });

    // Send button logic
    button.addEventListener('click', () => {
        const value = textarea.value.trim();
        if (sendCallback) sendCallback(value, output);
    });

    return box;
}
