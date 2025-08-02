const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getScreenshot: () => ipcRenderer.invoke('get-screenshot'),
    sendClick: (coords) => ipcRenderer.send('click-event', coords),
    enableClick: () => ipcRenderer.send('enable-click'),
    disableClick: () => ipcRenderer.send('disable-click'),
    sendToMainWindow: (data) => ipcRenderer.send('send-to-main-window', data),
    onMainWindowMessage: (callback) => ipcRenderer.on('main-window-message', callback)
});
