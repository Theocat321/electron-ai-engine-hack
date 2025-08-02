document.addEventListener('DOMContentLoaded', () => {
    console.log('Conversation window loaded');

    const nextButton = document.getElementById('next-button');
    const messageText = document.querySelector('.message-text');

    nextButton.addEventListener('click', () => {
        console.log('Next button clicked');

        // Here you would typically fetch the next step from your backend
        // For now, just simulate a response
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
});