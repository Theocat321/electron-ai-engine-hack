// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Channels for hotspot events
const SHOW_CHANNEL = 'show-hotspot';
const HIDE_CHANNEL = 'hide-hotspot';
const MAIN_MSG_CHANNEL = 'main-window-message';

contextBridge.exposeInMainWorld('electronAPI', {
    // Outgoing messages
    sendToMainWindow: data => {
        console.log('Preload: Sending to main window:', data);
        ipcRenderer.send('send-to-main-window', data);
    },
    getScreenshot: () => ipcRenderer.invoke('get-screenshot'),

    enableClick: () => {
        console.log('Preload: Enabling click');
        ipcRenderer.send('enable-click');
    },
    disableClick: () => {
        console.log('Preload: Disabling click');
        ipcRenderer.send('disable-click');
    },
    hideHotspot: () => {
        console.log('Preload: Hiding hotspot');
        ipcRenderer.send('hide-hotspot');
    },
    performSystemClick: coords => {
        console.log('Preload: Performing system click at:', coords);
        ipcRenderer.send('perform-system-click', coords);
    },
    resizeInputWindow: (width, height) => {
        console.log('Preload: Resizing input window to:', { width, height });
        ipcRenderer.send('resize-input-window', { width, height });
    },

    // Incoming listeners
    onShowHotspot: callback => {
        if (typeof callback === 'function') {
            ipcRenderer.on(SHOW_CHANNEL, (_event, coords) => {
                console.log('Preload: show-hotspot received:', coords);
                callback(coords);
            });
        }
    },
    onHideHotspot: callback => {
        if (typeof callback === 'function') {
            ipcRenderer.on(HIDE_CHANNEL, () => {
                console.log('Preload: hide-hotspot received');
                callback();
            });
        }
    },
    onMainWindowMessage: callback => {
        if (typeof callback === 'function') {
            ipcRenderer.on(MAIN_MSG_CHANNEL, (_event, data) => {
                console.log('Preload: main-window-message received:', data);
                callback(data);
            });
        }
    }
});

console.log('Preload script executed');