document.addEventListener('DOMContentLoaded', () => {
    console.log('Conversation window loaded');

    const nextButton = document.getElementById('next-button');
    const messageText = document.querySelector('.message-text');

    console.log('Elements found:', { nextButton: !!nextButton, messageText: !!messageText });

    // Create control buttons container
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

    // Create exit button
    const exitButton = document.createElement('button');
    exitButton.className = 'control-button exit-button';
    exitButton.setAttribute('data-no-drag', 'true');
    exitButton.title = 'Close';

    const exitIcon = document.createElement('span');
    exitIcon.className = 'material-icons';
    exitIcon.textContent = 'close';
    exitButton.appendChild(exitIcon);

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

    exitButton.addEventListener('click', () => {
        // Hide hotspots before closing
        if (window.electronAPI && window.electronAPI.sendToMainWindow) {
            window.electronAPI.sendToMainWindow({ type: 'hide-hotspot' });
        }
        if (window.electronAPI && window.electronAPI.closeWindow) {
            window.electronAPI.closeWindow();
        } else {
            window.close();
        }
    });

    controlButtons.appendChild(reloadButton);
    controlButtons.appendChild(exitButton);

    // Add control buttons to the body
    document.body.appendChild(controlButtons);

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

    nextButton.addEventListener('click', () => {
        console.log('=== Next button clicked ===');
        makeApiRequest();
    });

    console.log('Event listeners attached');
    console.log('Initial state - electronAPI available:', !!window.electronAPI);
});