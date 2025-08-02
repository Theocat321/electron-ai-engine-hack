export function createFloatingBox(sendCallback, width = 300, height = 50) {
    const box = document.createElement('div');
    box.className = 'floating-box compact';
    box.id = 'input-box';

    box.style.width = `${width}px`;
    box.style.height = `${height}px`;

    const inputContainer = document.createElement('div');
    inputContainer.className = 'input-container';

    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Ask me anything...';
    textarea.className = 'floating-box-textarea';
    textarea.setAttribute('data-no-drag', 'true');
    textarea.rows = 1;

    const button = document.createElement('button');
    button.className = 'send-icon-button';
    button.setAttribute('data-no-drag', 'true');

    const sendIcon = document.createElement('span');
    sendIcon.className = 'material-icons';
    sendIcon.textContent = 'send';

    button.appendChild(sendIcon);
    inputContainer.appendChild(textarea);
    inputContainer.appendChild(button);
    box.appendChild(inputContainer);

    // Submit logic
    const handleSubmit = () => {
        const value = textarea.value.trim();
        if (value && sendCallback) {
            window.electronAPI.log(`[FloatingBox] Submitting instruction: ${value}`);
            sendCallback(value);
            localStorage.setItem('currentInstruction', value);

            const container = document.getElementById('input-container');
            if (container) {
                box.remove();
                createConversationInterface(container, value);
            }
        }
    };

    button.addEventListener('click', handleSubmit);

    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    });

    return box;
}

// Helper function
function createConversationInterface(container, instruction) {
    window.electronAPI.log(`[FloatingBox] Creating conversation interface for: ${instruction}`);

    const conversationBox = document.createElement('div');
    conversationBox.className = 'conversation-box';

    const messageContainer = document.createElement('div');
    messageContainer.className = 'message-container';

    const messageText = document.createElement('p');
    messageText.className = 'message-text';
    messageText.textContent = 'Processing your request...';

    const nextButton = document.createElement('button');
    nextButton.className = 'next-button';
    nextButton.textContent = 'Loading...';
    nextButton.disabled = true;
    nextButton.setAttribute('data-no-drag', 'true');

    messageContainer.appendChild(messageText);
    conversationBox.appendChild(messageContainer);
    conversationBox.appendChild(nextButton);
    container.appendChild(conversationBox);

    // State functions
    const showLoading = () => {
        nextButton.disabled = true;
        nextButton.textContent = 'Loading...';
        messageText.textContent = 'Processing your request...';
        window.electronAPI.log('[FloatingBox] Loading state applied');
    };

    const hideLoading = () => {
        nextButton.disabled = false;
        nextButton.textContent = 'Next';
        window.electronAPI.log('[FloatingBox] Loading state removed');
    };

    // API request logic
    async function makeApiRequest() {
        window.electronAPI.log('[FloatingBox] Starting API request...');
        try {
            showLoading();

            if (!window.electronAPI || !window.electronAPI.getScreenshot) {
                throw new Error('electronAPI.getScreenshot not available');
            }

            const screenshotBase64 = await window.electronAPI.getScreenshot();
            window.electronAPI.log('[FloatingBox] Screenshot captured, sending to backend via IPC...');

            const data = await window.electronAPI.callBackend({
                screenshotBase64,
                userQuery: instruction
            });

            if (data.error) {
                throw new Error(data.error);
            }

            window.electronAPI.log(`[FloatingBox] Response data: ${JSON.stringify(data)}`);
            messageText.textContent = data.task_description || 'Request completed';

            if (window.electronAPI && data.x !== undefined && data.y !== undefined) {
                window.electronAPI.log('[FloatingBox] Sending hotspot to main process...');
                window.electronAPI.sendToMainWindow({

                    type: 'create-hotspot',
                    coords: { x: data.x, y: data.y },
                    label: data.task_description || 'Request completed',
                    action: 'click'
                });
            }
        } catch (error) {
            window.electronAPI.log(`[FloatingBox] Error: ${error.message}`);
            window.electronAPI.log(`Stacktrace: ${error.stack}`);
            messageText.textContent = 'Error processing request.';

        } finally {
            hideLoading();
        }
    }

    nextButton.addEventListener('click', makeApiRequest);
    makeApiRequest(); // auto trigger
}
