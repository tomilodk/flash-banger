const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const WebSocket = require('ws');

const { updateElectronApp } = require('update-electron-app');
updateElectronApp(); // additional configuration options available

let mainWindow;

function createWindow() {
    // Create a transparent, fullscreen, frameless window
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

    // Load the renderer (the frontend, where the overlay and flash happen)
    mainWindow.loadFile('renderer.html');
}

// Set up WebSocket (or HTTP) to listen for flash commands
function setupWebSocket() {
    const ws = new WebSocket('wss://flash.igloo.dk/ws');  // Replace with your WebSocket server address

    ws.on('open', () => {
        console.log('WebSocket connection established');
    });

    ws.on('message', (data) => {
        const message = data.toString();
        console.log('Received message:', message);

        try {
            const messageObject = JSON.parse(message);

            // Trigger the flash in the renderer process
            if (messageObject.command === 'flash') {
                mainWindow.webContents.send('flash', { text: messageObject.body });
            }
        } catch {
        }


    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
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
