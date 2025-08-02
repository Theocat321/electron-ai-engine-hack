// main.js
const { app, BrowserWindow, ipcMain, desktopCapturer } = require('electron');
const path = require('path');
const robot = require('robotjs');

let mainWindow, inputWindow, hotspotWindow;


app.disableHardwareAcceleration();

app.whenReady().then(() => {
    // -- Main overlay window --
    mainWindow = new BrowserWindow({
        transparent: true, frame: false, fullscreen: true,
        alwaysOnTop: true, skipTaskbar: true, focusable: false,
        webPreferences: { preload: path.join(__dirname, 'preload.js') }
    });
    mainWindow.loadFile('index.html');
    mainWindow.once('ready-to-show', () => {
        mainWindow.setIgnoreMouseEvents(true, { forward: true });
    });

    // -- Hotspot window --
    hotspotWindow = new BrowserWindow({
        width: 60, height: 60, transparent: true, frame: false,
        alwaysOnTop: true, skipTaskbar: true, focusable: true, show: false,
        webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true }
    });
    hotspotWindow.loadFile(path.join(__dirname, 'hotspot.html'));

    // -- Input window --
    inputWindow = new BrowserWindow({
        width: 400, height: 150, x: 100, y: 100, transparent: true, frame: false,
        alwaysOnTop: true, skipTaskbar: true, focusable: true, show: false,
        backgroundColor: 'rgba(200,200,200,0.5)',
        webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true }
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
    robot.moveMouse(c.x, c.y);
    robot.mouseClick();
});

ipcMain.handle('get-screenshot', async () => {
    const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: { width: 1920, height: 1080 }
    });
    return sources[0].thumbnail.toPNG().toString('base64');
});

ipcMain.on('send-to-main-window', (_, data) => {
    if (data.type === 'create-hotspot') {
        const { x, y } = data.coords;
        hotspotWindow?.setPosition(x - 30, y - 30);
        hotspotWindow?.show();
        hotspotWindow?.webContents.send('position-update', data.coords);
    }
});
