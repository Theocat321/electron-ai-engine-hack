const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    sendToMainWindow: (data) => ipcRenderer.send('send-to-main-window', data),
    getScreenshot: () => ipcRenderer.invoke('get-screenshot'),
    enableClick: () => ipcRenderer.send('enable-click'),
    disableClick: () => ipcRenderer.send('disable-click'),
    onMainWindowMessage: (callback) => {
        ipcRenderer.on('main-window-message', (event, data) => callback(data));
    }
});

// For debugging
console.log('Preload script executed');
