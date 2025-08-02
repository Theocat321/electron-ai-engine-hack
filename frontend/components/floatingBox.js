export function createFloatingBox(sendCallback, width = 300, height = 50) {
    const box = document.createElement('div');
    box.className = 'floating-box';

    // We'll override these with CSS to make it fill the container
    // but keep them here for backwards compatibility
    box.style.width = `${width}px`;
    box.style.height = `${height}px`;

    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Enter instructions';
    textarea.className = 'floating-box-textarea';
    textarea.setAttribute('data-no-drag', 'true'); // Mark as non-draggable

    const button = document.createElement('button');
    button.innerText = 'Send';
    button.className = 'floating-box-button';
    button.setAttribute('data-no-drag', 'true'); // Mark as non-draggable

    const output = document.createElement('div');
    output.id = 'response-output';
    output.className = 'floating-box-output';

    box.appendChild(textarea);
    box.appendChild(button);
    box.appendChild(output);

    // No need for positioning logic since we'll position with CSS
    // Remove setInitialPosition and the event listener

    // Send button logic
    button.addEventListener('click', () => {
        const value = textarea.value.trim();
        if (sendCallback) sendCallback(value, output);
    });

    // Enable Enter key to submit
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const value = textarea.value.trim();
            if (value && sendCallback) {
                sendCallback(value, output);
            }
        }
    });

    return box;
}
