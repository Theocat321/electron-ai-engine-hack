export function createFloatingBox(sendCallback, width = 300, height = 50) {
    const box = document.createElement('div');
    box.className = 'floating-box compact';
    box.id = 'input-box';

    // We'll override these with CSS to make it fill the container
    // but keep them here for backwards compatibility
    box.style.width = `${width}px`;
    box.style.height = `${height}px`;

    // Create control buttons container
    const controlButtons = document.createElement('div');
    controlButtons.className = 'control-buttons';
    controlButtons.style.position = 'absolute';
    controlButtons.style.top = '8px';
    controlButtons.style.right = '8px';
    controlButtons.style.display = 'flex';
    controlButtons.style.gap = '5px';
    controlButtons.style.zIndex = '1000';

    const exitIcon = document.createElement('span');
    exitIcon.className = 'material-icons';
    exitIcon.textContent = 'close';

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

    // Create reload button after send button
    const reloadInputButton = document.createElement('button');
    reloadInputButton.className = 'send-icon-button'; // Use same class as send button
    reloadInputButton.setAttribute('data-no-drag', 'true');
    reloadInputButton.title = 'Reset and Reload';

    const reloadInputIcon = document.createElement('span');
    reloadInputIcon.className = 'material-icons';
    reloadInputIcon.textContent = 'refresh';
    reloadInputButton.appendChild(reloadInputIcon);

    // Add reload functionality
    reloadInputButton.addEventListener('click', async () => {
        try {
            await fetch('http://localhost:8000/reset', { method: 'POST' });
            window.location.reload();
        } catch (error) {
            console.error('Error resetting session:', error);
            window.location.reload(); // Reload anyway
        }
    });

    // Add debounce mechanism to prevent multiple rapid clicks
    let isStatusLoading = false;

    // Simple synchronous handler to avoid GLib issues
    const handleStatusClick = () => {
        if (isStatusLoading) return;
        isStatusLoading = true;

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



            } catch (error) {
                console.error('Error fetching status:', error);
                console.error('Error details:', {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                });

            } finally {
                isStatusLoading = false;
            }
        }, 0);
    };

    // Add event listener with proper cleanup

    inputContainer.appendChild(textarea);
    inputContainer.appendChild(button);
    inputContainer.appendChild(reloadInputButton);
    box.appendChild(controlButtons);
    box.appendChild(inputContainer);
    box.appendChild(controlButtons);

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

// Helper function to play TTS audio
function playTTSAudio(audioBase64) {
    if (!audioBase64) {
        console.log('No audio data provided');
        return;
    }

    try {
        console.log('Playing TTS audio...');

        // Convert base64 to blob
        const audioBytes = atob(audioBase64);
        const audioArray = new Uint8Array(audioBytes.length);
        for (let i = 0; i < audioBytes.length; i++) {
            audioArray[i] = audioBytes.charCodeAt(i);
        }

        const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Create and play audio element
        const audio = new Audio(audioUrl);
        audio.play().then(() => {
            console.log('TTS audio started playing');
        }).catch(error => {
            console.error('Error playing TTS audio:', error);
        });

        // Clean up the object URL after playing
        audio.addEventListener('ended', () => {
            URL.revokeObjectURL(audioUrl);
            console.log('TTS audio playback completed');
        });

    } catch (error) {
        console.error('Error creating TTS audio:', error);
    }
}

// Helper function to create the conversation interface
function createConversationInterface(container, instruction) {
    console.log('Creating conversation interface...');

    const conversationBox = document.createElement('div');
    conversationBox.className = 'conversation-box';

    // Create control buttons container for conversation interface
    const controlButtons = document.createElement('div');
    controlButtons.className = 'control-buttons';
    controlButtons.style.position = 'absolute';
    controlButtons.style.top = '8px';
    controlButtons.style.right = '8px';
    controlButtons.style.display = 'flex';
    controlButtons.style.gap = '5px';
    controlButtons.style.zIndex = '1000';

    // Create reload button
    const reloadButton = document.createElement('button');
    reloadButton.className = 'control-button reload-button';
    reloadButton.setAttribute('data-no-drag', 'true');
    reloadButton.title = 'Reload';

    const reloadIcon = document.createElement('span');
    reloadIcon.className = 'material-icons';
    reloadIcon.textContent = 'refresh';
    reloadButton.appendChild(reloadIcon);

    // Add button functionality
    reloadButton.addEventListener('click', async () => {
        try {
            // Hide hotspots before resetting
            if (window.electronAPI && window.electronAPI.sendToMainWindow) {
                window.electronAPI.sendToMainWindow({ type: 'hide-hotspot' });
            }
            await fetch('http://localhost:8000/reset', { method: 'POST' });
            window.location.reload();
        } catch (error) {
            console.error('Error resetting session:', error);
            // Hide hotspots even if reset fails
            if (window.electronAPI && window.electronAPI.sendToMainWindow) {
                window.electronAPI.sendToMainWindow({ type: 'hide-hotspot' });
            }
            window.location.reload(); // Reload anyway
        }
    });



    controlButtons.appendChild(reloadButton);

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

    // Add debounce mechanism to prevent multiple rapid clicks
    let isConversationStatusLoading = false;

    // Simple synchronous handler to avoid GLib issues
    const handleConversationStatusClick = () => {
        if (isConversationStatusLoading) return;
        isConversationStatusLoading = true;

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



            } catch (error) {
                console.error('Error fetching status:', error);
                console.error('Error details:', {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                });

            } finally {
                isConversationStatusLoading = false;
            }
        }, 0);
    };

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

    // Function to show loading state
    function showLoading() {
        console.log('Showing loading state...');
        nextButton.disabled = true;
        nextButton.textContent = 'Loading...';
        messageText.textContent = 'Processing your request...';
        updateWindowSize();
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

            console.log('Response received:', { status: response.status, ok: response.ok });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('Parsing JSON response...');
            const data = await response.json();
            console.log('API Response data:', data);

            // Store the current task data for future use
            window.currentTaskData = data;

            // Update the message text with the task description
            console.log('Updating message text to:', data.task || 'Request completed');
            messageText.textContent = data.task || 'Request completed';

            // Play TTS audio if available
            if (data.audio_base64) {
                console.log('Audio data received, playing TTS...');
                playTTSAudio(data.audio_base64);
            } else {
                console.log('No audio data in response');
            }

            // Update window size after text content changes
            setTimeout(() => {
                updateWindowSize();
            }, 100); // Small delay to ensure text is rendered

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

                // Play completion audio if available
                if (data.audio_base64) {
                    console.log('Playing completion audio...');
                    playTTSAudio(data.audio_base64);
                }

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
            console.error('Error making API request:', error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });

            messageText.textContent = 'Sorry, there was an error processing your request.';

            // Update window size after error message
            setTimeout(() => {
                updateWindowSize();
            }, 100);
        } finally {
            hideLoading();
            console.log('=== API Request Complete ===');
        }
    }

    // Track if this is the first request
    let isFirstRequest = true;

    // Add click handler to the next button
    nextButton.addEventListener('click', () => {
        console.log('=== Next button clicked ===');
        console.log('Is first request:', isFirstRequest);

        // Hide hotspot when Next button is pressed
        console.log('Hiding hotspot before making API request...');
        if (window.electronAPI && window.electronAPI.sendToMainWindow) {
            window.electronAPI.sendToMainWindow({ type: 'hide-hotspot' });
        }

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

    messageContainer.appendChild(messageText);
    conversationBox.appendChild(controlButtons);
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
