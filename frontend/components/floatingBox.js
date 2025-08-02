export function createFloatingBox(sendCallback, width = 300, height = 50) {
    const box = document.createElement('div');
    box.className = 'floating-box';
    box.id = 'input-box';

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

    box.appendChild(textarea);
    box.appendChild(button);

    // No need for output element anymore

    // Send button logic
    button.addEventListener('click', () => {
        const value = textarea.value.trim();
        if (value && sendCallback) {
            // Call the callback with the input value
            sendCallback(value);

            // Create and display the conversation element
            const container = document.getElementById('input-container');
            if (container) {
                // Remove the input box
                box.remove();

                // Create conversation interface
                createConversationInterface(container);
            }
        }
    });

    // Enable Enter key to submit
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const value = textarea.value.trim();
            if (value && sendCallback) {
                // Call the callback with the input value
                sendCallback(value);

                // Create and display the conversation element
                const container = document.getElementById('input-container');
                if (container) {
                    // Remove the input box
                    box.remove();

                    // Create conversation interface
                    createConversationInterface(container);
                }
            }
        }
    });

    return box;
}

// Helper function to create the conversation interface
function createConversationInterface(container) {
    const conversationBox = document.createElement('div');
    conversationBox.className = 'conversation-box';

    const messageContainer = document.createElement('div');
    messageContainer.className = 'message-container';

    const messageText = document.createElement('p');
    messageText.className = 'message-text';
    messageText.textContent = 'First, click on the Gmail icon in your navbar';

    const nextButton = document.createElement('button');
    nextButton.className = 'next-button';
    nextButton.textContent = 'Next';
    nextButton.setAttribute('data-no-drag', 'true');

    // Add click handler to the next button
    nextButton.addEventListener('click', () => {
        console.log('Next button clicked');

        // Here you would typically fetch the next step from your backend
        // For now, just update the message
        messageText.textContent = 'Now, click on "Compose" to start a new email';

        // You could also send a message to the main window to create hotspots
        if (window.electronAPI) {
            window.electronAPI.sendToMainWindow({
                type: 'create-hotspot',
                coords: { x: 500, y: 300 },
                label: 'Click "Compose"',
                action: 'click'
            });
        }
    });

    messageContainer.appendChild(messageText);
    conversationBox.appendChild(messageContainer);
    conversationBox.appendChild(nextButton);

    container.appendChild(conversationBox);
}
