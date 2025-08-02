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

    const nextButton = document.createElement('button');
    nextButton.className = 'next-button';
    nextButton.textContent = 'Loading...';
    nextButton.disabled = true;
    nextButton.setAttribute('data-no-drag', 'true');

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
        nextButton.textContent = 'Next';
        console.log('Loading state removed');
    }

    // Function to make API request
    async function makeApiRequest() {
        console.log('=== Starting API Request ===');
        try {
            showLoading();
            
            // Capture screenshot and save it
            console.log('Capturing screenshot...');
            const screenshotBase64 = await window.electronAPI.getScreenshot();
            
            // Convert base64 to blob
            const byteCharacters = atob(screenshotBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/png' });
            
            // Create FormData with image and query
            const formData = new FormData();
            formData.append('image_path', blob, 'img.png');
            formData.append('query', instruction);
            
            console.log('Making fetch request to http://localhost:8000/run');
            console.log('Query:', instruction);
            
            const response = await fetch('http://localhost:8000/run', {
                method: 'POST',
                body: formData
            });
            
            console.log('Response received:', { status: response.status, ok: response.ok });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            console.log('Parsing JSON response...');
            const data = await response.json();
            console.log('API Response data:', data);
            
            // Update the message text with the response
            console.log('Updating message text to:', data.text || data.message || 'Request completed');
            messageText.textContent = data.text || data.message || 'Request completed';
            
            // Create hotspot using the coordinates from the response
            console.log('Checking for electronAPI and coords...');
            console.log('window.electronAPI exists:', !!window.electronAPI);
            console.log('data.coords exists:', !!data.coords);
            console.log('data.coords value:', data.coords);
            
            if (window.electronAPI && data.coords) {
                console.log('Sending hotspot creation request to main window...');
                const hotspotData = {
                    type: 'create-hotspot',
                    coords: data.coords,
                    label: data.text || data.message || 'Request completed',
                    action: 'click'
                };
                console.log('Hotspot data being sent:', hotspotData);
                
                window.electronAPI.sendToMainWindow(hotspotData);
                console.log('Hotspot creation request sent successfully');
            } else {
                console.error('Cannot create hotspot - missing electronAPI or coords');
                console.log('electronAPI available:', !!window.electronAPI);
                console.log('coords available:', !!data.coords);
            }
            
        } catch (error) {
            console.error('Error making API request:', error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            
            messageText.textContent = 'Sorry, there was an error processing your request.';
        } finally {
            hideLoading();
            console.log('=== API Request Complete ===');
        }
    }

    // Add click handler to the next button
    nextButton.addEventListener('click', () => {
        console.log('=== Next button clicked ===');
        makeApiRequest();
    });

    messageContainer.appendChild(messageText);
    conversationBox.appendChild(messageContainer);
    conversationBox.appendChild(nextButton);

    container.appendChild(conversationBox);
    
    // Automatically trigger the API request when the interface is created
    console.log('Conversation interface created, triggering initial API request...');
    makeApiRequest();
}
