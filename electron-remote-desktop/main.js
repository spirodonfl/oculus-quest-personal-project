const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.allowRendererProcessReuse = false;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow () {
    // Create the browser window.
    win = new BrowserWindow({
        width: 1280,
        height: 1020,
        webPreferences: {
            preload: path.join(app.getAppPath(), 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
            backgroundThrottling: false
        }
    });

    win.once('show', () => {});
    win.once('ready-to-show', () => {
        console.log('yep');
        win.show();
    });

    // and load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Open the DevTools.
    win.webContents.openDevTools();

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });

    /**
     * NOTE: Alternate way to send image!
    this.win.loadURL('https://github.com');
    this.win.webContents.setFrameRate(15);
    this.win.webContents.on('paint', (event, dirty, image) => {
        this.last_paint = image.toJPEG(65);
        this.sendToClient('frame',this.last_paint);

    });
    this.win.webContents.on('did-fail-load', () =>this.sendToClient('did-fail-load'));
    this.win.webContents.on('did-start-loading', () =>this.sendToClient('did-start-loading'));
    this.win.webContents.on('did-stop-loading', () =>this.sendToClient('did-stop-loading')&&this.resetScrollBar());
    this.win.webContents.on('did-navigate', (event,url) =>this.sendToClient('did-navigate',url)&&this.resetScrollBar());
    this.win.webContents.on('dom-ready', () =>this.resetScrollBar());
    **/
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// SSL/TSL: this is the self signed certificate support
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    // On certificate error we disable default behaviour (stop loading the page)
    // and we then say "it is all fine - true" to the callback
    event.preventDefault();
    callback(true);
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
