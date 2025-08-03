// main.js
const { app, BrowserWindow, ipcMain, desktopCapturer, systemPreferences, screen } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow, inputWindow, hotspotWindow;


app.whenReady().then(() => {
    // -- Main overlay window --
    mainWindow = new BrowserWindow({
        transparent: true, frame: false, fullscreen: true,
        alwaysOnTop: true, skipTaskbar: true, focusable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: false,
            allowRunningInsecureContent: true
        }
    });
    mainWindow.loadFile('index.html');
    mainWindow.once('ready-to-show', () => {
        mainWindow.setIgnoreMouseEvents(true, { forward: true });
    });



    // -- Hotspot window --
    hotspotWindow = new BrowserWindow({
        width: 60, height: 60, transparent: true, frame: false,
        alwaysOnTop: true, skipTaskbar: true, focusable: true, show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            webSecurity: false,
            allowRunningInsecureContent: true
        }
    });
    
    // macOS-specific configuration for transparent windows
    hotspotWindow.setBackgroundColor('#00000000'); // Fully transparent
    hotspotWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    
    // Set window level for macOS to ensure it stays on top
    if (process.platform === 'darwin') {
        hotspotWindow.setWindowButtonVisibility(false);
        hotspotWindow.setAlwaysOnTop(true, 'floating');
    }
    
    hotspotWindow.loadFile(path.join(__dirname, 'hotspot.html'));

    // -- Input window --
    inputWindow = new BrowserWindow({
        transparent: true,
        frame: false, // Make sure this is false for custom window chrome
        width: 350,   // Increased width for Status button
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
            allowRunningInsecureContent: true,
            webviewTag: false
        }
    });

    // Remove CSP restrictions completely for testing
    inputWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                // Remove Content-Security-Policy header completely
                'Content-Security-Policy': undefined
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
    if (!hotspotWindow) return;
    
    hotspotWindow.setPosition(p.x - 30, p.y - 30);
    
    // Ensure window is visible on macOS
    if (process.platform === 'darwin') {
        hotspotWindow.setAlwaysOnTop(true, 'floating');
    }
    
    hotspotWindow.show();
    hotspotWindow.focus(); // Force focus to ensure visibility
    hotspotWindow.webContents.send('position-update', p);
});
ipcMain.on('hide-hotspot', () => hotspotWindow?.hide());
ipcMain.on('hotspot-click', (_, pos) => console.log('Hotspot clicked at', pos));
ipcMain.on('perform-system-click', (_, c) => {
    console.log('System click requested at:', c.x, c.y);
    // robotjs removed - implement alternative click mechanism if needed
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
        console.log('Hotspot window exists:', !!hotspotWindow);
        console.log('Coordinates received:', data.coords);

        const { x, y } = data.coords;
        const windowX = x - 30;
        const windowY = y - 30;

        console.log('Setting hotspot window position to:', { x: windowX, y: windowY });
        hotspotWindow?.setPosition(windowX, windowY);

        // Ensure window is visible on macOS
        if (process.platform === 'darwin') {
            hotspotWindow?.setAlwaysOnTop(true, 'floating');
        }
        
        console.log('Showing hotspot window...');
        hotspotWindow?.show();
        hotspotWindow?.focus(); // Force focus to ensure visibility

        console.log('Sending position update to hotspot window...');
        hotspotWindow?.webContents.send('position-update', data.coords);

        console.log('Hotspot creation complete');
    } else {
        console.log('Unknown message type:', data.type);
    }
});
