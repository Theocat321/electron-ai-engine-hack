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
            
            console.log('Making fetch request to https://ai-hack.free.beeceptor.com/');
            const response = await fetch('https://ai-hack.free.beeceptor.com/');
            
            console.log('Response received:', { status: response.status, ok: response.ok });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            console.log('Parsing JSON response...');
            const data = await response.json();
            console.log('API Response data:', data);
            
            // Update the message text with the response
            console.log('Updating message text to:', data.text);
            messageText.textContent = data.text;
            
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
                    label: data.text,
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
            
            // Fallback to mock data for testing
            console.log('Using fallback mock data...');
            const mockData = {
                text: "Awesome! (Mock Data)",
                coords: { x: 400, y: 400 }
            };
            
            messageText.textContent = mockData.text;
            
            if (window.electronAPI && mockData.coords) {
                console.log('Creating hotspot with mock data...');
                const hotspotData = {
                    type: 'create-hotspot',
                    coords: mockData.coords,
                    label: mockData.text,
                    action: 'click'
                };
                console.log('Mock hotspot data being sent:', hotspotData);
                
                window.electronAPI.sendToMainWindow(hotspotData);
                console.log('Mock hotspot creation request sent successfully');
            }
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
