const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
	mainWindow = new BrowserWindow({
		minWidth: 900,
		minHeight: 680,
		width: 1920,
		height: 1080,
		webPreferences: {
			nodeIntegration: true
		}
	});
	mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
	if (isDev) {
		// Open the DevTools.
		//BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
		mainWindow.webContents.openDevTools();
	}
	mainWindow.on('closed', () => mainWindow = null);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (mainWindow === null) {
		createWindow();
	}
});
