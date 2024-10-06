import { app, BrowserWindow, ipcMain } from 'electron';
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

import { addWebsocket } from './setup/websocket';
import { addAutoUpdate } from './setup/auto-update';
import { addAutoLaunch } from './setup/auto-launch';

addAutoUpdate();
addAutoLaunch();

export let mainWindow: BrowserWindow;

const createWindow = (): void => {
  console.log({ MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY, MAIN_WINDOW_WEBPACK_ENTRY });
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: false,          // Make it fullscreen
    transparent: true,         // Transparent window
    frame: false,              // No window frame (borderless)
    alwaysOnTop: true,         // Ensure it stays on top
    skipTaskbar: true,         // Don't show it in the taskbar (Windows/Linux)
    webPreferences: {
      nodeIntegration: true,  // Allow using Node.js modules in the renderer
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    }
  });
  // Enable click-through: allows clicking through the window
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.webContents.openDevTools({ mode: 'detach' });
};

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('clickable', (event: Electron.IpcMainEvent, clickable: boolean) => {
  mainWindow.setIgnoreMouseEvents(!clickable, { forward: true });
});

// Electron app lifecycle
app.whenReady().then(() => {
  // Hide the app icon from the dock (for macOS)
  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  createWindow();
  addWebsocket();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
