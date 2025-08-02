import { createFloatingBox } from './components/floatingBox.js';

console.log("Input window loaded");

// Add some visual debugging
// document.body.style.background = 'rgba(255, 0, 0, 0.1)'; // Temporary red tint to see the window

// Create floating box in the input window
const floatingBox = createFloatingBox(async (instruction) => {
    if (!instruction) return;

    // For demo purposes - in a real app this would send to a backend
    console.log(`Sending instruction: ${instruction}`);

    try {
        // This would normally be a fetch call to your backend
        // For now, we'll just simulate a successful response

        // In a real app, you'd do something like:
        /*
        const res = await fetch('https://your-backend.com/instructions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ instruction })
        });
        const data = await res.json();
        */

        // The conversation interface will be shown via the createConversationInterface 
        // function in floatingBox.js
    } catch (err) {
        console.error('Error sending request:', err);
    }
}, 300, 60);  // Smaller dimensions for compact input

// Add floating box to input container
const inputContainer = document.getElementById('input-container');
if (inputContainer) {
    inputContainer.appendChild(floatingBox);
    console.log("FloatingBox added to container successfully");
} else {
    console.error("input-container not found!");
}

