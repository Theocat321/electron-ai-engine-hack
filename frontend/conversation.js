import apiService from './services/api.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Conversation window loaded');

    const nextButton = document.getElementById('next-button');
    const messageText = document.querySelector('.message-text');

    console.log('Elements found:', { nextButton: !!nextButton, messageText: !!messageText });

    // Track session state
    let isSessionActive = false;
    let sessionInitialized = false;

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

    // Function to update button text based on completion status
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

            // Get the instruction from localStorage (set by the input window)
            const instruction = localStorage.getItem('currentInstruction') || "How do I send an email?";
            
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

    // Function to handle button click
    async function handleButtonClick() {
        if (!sessionInitialized) {
            await initializeSession();
        } else if (isSessionActive) {
            await updateScreenshot();
        }
    }

    nextButton.addEventListener('click', () => {
        console.log('=== Button clicked ===');
        handleButtonClick();
    });

    // Initialize UI state
    updateButtonState(false);

    console.log('Event listeners attached');
    console.log('Initial state - electronAPI available:', !!window.electronAPI);
});