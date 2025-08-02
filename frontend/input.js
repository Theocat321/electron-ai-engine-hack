import { createFloatingBox } from './components/floatingBox.js';

console.log("Input window loaded");

// Add some visual debugging
document.body.style.background = 'rgba(255, 0, 0, 0.1)'; // Temporary red tint to see the window

// Create floating box in the input window
const floatingBox = createFloatingBox(async (instruction, outputEl) => {
    if (!instruction) return;
    outputEl.innerText = 'Sending...';

    try {
        const res = await fetch('https://your-backend.com/instructions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ instruction })
        });
        const data = await res.json();
        outputEl.innerText = data.text || 'No response';

        // Send message to main window to create hotspot if needed
        if (data.coords) {
            window.electronAPI.sendToMainWindow({
                type: 'create-hotspot',
                coords: data.coords
            });
        }
    } catch (err) {
        outputEl.innerText = 'Error sending request';
        console.error(err);
    }
}, 400, 150);

// Add floating box to input container
const inputContainer = document.getElementById('input-container');
if (inputContainer) {
    inputContainer.appendChild(floatingBox);
    console.log("FloatingBox added to container successfully");
} else {
    console.error("input-container not found!");
}

// Add test button for hotspot
const testButton = document.createElement('button');
testButton.textContent = 'Test Hotspot';
testButton.style.position = 'absolute';
testButton.style.top = '10px';
testButton.style.right = '10px';
testButton.style.zIndex = '1000';
testButton.addEventListener('click', () => {
    console.log('Test hotspot button clicked');
    // Create a test hotspot at a fixed position
    window.electronAPI.sendToMainWindow({
        type: 'create-hotspot',
        coords: { x: 500, y: 300 }
    });
});
document.body.appendChild(testButton); 