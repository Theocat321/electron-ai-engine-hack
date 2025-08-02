export function createFloatingBox(sendCallback, width = 300, height = 50) {
    const box = document.createElement('div');
    box.className = 'floating-box compact';
    box.id = 'input-box';

    // We'll override these with CSS to make it fill the container
    // but keep them here for backwards compatibility
    box.style.width = `${width}px`;
    box.style.height = `${height}px`;

    const inputContainer = document.createElement('div');
    inputContainer.className = 'input-container';

    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Ask me anything...';
    textarea.className = 'floating-box-textarea';
    textarea.setAttribute('data-no-drag', 'true'); // Mark as non-draggable
    textarea.rows = 1; // Keep it to a single line

    const button = document.createElement('button');
    button.className = 'send-icon-button';
    button.setAttribute('data-no-drag', 'true'); // Mark as non-draggable

    const sendIcon = document.createElement('span');
    sendIcon.className = 'material-icons';
    sendIcon.textContent = 'send';

    button.appendChild(sendIcon);
    inputContainer.appendChild(textarea);
    inputContainer.appendChild(button);
    box.appendChild(inputContainer);

    // No need for output element anymore

    // Send button logic
    button.addEventListener('click', () => {
        const value = textarea.value.trim();
        if (value && sendCallback) {
            // Call the callback with the input value
            sendCallback(value);

            // Store the instruction for the conversation interface
            localStorage.setItem('currentInstruction', value);

            // Create and display the conversation element
            const container = document.getElementById('input-container');
            if (container) {
                // Remove the input box
                box.remove();

                // Create conversation interface with the instruction
                createConversationInterface(container, value);
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

                // Store the instruction for the conversation interface
                localStorage.setItem('currentInstruction', value);

                // Create and display the conversation element
                const container = document.getElementById('input-container');
                if (container) {
                    // Remove the input box
                    box.remove();

                    // Create conversation interface with the instruction
                    createConversationInterface(container, value);
                }
            }
        }
    });

    return box;
}

