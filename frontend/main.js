const { app, BrowserWindow, ipcMain, desktopCapturer } = require('electron');
const path = require('path');

let mainWindow;

app.disableHardwareAcceleration();

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        transparent: true,
        frame: false,
        fullscreen: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('index.html');

    // Start in click-through mode
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
});

// Handle screenshot request
ipcMain.handle('get-screenshot', async () => {
    const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: { width: 1920, height: 1080 }
    });
    const screen = sources[0]; // Primary screen
    return screen.thumbnail.toPNG().toString('base64'); // Return base64 image
});

// Handle click logging
ipcMain.on('click-event', (event, coords) => {
    console.log('User clicked at:', coords);

    // Example: send to backend
    fetch('https://your-backend.com/click-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coords)
    }).catch(err => console.error(err));
});

ipcMain.on('enable-click', () => {
    mainWindow.setIgnoreMouseEvents(false);
});

ipcMain.on('disable-click', () => {
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
});