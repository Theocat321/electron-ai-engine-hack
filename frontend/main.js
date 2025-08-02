const { app, BrowserWindow, ipcMain, desktopCapturer } = require('electron');
const path = require('path');

let mainWindow; // Main overlay window (click-through)
let inputWindow; // Input window (interactive)

app.disableHardwareAcceleration();

app.whenReady().then(() => {
    // Create main overlay window (full screen, click-through)
    mainWindow = new BrowserWindow({
        transparent: true,
        frame: false,
        width: 1920,
        height: 1080,
        x: 0,
        y: 0,
        alwaysOnTop: true,
        skipTaskbar: true,
        focusable: false,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('index.html');

    // Make main window completely click-through
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
    mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    mainWindow.setIgnoreMouseEvents(true, { forward: true });

    // Prevent main window from being focused
    mainWindow.on('focus', () => {
        mainWindow.blur();
    });

    // Create input window (small, interactive)
    console.log('Creating input window...');
    inputWindow = new BrowserWindow({
        transparent: true,
        frame: false,
        width: 400,
        height: 150,
        x: 100,
        y: 100,
        alwaysOnTop: true,
        skipTaskbar: true,
        focusable: true,
        resizable: false,
        show: false,
        backgroundColor: '#ff000080',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // Load the actual input.html file
    inputWindow.loadFile(path.join(__dirname, 'input.html'));

    // Handle loading errors
    inputWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Input window failed to load:', errorCode, errorDescription);
    });

    // Handle console messages from input window
    inputWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
        console.log(`Input window console [${level}]: ${message} at ${sourceId}:${line}`);
    });

    // Show input window after content is loaded
    inputWindow.once('ready-to-show', () => {
        inputWindow.show();
        inputWindow.setAlwaysOnTop(true, 'screen-saver');
        inputWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
        console.log('Input window should be visible now');
    });

    // Handle input window focus
    inputWindow.on('focus', () => {
        // Allow input window to be focused for interaction
        console.log('Input window focused');
    });

    // Debug window visibility
    inputWindow.on('show', () => {
        console.log('Input window shown');
    });
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
});

ipcMain.on('enable-click', () => {
    mainWindow.setIgnoreMouseEvents(false);
});

ipcMain.on('disable-click', () => {
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
});

// Handle communication from input window to main window
ipcMain.on('send-to-main-window', (event, data) => {
    if (data.type === 'create-hotspot' && mainWindow) {
        mainWindow.webContents.send('main-window-message', data);
    }
});