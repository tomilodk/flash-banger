import { app, BrowserWindow, ipcMain } from 'electron';
import WebSocket from 'ws';
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

import { updateElectronApp } from 'update-electron-app';
updateElectronApp(); // additional configuration options available

import AutoLaunch from 'auto-launch';
const autoLauncher = new AutoLaunch({
  name: "Flash Banger",
});
// Checking if autoLaunch is enabled, if not then enabling it.
autoLauncher.isEnabled().then(function (isEnabled) {
  if (isEnabled) return;
  autoLauncher.enable();
}).catch(function (err) {
  throw err;
});

let mainWindow: BrowserWindow;

const createWindow = (): void => {
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
      contextIsolation: false,
    }
  });
  // Enable click-through: allows clicking through the window
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


// Set up WebSocket (or HTTP) to listen for flash commands
function setupWebSocket() {
  const ws = new WebSocket('wss://flash.igloo.dk/ws');  // Replace with your WebSocket server address

  ws.on('open', () => {
    console.log('WebSocket connection established');
  });

  ws.on('message', (data) => {
    const message = data.toString();
    console.log('Received message:', message);
    if (!message.includes("command")) return;

    const messageObject = JSON.parse(message);

    // Trigger the flash in the renderer process
    if (messageObject.command === 'flash') {
      mainWindow.webContents.send('flash', { text: messageObject.body });
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
  // Function to reconnect WebSocket
  function reconnectWebSocket() {
    console.log('Attempting to reconnect WebSocket...');
    setupWebSocket();
  }

  // Set up a ping interval to keep the connection alive
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  }, 30000); // Send a ping every 30 seconds

  // Handle unexpected closures and attempt to reconnect
  ws.on('close', (code, reason) => {
    console.log(`WebSocket connection closed: ${code} ${reason}`);
    clearInterval(pingInterval);
    setTimeout(reconnectWebSocket, 5000); // Attempt to reconnect after 5 seconds
  });
}

// Electron app lifecycle
app.whenReady().then(() => {
  // Hide the app icon from the dock (for macOS)
  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  createWindow();
  setupWebSocket();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('flash', (event: Electron.IpcMainEvent, data: any) => {
  console.log('Flash event received in main process:', data);
  mainWindow.webContents.send('flash', data);
});
