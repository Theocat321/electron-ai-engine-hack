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

    // Add Status button
    const statusButton = document.createElement('button');
    statusButton.className = 'status-button';
    statusButton.textContent = 'Status';
    statusButton.setAttribute('data-no-drag', 'true');
    
    // Add debounce mechanism to prevent multiple rapid clicks
    let isStatusLoading = false;
    
    // Simple synchronous handler to avoid GLib issues
    const handleStatusClick = () => {
        if (isStatusLoading) return;
        isStatusLoading = true;
        statusButton.disabled = true;
        statusButton.textContent = 'Loading...';
        
        // Use setTimeout to defer the async operation
        setTimeout(async () => {
            try {
                console.log('Fetching status from backend...');
                console.log('About to fetch from:', 'http://localhost:8000/status');
                console.log('Window location:', window.location.href);
                
                const response = await fetch('http://localhost:8000/status');
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Status response:', data);
                
                // Log status instead of alert to avoid potential GLib issues
                console.log('=== STATUS ===');
                console.log(`Status: ${data.status}`);
                if (data.current_task) {
                    console.log(`Current Task: ${data.current_task}`);
                    if (data.coordinates && Array.isArray(data.coordinates)) {
                        console.log(`Coordinates: [${data.coordinates.join(', ')}]`);
                    }
                    console.log(`Task History Count: ${data.task_history_count || 0}`);
                }
                console.log('=== END STATUS ===');
                
                // Update button text to show success
                statusButton.textContent = 'Success!';
                setTimeout(() => {
                    statusButton.textContent = 'Status';
                }, 1000);
                
            } catch (error) {
                console.error('Error fetching status:', error);
                console.error('Error details:', {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                });
                statusButton.textContent = `Error: ${error.message}`;
                setTimeout(() => {
                    statusButton.textContent = 'Status';
                }, 3000);
            } finally {
                isStatusLoading = false;
                statusButton.disabled = false;
            }
        }, 0);
    };
    
    // Add event listener with proper cleanup
    statusButton.addEventListener('click', handleStatusClick);

    inputContainer.appendChild(textarea);
    inputContainer.appendChild(button);
    inputContainer.appendChild(statusButton);
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

    // Add Status button to conversation interface
    const conversationStatusButton = document.createElement('button');
    conversationStatusButton.className = 'status-button';
    conversationStatusButton.textContent = 'Status';
    conversationStatusButton.setAttribute('data-no-drag', 'true');
    
    // Add debounce mechanism to prevent multiple rapid clicks
    let isConversationStatusLoading = false;
    
    // Simple synchronous handler to avoid GLib issues
    const handleConversationStatusClick = () => {
        if (isConversationStatusLoading) return;
        isConversationStatusLoading = true;
        conversationStatusButton.disabled = true;
        conversationStatusButton.textContent = 'Loading...';
        
        // Use setTimeout to defer the async operation
        setTimeout(async () => {
            try {
                console.log('Fetching status from backend...');
                console.log('About to fetch from:', 'http://localhost:8000/status');
                console.log('Window location:', window.location.href);
                
                const response = await fetch('http://localhost:8000/status');
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Status response:', data);
                
                // Log status instead of alert to avoid potential GLib issues
                console.log('=== STATUS ===');
                console.log(`Status: ${data.status}`);
                if (data.current_task) {
                    console.log(`Current Task: ${data.current_task}`);
                    if (data.coordinates && Array.isArray(data.coordinates)) {
                        console.log(`Coordinates: [${data.coordinates.join(', ')}]`);
                    }
                    console.log(`Task History Count: ${data.task_history_count || 0}`);
                }
                console.log('=== END STATUS ===');
                
                // Update button text to show success
                conversationStatusButton.textContent = 'Success!';
                setTimeout(() => {
                    conversationStatusButton.textContent = 'Status';
                }, 1000);
                
            } catch (error) {
                console.error('Error fetching status:', error);
                console.error('Error details:', {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                });
                conversationStatusButton.textContent = `Error: ${error.message}`;
                setTimeout(() => {
                    conversationStatusButton.textContent = 'Status';
                }, 3000);
            } finally {
                isConversationStatusLoading = false;
                conversationStatusButton.disabled = false;
            }
        }, 0);
    };
    
    // Add event listener with proper cleanup
    conversationStatusButton.addEventListener('click', handleConversationStatusClick);

    // Function to calculate and update window size based on content
    function updateWindowSize() {
        // Calculate the required height based on the content
        const messageHeight = messageText.scrollHeight;
        const buttonHeight = 50; // Approximate button height
        const padding = 60; // Total padding (30px top + 30px bottom)
        const minHeight = 120; // Minimum window height
        const minWidth = 350; // Increased width to accommodate two buttons

        const requiredHeight = Math.max(minHeight, messageHeight + buttonHeight + padding);

        console.log('Updating window size:', {
            messageHeight,
            buttonHeight,
            padding,
            requiredHeight
        });

        // Send resize request to main process
        if (window.electronAPI && window.electronAPI.resizeInputWindow) {
            window.electronAPI.resizeInputWindow(minWidth, requiredHeight);
        }
    }

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

    setTimeout(() => {
        updateWindowSize();
    }, 100);

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

    // Function to make API request
    async function makeApiRequest(isInitial = true) {
        console.log('=== Starting API Request ===');
        console.log('Is initial request:', isInitial);
        try {
            showLoading();

            // Capture screenshot and save it
            console.log('Capturing screenshot...');
            const screenshotBase64 = await window.electronAPI.getScreenshot();

            let endpoint, requestBody;
            
            if (isInitial) {
                // First request - use initialize endpoint
                endpoint = 'http://localhost:8000/initialize';
                requestBody = {
                    user_query: instruction,
                    screenshot_base64: screenshotBase64
                };
            } else {
                // Subsequent requests - use update_screenshot endpoint
                endpoint = 'http://localhost:8000/update_screenshot';
                requestBody = {
                    screenshot_base64: screenshotBase64
                };
            }

            console.log(`Making fetch request to ${endpoint}`);
            if (isInitial) {
                console.log('Query:', instruction);
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)

            });

            if (data.error) {
                throw new Error(data.error);
            }

            console.log('Parsing JSON response...');
            const data = await response.json();
            console.log('API Response data:', data);

            // Store the current task data for future use
            window.currentTaskData = data;

            // Update the message text with the task description
            console.log('Updating message text to:', data.task_description || data.task || 'Request completed');
            messageText.textContent = data.task_description || data.task || 'Request completed';


            if (window.electronAPI && data.x !== undefined && data.y !== undefined) {
                window.electronAPI.log('[FloatingBox] Sending hotspot to main process...');
                window.electronAPI.sendToMainWindow({

            // Create hotspot using the coordinates from the response
            console.log('Checking for electronAPI and coordinates...');
            console.log('window.electronAPI exists:', !!window.electronAPI);
            console.log('data.x and data.y exist:', !!data.x, !!data.y);
            console.log('Coordinates:', { x: data.x, y: data.y });

            if (window.electronAPI && data.x !== undefined && data.y !== undefined) {
                console.log('Sending hotspot creation request to main window...');
                const hotspotData = {
                    type: 'create-hotspot',
                    coords: { x: data.x, y: data.y },
                    label: data.task || 'Click here',
                    action: 'click'
                };
                console.log('Hotspot data being sent:', hotspotData);

                window.electronAPI.sendToMainWindow(hotspotData);
                console.log('Hotspot creation request sent successfully');
            } else {
                console.error('Cannot create hotspot - missing electronAPI or coordinates');
                console.log('electronAPI available:', !!window.electronAPI);
                console.log('coordinates available:', data.x !== undefined && data.y !== undefined);
            }

            // Check if task is completed
            if (data.is_completed) {
                messageText.textContent = 'All tasks completed successfully!';
                nextButton.textContent = 'Start New Task';
                nextButton.disabled = false;
                
                // Reset the session when clicking after completion
                nextButton.onclick = async () => {
                    try {
                        await fetch('http://localhost:8000/reset', { method: 'POST' });
                        // Reload the input interface
                        window.location.reload();
                    } catch (error) {
                        console.error('Error resetting session:', error);
                    }
                };

            }
        } catch (error) {
            window.electronAPI.log(`[FloatingBox] Error: ${error.message}`);
            window.electronAPI.log(`Stacktrace: ${error.stack}`);
            messageText.textContent = 'Error processing request.';

        } finally {
            hideLoading();
        }
    }

    // Track if this is the first request
    let isFirstRequest = true;
    
    // Add click handler to the next button
    nextButton.addEventListener('click', () => {
        console.log('=== Next button clicked ===');
        console.log('Is first request:', isFirstRequest);
        
        // Only call update_screenshot after the initial request
        makeApiRequest(isFirstRequest);
        
        // After first request, all subsequent requests should use update_screenshot
        if (isFirstRequest) {
            isFirstRequest = false;
        }
    });

    // Create button container for side-by-side layout
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '10px';
    buttonContainer.style.justifyContent = 'center';

    buttonContainer.appendChild(nextButton);
    buttonContainer.appendChild(conversationStatusButton);

    messageContainer.appendChild(messageText);
    conversationBox.appendChild(messageContainer);
    conversationBox.appendChild(buttonContainer);

    container.appendChild(conversationBox);

    // Initial window size adjustment
    setTimeout(() => {
        updateWindowSize();
    }, 100);

    // Automatically trigger the API request when the interface is created
    console.log('Conversation interface created, triggering initial API request...');
    makeApiRequest(true);  // true for initial request

}
