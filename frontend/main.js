// main.js
const { log } = require('console');
const { app, BrowserWindow, ipcMain, desktopCapturer } = require('electron');
const path = require('path');
const fs = require('fs');

app.disableHardwareAcceleration();

let mainWindow, inputWindow;

app.disableHardwareAcceleration();

app.whenReady().then(() => {
    // -- Main overlay window --
    mainWindow = new BrowserWindow({
        transparent: true, frame: false, fullscreen: true,
        alwaysOnTop: true, skipTaskbar: true, focusable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: false,
            nodeIntegration: false,
            contextIsolation: true,
            allowRunningInsecureContent: true
        }
    });
    mainWindow.loadFile('index.html');
    mainWindow.once('ready-to-show', () => {
        mainWindow.setIgnoreMouseEvents(true, { forward: true });
    });





    // -- Input window --
    inputWindow = new BrowserWindow({
        transparent: true,
        frame: false, // Make sure this is false for custom window chrome
        width: 300,   // Smaller width
        height: 60,   // Smaller height
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
            allowRunningInsecureContent: true
        }
    });

    // Set custom CSP to allow Google Fonts and Material Icons
    inputWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [
                    "default-src 'self'; " +
                    "script-src 'self'; " +
                    "style-src 'self' https://fonts.googleapis.com; " +
                    "font-src 'self' https://fonts.gstatic.com"
                ]
            }
        });
    });
    inputWindow.loadFile(path.join(__dirname, 'input.html'));
    inputWindow.once('ready-to-show', () => {
        inputWindow.show();
        inputWindow.setAlwaysOnTop(true, 'screen-saver');
        inputWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    });
});

// -- IPC HANDLERS --
ipcMain.on('enable-click', () => mainWindow?.setIgnoreMouseEvents(false));
ipcMain.on('disable-click', () => mainWindow?.setIgnoreMouseEvents(true, { forward: true }));
ipcMain.on('move-hotspot', (_, p) => {
    mainWindow?.webContents.send('show-hotspot', p);
});
ipcMain.on('hide-hotspot', () => mainWindow?.webContents.send('hide-hotspot'));
ipcMain.on('hotspot-click', (_, pos) => console.log('Hotspot clicked at', pos));
ipcMain.on('perform-system-click', (_, c) => {
    robot.moveMouse(c.x, c.y);
    robot.mouseClick();
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

ipcMain.handle('get-screenshot', async () => {
    console.log('=== SCREENSHOT REQUEST RECEIVED ===');

    try {
        // Check if we have screen recording permission on macOS
        if (process.platform === 'darwin') {
            const { systemPreferences } = require('electron');
            const hasPermission = systemPreferences.getMediaAccessStatus('screen');
            console.log('macOS screen recording permission status:', hasPermission);

            if (hasPermission !== 'granted') {
                console.log('Requesting screen recording permission...');
                await systemPreferences.askForMediaAccess('screen');
            }
        }

        console.log('Getting desktop capturer sources...');
        const sources = await desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: { width: 1920, height: 1080 }
        });

        if (sources.length === 0) {
            console.error('No screen sources found');
            return null;
        }
        console.log(`Found ${sources.length} screen sources`);

        console.log('Converting thumbnail to PNG buffer...');
        const pngBuffer = sources[0].thumbnail.toPNG();
        console.log(`PNG buffer created, size: ${pngBuffer.length} bytes`);

        console.log('Converting to base64...');
        const base64Data = pngBuffer.toString('base64');

        console.log(`Screenshot captured: ${base64Data.length} chars`);
        console.log('Returning base64 data from main process...');

        return base64Data;
    } catch (error) {
        console.error('Error capturing screenshot:', error);
        console.error('Error stack:', error.stack);
        throw error;
    }
});

ipcMain.on('send-to-main-window', (_, data) => {
    console.log('=== Main window received message ===');
    console.log('Message data:', data);

    if (data.type === 'create-hotspot') {
        console.log('Creating hotspot...');
        console.log('Coordinates received:', data.coords);

        console.log('Sending hotspot data to main window...');
        mainWindow?.webContents.send('show-hotspot', data.coords);

        console.log('Hotspot creation complete');
    } else {
        console.log('Unknown message type:', data.type);
    }
});

ipcMain.on('renderer-log', (event, message) => {
    console.log('[Renderer]', message);
});


ipcMain.handle('call-backend', async (event, { screenshotBase64, userQuery }) => {
    try {
        const response = await fetch('http://127.0.0.1:8000/initialize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                screenshot_base64: screenshotBase64,
                user_query: userQuery
            })
        });

        if (!response.ok) {
            throw new Error(`Backend error: ${response.status}`);
        }

        return await response.json();
    } catch (err) {
        return { error: err.message };
    }
});
