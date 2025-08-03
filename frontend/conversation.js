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

    nextButton.addEventListener('click', () => {
        console.log('=== Next button clicked ===');
        makeApiRequest();
    });

    console.log('Event listeners attached');
    console.log('Initial state - electronAPI available:', !!window.electronAPI);
});