const { app, BrowserWindow, ipcMain, desktopCapturer } = require('electron');
const path = require('path');

let mainWindow; // Main overlay window (click-through)
let inputWindow; // Input window (interactive)

app.disableHardwareAcceleration();

app.whenReady().then(() => {
    console.log('Creating main window (transparent overlay)...');
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

    // mainWindow.webContents.openDevTools({ mode: 'detach' });

    mainWindow.loadFile('index.html');

    // Log when main window is ready to show
    mainWindow.once('ready-to-show', () => {
        console.log('Main window is ready to show');
    });

    // Log when main window has finished loading
    mainWindow.webContents.on('did-finish-load', () => {
        console.log('Main window content loaded successfully');

        // Make main window completely click-through after content is loaded
        mainWindow.setAlwaysOnTop(true, 'screen-saver');
        mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
        mainWindow.setIgnoreMouseEvents(true, { forward: true });
        console.log('Main window set to click-through mode');
    });

    // Log any loading errors
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Main window failed to load:', errorCode, errorDescription);
    });

    // Handle console messages from main window
    mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
        console.log(`Main window console [${level}]: ${message} at ${sourceId}:${line}`);
    });

    // Prevent main window from being focused
    mainWindow.on('focus', () => {
        console.log('Main window focused - blurring immediately');
        mainWindow.blur();
    });

    // Create input window (small, interactive)
    console.log('Creating input window...');
    inputWindow = new BrowserWindow({
        transparent: true,
        frame: false, // Make sure this is false for custom window chrome
        width: 400,
        height: 150,
        x: 100,
        y: 100,
        alwaysOnTop: true,
        skipTaskbar: true,
        focusable: true,
        resizable: false,
        show: false,
        backgroundColor: 'rgba(200, 200, 200, 0.5)',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
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

        // Comment out or remove this line to prevent DevTools from opening automatically
        // inputWindow.webContents.openDevTools({ mode: 'detach' });
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

// Handle enable/disable click events with logging
ipcMain.on('enable-click', () => {
    console.log('Enabling click events on main window');
    if (mainWindow) {
        mainWindow.setIgnoreMouseEvents(false);
        console.log('Main window is now interactive');
    } else {
        console.error('Cannot enable click: main window is not defined');
    }
});

ipcMain.on('disable-click', () => {
    console.log('Disabling click events on main window');
    if (mainWindow) {
        mainWindow.setIgnoreMouseEvents(true, { forward: true });
        console.log('Main window is now click-through');
    } else {
        console.error('Cannot disable click: main window is not defined');
    }
});

// Handle communication from input window to main window
ipcMain.on('send-to-main-window', (event, data) => {
    console.log('Received message for main window:', data);
    if (data.type === 'create-hotspot' && mainWindow) {
        console.log('Forwarding hotspot creation to main window');
        mainWindow.webContents.send('main-window-message', data);
    } else if (!mainWindow) {
        console.error('Cannot send to main window: main window is not defined');
    }
});