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
    onShowHotspot: (cb) => {
        console.log('Preload: Setting up show hotspot listener');
        ipcRenderer.on('show-hotspot', (_e, coords) => {
            console.log('Preload: Show hotspot received:', coords);
            cb(coords);
        });
    },
    onHideHotspot: (cb) => {
        console.log('Preload: Setting up hide hotspot listener');
        ipcRenderer.on('hide-hotspot', () => {
            console.log('Preload: Hide hotspot received');
            cb();
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
    resizeInputWindow: (width, height) => {
        console.log('Preload: Resizing input window to:', { width, height });
        ipcRenderer.send('resize-input-window', { width, height });
    },
    performSystemClick: (coords) => {
        console.log('Preload: Performing system click at:', coords);
        ipcRenderer.send('perform-system-click', coords);
    },
    log: (message) => ipcRenderer.send('renderer-log', message),
    callBackend: (data) => ipcRenderer.invoke('call-backend', data),

});

console.log('Preload script executed');
