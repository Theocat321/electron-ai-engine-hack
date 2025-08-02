// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendToMainWindow: (data) => {
        console.log('Preload: Sending to main window:', data);
        ipcRenderer.send('send-to-main-window', data);
    },
    getScreenshot: () => ipcRenderer.invoke('get-screenshot'),
    hotspotClick: (position) => {
        console.log('Preload: Hotspot click:', position);
        ipcRenderer.send('hotspot-click', position);
    },
    hideHotspot: () => {
        console.log('Preload: Hiding hotspot');
        ipcRenderer.send('hide-hotspot');
    },
    onPositionUpdate: (cb) => {
        console.log('Preload: Setting up position update listener');
        ipcRenderer.on('position-update', (_e, pos) => {
            console.log('Preload: Position update received:', pos);
            cb(pos);
        });
    },
    enableClick: () => {
        console.log('Preload: Enabling click');
        ipcRenderer.send('enable-click');
    },
    disableClick: () => {
        console.log('Preload: Disabling click');
        ipcRenderer.send('disable-click');
    },
    moveHotspot: (pos) => {
        console.log('Preload: Moving hotspot to:', pos);
        ipcRenderer.send('move-hotspot', pos);
    },
    performSystemClick: (coords) => {
        console.log('Preload: Performing system click at:', coords);
        ipcRenderer.send('perform-system-click', coords);
    },
});

console.log('Preload script executed');
