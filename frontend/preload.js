// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendToMainWindow: (data) => ipcRenderer.send('send-to-main-window', data),
    getScreenshot: () => ipcRenderer.invoke('get-screenshot'),
    hotspotClick: (position) => ipcRenderer.send('hotspot-click', position),
    hideHotspot: () => ipcRenderer.send('hide-hotspot'),
    onPositionUpdate: (cb) => ipcRenderer.on('position-update', (_e, pos) => cb(pos)),
    enableClick: () => ipcRenderer.send('enable-click'),
    disableClick: () => ipcRenderer.send('disable-click'),
    moveHotspot: (pos) => ipcRenderer.send('move-hotspot', pos),
    performSystemClick: (coords) => ipcRenderer.send('perform-system-click', coords),
});

console.log('Preload script executed');
