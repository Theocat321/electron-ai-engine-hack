// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendToMainWindow: (data) => {
        console.log('Preload: Sending to main window:', data);
        ipcRenderer.send('send-to-main-window', data);
    },
    getScreenshot: () => ipcRenderer.invoke('get-screenshot'),
    hideHotspot: () => {
        console.log('Preload: Hiding hotspot');
        ipcRenderer.send('hide-hotspot');
    },
    enableClick: () => {
        console.log('Preload: Enabling click');
        ipcRenderer.send('enable-click');
    },
    disableClick: () => {
        console.log('Preload: Disabling click');
        ipcRenderer.send('disable-click');
    },
    performSystemClick: (coords) => {
        console.log('Preload: Performing system click at:', coords);
        ipcRenderer.send('perform-system-click', coords);
    },
    resizeInputWindow: (width, height) => {
        console.log('Preload: Resizing input window to:', { width, height });
        ipcRenderer.send('resize-input-window', { width, height });
    },
    // Expose ipcRenderer for main window hotspot messages
    ipcRenderer: {
        on: (channel, func) => {
            const validChannels = ['show-hotspot', 'hide-hotspot'];
            if (validChannels.includes(channel)) {
                ipcRenderer.on(channel, func);
            }
        },
        removeAllListeners: (channel) => {
            const validChannels = ['show-hotspot', 'hide-hotspot'];
            if (validChannels.includes(channel)) {
                ipcRenderer.removeAllListeners(channel);
            }
        }
    },
    onMainWindowMessage: (callback) => {
        ipcRenderer.on('main-window-message', (_event, data) => callback(data));
    }
});

console.log('Preload script executed');
