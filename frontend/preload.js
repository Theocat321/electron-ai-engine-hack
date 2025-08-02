const { contextBridge, ipcRenderer } = require('electron');

// Expose IPC functions to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    sendToMainWindow: (data) => ipcRenderer.send('send-to-main-window', data),
    getScreenshot: () => ipcRenderer.invoke('get-screenshot')
});

// For debugging
console.log('Preload script executed');
