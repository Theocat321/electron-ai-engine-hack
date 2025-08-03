// main.js
const { app, BrowserWindow, ipcMain, desktopCapturer, systemPreferences, screen } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow, inputWindow;

app.whenReady().then(() => {
    // -- Main overlay window --
    mainWindow = new BrowserWindow({
        transparent: true,
        frame: false,
        fullscreen: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        focusable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: false,
            allowRunningInsecureContent: true
        }
    });

    mainWindow.loadFile('index.html');
    mainWindow.once('ready-to-show', () => {
        // Open DevTools in detached mode for debugging the overlay
        mainWindow.webContents.openDevTools({ mode: 'detach' });

        // Start click-through behavior
        mainWindow.setIgnoreMouseEvents(true, { forward: true });
    });

    // -- Input window --
    inputWindow = new BrowserWindow({
        transparent: true,
        frame: false,
        width: 350,
        height: 60,
        x: 50,
        y: 50,
        alwaysOnTop: true,
        skipTaskbar: true,
        focusable: true,
        resizable: false,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false,
            allowRunningInsecureContent: true,
            webviewTag: false
        }
    });

    // Remove CSP header (for testing)
    inputWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': undefined
            }
        });
    });

    inputWindow.loadFile(path.join(__dirname, 'input.html'));
    inputWindow.once('ready-to-show', () => {
        // Open DevTools for the input window too
        inputWindow.webContents.openDevTools({ mode: 'detach' });

        inputWindow.show();
        inputWindow.setAlwaysOnTop(true, 'screen-saver');
        inputWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    });
});

// -- IPC HANDLERS --
ipcMain.on('enable-click', () => mainWindow?.setIgnoreMouseEvents(false));
ipcMain.on('disable-click', () => mainWindow?.setIgnoreMouseEvents(true, { forward: true }));
ipcMain.on('show-hotspot', (_, coords) => {
    console.log('Showing hotspot at coordinates:', coords);
    mainWindow?.webContents.send('show-hotspot', coords);
});
ipcMain.on('hide-hotspot', () => {
    console.log('Hiding hotspot');
    mainWindow?.webContents.send('hide-hotspot');
});
ipcMain.on('perform-system-click', (_, c) => {
    console.log('System click requested at:', c.x, c.y);
    // implement alternative click here
});
ipcMain.on('resize-input-window', (_, { width, height }) => {
    console.log('Resizing input window to:', { width, height });
    if (inputWindow) {
        inputWindow.setSize(width, height);
        // Optionally adjust position to keep window visible
        const bounds = inputWindow.getBounds();
        const display = screen.getPrimaryDisplay();
        const screenWidth = display.workAreaSize.width;
        const screenHeight = display.workAreaSize.height;

        // Keep the window in the same relative position but ensure it's visible
        const newX = Math.min(bounds.x, screenWidth - width);
        const newY = Math.min(bounds.y, screenHeight - height);

        inputWindow.setPosition(newX, newY);
    }
});
ipcMain.on('close-current-window', (event) => {
    console.log('Close window request received');
    const webContents = event.sender;
    const window = BrowserWindow.fromWebContents(webContents);
    if (window) {
        window.close();
    }
});
ipcMain.handle('get-screenshot', async () => {
    console.log('=== SCREENSHOT REQUEST RECEIVED ===');
    try {
        if (process.platform === 'darwin') {
            const status = systemPreferences.getMediaAccessStatus('screen');
            console.log('macOS screen recording permission:', status);
            if (status !== 'granted') {
                await systemPreferences.askForMediaAccess('screen');
            }
        }
        const sources = await desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: { width: 1920, height: 1080 }
        });
        if (!sources.length) return null;
        const png = sources[0].thumbnail.toPNG();
        return png.toString('base64');
    } catch (err) {
        console.error('Error capturing screenshot:', err);
        throw err;
    }
});
ipcMain.on('send-to-main-window', (_, data) => {
    console.log('=== Main window received message ===', data);
    if (data.type === 'create-hotspot') {
        mainWindow?.webContents.send('show-hotspot', data.coords);
    } else if (data.type === 'hide-hotspot') {
        mainWindow?.webContents.send('hide-hotspot');
    } else {
        console.log('Unknown message type:', data.type);
    }
});
