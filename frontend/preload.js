const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    sendToMainWindow: (data) => ipcRenderer.send('send-to-main-window', data),
    getScreenshot: () => ipcRenderer.invoke('get-screenshot'),
    enableClick: () => ipcRenderer.send('enable-click'),
    disableClick: () => ipcRenderer.send('disable-click'),
    hotspotClick: (position) => ipcRenderer.send('hotspot-click', position),
    moveHotspot: (position) => ipcRenderer.send('move-hotspot', position),
    hideHotspot: () => ipcRenderer.send('hide-hotspot'),
    onMainWindowMessage: (callback) => {
        ipcRenderer.on('main-window-message', (event, data) => callback(data));
    },
    onPositionUpdate: (callback) => {
        ipcRenderer.on('position-update', (event, position) => callback(position));
    }
});

// For debugging
console.log('Preload script executed');
