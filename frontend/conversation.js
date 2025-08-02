document.addEventListener('DOMContentLoaded', () => {
    console.log('Conversation window loaded');

    const nextButton = document.getElementById('next-button');
    const messageText = document.querySelector('.message-text');

    console.log('Elements found:', { nextButton: !!nextButton, messageText: !!messageText });

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

            // Get the instruction from localStorage (set by the input window)
            const instruction = localStorage.getItem('currentInstruction') || "How do I send an email?";

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

            console.log('Making fetch request to http://localhost:8000/initialize');
            console.log('Query:', instruction);

            const response = await fetch('http://localhost:8000/initialize', {
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
            messageText.textContent = 'Sorry, there was an error processing your request.';
        } finally {
            hideLoading();
            console.log('=== API Request Complete ===');
        }
    }

    nextButton.addEventListener('click', () => {
        console.log('=== Next button clicked ===');
        makeApiRequest();
    });

    console.log('Event listeners attached');
    console.log('Initial state - electronAPI available:', !!window.electronAPI);
});