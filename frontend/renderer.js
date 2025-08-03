// renderer.js
import { addToOverlay, getOverlay } from './components/overlay.js';

console.log("Main overlay window loaded");

let currentHotspot = null;

// Function to create modern AI hotspot HTML element
function createHotspotElement(x, y) {
    const hotspot = document.createElement('div');
    hotspot.className = 'ai-hotspot-indicator';

    const innerRing = document.createElement('div');
    innerRing.className = 'ai-hotspot-inner';
    const centerDot = document.createElement('div');
    centerDot.className = 'ai-hotspot-center';
    const ripple = document.createElement('div');
    ripple.className = 'ai-hotspot-ripple';

    hotspot.append(ripple, innerRing, centerDot);

    const size = 60;

    hotspot.style.cssText = `
    position: absolute;
    left: ${x}px;
    top:  ${y}px;
    width: ${size}px;
    height: ${size}px;
    pointer-events: none;
    z-index: 9999;
    animation: aiHotspotFloat 3s ease-in-out infinite;
  `;

    return hotspot;
}

// Inject CSS for the hotspot
const style = document.createElement('style');
// style.textContent = `
//   .ai-hotspot-indicator {
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     filter: drop-shadow(0 0 20px rgba(0, 150, 255, 0.6));
//   }
//   .ai-hotspot-ripple {
//     position: absolute;
//     width: 100%;
//     height: 100%;
//     border: 2px solid rgba(0, 150, 255, 0.4);
//     border-radius: 50%;
//     animation: aiHotspotRipple 2s ease-out infinite;
//   }
//   .ai-hotspot-inner {
//     position: absolute;
//     width: 70%;
//     height: 70%;
//     background: linear-gradient(135deg, rgba(0,150,255,0.3), rgba(100,200,255,0.2));
//     border: 1px solid rgba(0,150,255,0.6);
//     border-radius: 50%;
//     backdrop-filter: blur(2px);
//     animation: aiHotspotGlow 2.5s ease-in-out infinite alternate;
//   }
//   @keyframes aiHotspotFloat {
//     0%,100% { transform: translateY(0); }
//     50%     { transform: translateY(-3px); }
//   }
//   @keyframes aiHotspotRipple {
//     0%   { transform: scale(0.8); opacity:0.8; }
//     50%  { transform: scale(1.1); opacity:0.4; }
//     100% { transform: scale(1.4); opacity:0; }
//   }
//   @keyframes aiHotspotGlow {
//     0% { box-shadow: 0 0 10px rgba(0,150,255,0.4), inset 0 0 10px rgba(0,150,255,0.1); }
//     100% { box-shadow: 0 0 20px rgba(0,150,255,0.6), inset 0 0 15px rgba(0,150,255,0.2); }
//   }
// `;

style.textContent = `
    .ai-hotspot-indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        filter: drop-shadow(0 0 20px rgba(0, 150, 255, 0.6));
    }
    
    .ai-hotspot-ripple {
        position: absolute;
        width: 100%;
        height: 100%;
        border: 2px solid rgba(0, 150, 255, 0.4);
        border-radius: 50%;
        animation: aiHotspotRipple 2s ease-out infinite;
    }
    
    .ai-hotspot-inner {
        position: absolute;
        width: 70%;
        height: 70%;
        background: linear-gradient(135deg, rgba(0, 150, 255, 0.3), rgba(100, 200, 255, 0.2));
        border: 1px solid rgba(0, 150, 255, 0.6);
        border-radius: 50%;
        backdrop-filter: blur(2px);
        animation: aiHotspotGlow 2.5s ease-in-out infinite alternate;
    }

    
    /* Floating animation */
    @keyframes aiHotspotFloat {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-3px); }
    }
    
    /* Ripple expansion animation */
    @keyframes aiHotspotRipple {
        0% { 
            transform: scale(0.8); 
            opacity: 0.8; 
            border-color: rgba(0, 150, 255, 0.6);
        }
        50% { 
            transform: scale(1.1); 
            opacity: 0.4; 
            border-color: rgba(0, 150, 255, 0.3);
        }
        100% { 
            transform: scale(1.4); 
            opacity: 0; 
            border-color: rgba(0, 150, 255, 0.1);
        }
    }
    
    /* Inner ring glow animation */
    @keyframes aiHotspotGlow {
        0% { 
            box-shadow: 
                0 0 10px rgba(0, 150, 255, 0.4),
                inset 0 0 10px rgba(0, 150, 255, 0.1);
        }
        100% { 
            box-shadow: 
                0 0 20px rgba(0, 150, 255, 0.6),
                inset 0 0 15px rgba(0, 150, 255, 0.2);
        }
    }
    
    /* Center dot pulse animation */
    @keyframes aiHotspotPulse {
        0%, 100% { 
            transform: scale(1);
            box-shadow: 
                0 0 8px rgba(0, 191, 255, 0.8),
                inset 0 0 4px rgba(255, 255, 255, 0.3);
        }
        50% { 
            transform: scale(1.2);
            box-shadow: 
                0 0 12px rgba(0, 191, 255, 1),
                inset 0 0 6px rgba(255, 255, 255, 0.5);
        }
    }
`;

document.head.append(style);

console.log('Overlay ready with HTML hotspot rendering');
console.log('electronAPI available:', !!window.electronAPI);
if (window.electronAPI) {
    console.log('electronAPI methods:', Object.keys(window.electronAPI));
}

// Hook up show/hide via the contextBridge API
if (window.electronAPI) {
    window.electronAPI.onShowHotspot(coords => {
        console.log('Overlay: show-hotspot →', coords);
        if (currentHotspot) currentHotspot.remove();
        currentHotspot = createHotspotElement(coords.x, coords.y);
        const overlayEl = getOverlay();
        (overlayEl || document.body).appendChild(currentHotspot);
    });

    window.electronAPI.onHideHotspot(() => {
        console.log('Overlay: hide-hotspot');
        if (currentHotspot) {
            currentHotspot.remove();
            currentHotspot = null;
        }
    });
}
