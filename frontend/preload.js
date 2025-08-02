const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getScreenshot: () => ipcRenderer.invoke('get-screenshot'),
    sendClick: (coords) => ipcRenderer.send('click-event', coords),
    enableClick: () => ipcRenderer.send('enable-click'),
    disableClick: () => ipcRenderer.send('disable-click')
});
