// main.js
const { app, BrowserWindow, ipcMain, desktopCapturer } = require('electron');
const path = require('path');
// const robot = require('robotjs'); // Temporarily disabled

let mainWindow, inputWindow, hotspotWindow;


app.disableHardwareAcceleration();

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
    hotspotWindow.loadFile(path.join(__dirname, 'hotspot.html'));

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
    hotspotWindow?.setPosition(p.x - 30, p.y - 30);
    hotspotWindow?.show();
    hotspotWindow?.webContents.send('position-update', p);
});
ipcMain.on('hide-hotspot', () => hotspotWindow?.hide());
ipcMain.on('hotspot-click', (_, pos) => console.log('Hotspot clicked at', pos));
ipcMain.on('perform-system-click', (_, c) => {
    // robot.moveMouse(c.x, c.y);
    // robot.mouseClick();
    console.log('Would click at:', c.x, c.y);
});

ipcMain.handle('get-screenshot', async () => {
    const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: { width: 1920, height: 1080 }
    });
    return sources[0].thumbnail.toPNG().toString('base64');
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
        
        console.log('Showing hotspot window...');
        hotspotWindow?.show();
        
        console.log('Sending position update to hotspot window...');
        hotspotWindow?.webContents.send('position-update', data.coords);
        
        console.log('Hotspot creation complete');
    } else {
        console.log('Unknown message type:', data.type);
    }
});