// Helper function to create the conversation interface
function createConversationInterface(container, instruction) {
    console.log('Creating conversation interface...');
    
    const conversationBox = document.createElement('div');
    conversationBox.className = 'conversation-box';

    const messageContainer = document.createElement('div');
    messageContainer.className = 'message-container';

    const messageText = document.createElement('p');
    messageText.className = 'message-text';
    messageText.textContent = 'Processing your request...';

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '10px';
    buttonContainer.style.justifyContent = 'center';

    const nextButton = document.createElement('button');
    nextButton.className = 'next-button';
    nextButton.textContent = 'Start';
    nextButton.disabled = false;
    nextButton.setAttribute('data-no-drag', 'true');

    const resetButton = document.createElement('button');
    resetButton.className = 'reset-button';
    resetButton.textContent = 'Reset';
    resetButton.setAttribute('data-no-drag', 'true');
    resetButton.style.background = '#f44336';
    resetButton.style.color = 'white';

    const statusButton = document.createElement('button');
    statusButton.className = 'status-button';
    statusButton.textContent = 'Status';
    statusButton.setAttribute('data-no-drag', 'true');
    statusButton.style.background = '#2196F3';
    statusButton.style.color = 'white';

    // Track session state
    let sessionInitialized = false;
    let isSessionActive = false;

    // Function to show loading state
    function showLoading() {
        console.log('Showing loading state...');
        nextButton.disabled = true;
        nextButton.textContent = 'Loading...';
        messageText.textContent = 'Processing your request...';
        console.log('Loading state applied');
    }

    // Function to hide loading state
    function hideLoading() {
        console.log('Hiding loading state...');
        nextButton.disabled = false;
        nextButton.textContent = sessionInitialized ? 'Next' : 'Start';
        console.log('Loading state removed');
    }

    // Function to update button state based on completion status
    function updateButtonState(isCompleted) {
        if (isCompleted) {
            nextButton.textContent = 'Task Complete';
            nextButton.disabled = true;
            nextButton.style.background = '#4CAF50';
        } else {
            nextButton.textContent = sessionInitialized ? 'Next' : 'Start';
            nextButton.disabled = false;
            nextButton.style.background = '';
        }
    }

    // Function to initialize session
    async function initializeSession() {
        console.log('=== Initializing Session ===');
        try {
            showLoading();
            
            // Import API service dynamically to avoid module loading issues
            const { default: apiService } = await import('../services/api.js');
            
            // Capture screenshot
            console.log('Capturing screenshot...');
            const screenshotBase64 = await window.electronAPI.getScreenshot();
            
            console.log('Calling /initialize endpoint...');
            console.log('Query:', instruction);
            
            const data = await apiService.initialize(instruction, screenshotBase64);
            console.log('Initialize response:', data);

            // Update UI with first task
            messageText.textContent = data.task || 'Task received';
            sessionInitialized = true;
            isSessionActive = true;

            // Create hotspot using coordinates from response
            if (window.electronAPI && (data.x !== undefined && data.y !== undefined)) {
                console.log('Creating hotspot at coordinates:', { x: data.x, y: data.y });
                const hotspotData = {
                    type: 'create-hotspot',
                    coords: { x: data.x, y: data.y },
                    label: data.task || 'Click here',
                    action: 'click'
                };
                console.log('Hotspot data being sent:', hotspotData);

                window.electronAPI.sendToMainWindow(hotspotData);
                console.log('Hotspot creation request sent successfully');
            }

            // Update button state
            updateButtonState(data.is_completed || false);

        } catch (error) {
            console.error('Error initializing session:', error);
            messageText.textContent = 'Sorry, there was an error starting the session.';
            sessionInitialized = false;
            isSessionActive = false;
        } finally {
            hideLoading();
            console.log('=== Session Initialization Complete ===');
        }
    }

    // Function to update screenshot and get next task
    async function updateScreenshot() {
        console.log('=== Updating Screenshot ===');
        try {
            showLoading();
            
            // Import API service dynamically
            const { default: apiService } = await import('../services/api.js');
            
            // Capture new screenshot
            console.log('Capturing screenshot...');
            const screenshotBase64 = await window.electronAPI.getScreenshot();
            
            console.log('Calling /update_screenshot endpoint...');
            const data = await apiService.updateScreenshot(screenshotBase64);
            console.log('Update response:', data);

            // Update UI with next task
            messageText.textContent = data.task || 'Task received';

            // Create hotspot using coordinates from response
            if (window.electronAPI && (data.x !== undefined && data.y !== undefined)) {
                console.log('Creating hotspot at coordinates:', { x: data.x, y: data.y });
                const hotspotData = {
                    type: 'create-hotspot',
                    coords: { x: data.x, y: data.y },
                    label: data.task || 'Click here',
                    action: 'click'
                };
                console.log('Hotspot data being sent:', hotspotData);

                window.electronAPI.sendToMainWindow(hotspotData);
                console.log('Hotspot creation request sent successfully');
            }

            // Update button state
            updateButtonState(data.is_completed || false);

        } catch (error) {
            console.error('Error updating screenshot:', error);
            messageText.textContent = 'Sorry, there was an error processing the next step.';
        } finally {
            hideLoading();
            console.log('=== Screenshot Update Complete ===');
        }
    }

    // Function to get session status
    async function getStatus() {
        console.log('=== Getting Status ===');
        try {
            // Import API service dynamically
            const { default: apiService } = await import('../services/api.js');
            
            const status = await apiService.getStatus();
            console.log('Status response:', status);
            
            if (status.status === 'No active session') {
                messageText.textContent = 'No active session';
                sessionInitialized = false;
                isSessionActive = false;
            } else {
                messageText.textContent = `Active: ${status.current_task || 'No current task'}`;
                sessionInitialized = true;
                isSessionActive = true;
            }
            updateButtonState(false);
        } catch (error) {
            console.error('Error getting status:', error);
            messageText.textContent = 'Error getting status';
        }
    }

    // Function to reset session
    async function resetSession() {
        console.log('=== Resetting Session ===');
        try {
            // Import API service dynamically
            const { default: apiService } = await import('../services/api.js');
            
            const result = await apiService.reset();
            console.log('Reset response:', result);
            
            messageText.textContent = result.message || 'Session reset successfully';
            sessionInitialized = false;
            isSessionActive = false;
            updateButtonState(false);
            
            // Hide hotspot
            if (window.electronAPI) {
                window.electronAPI.sendToMainWindow({ type: 'hide-hotspot' });
            }
        } catch (error) {
            console.error('Error resetting session:', error);
            messageText.textContent = 'Error resetting session';
        }
    }

    // Function to handle next button click
    async function handleNextClick() {
        if (!sessionInitialized) {
            await initializeSession();
        } else if (isSessionActive) {
            await updateScreenshot();
        }
    }

    // Add event listeners
    nextButton.addEventListener('click', () => {
        console.log('=== Next button clicked ===');
        handleNextClick();
    });

    resetButton.addEventListener('click', () => {
        console.log('=== Reset button clicked ===');
        resetSession();
    });

    statusButton.addEventListener('click', () => {
        console.log('=== Status button clicked ===');
        getStatus();
    });

    // Build UI
    buttonContainer.appendChild(nextButton);
    buttonContainer.appendChild(resetButton);
    buttonContainer.appendChild(statusButton);
    
    messageContainer.appendChild(messageText);
    conversationBox.appendChild(messageContainer);
    conversationBox.appendChild(buttonContainer);

    container.appendChild(conversationBox);
}
