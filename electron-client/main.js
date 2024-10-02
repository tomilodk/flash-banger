// Import required modules
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const WebSocket = require('ws');

// Create a new browser window for the app
let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,  // Enable Node.js integration in the renderer
            contextIsolation: false
        },
        fullscreen: true,
        frame: false, // No window frame (for a full-screen flash effect)
    });

    // Load the renderer.html file
    mainWindow.loadFile('renderer.html');
}

// Set up the WebSocket client
function setupWebSocket() {
    const ws = new WebSocket('ws://localhost:8080/ws');  // Connect to Go WebSocket server

    ws.on('open', function open() {
        console.log('WebSocket connection established.');
    });

    ws.on('message', function incoming(data) {
        // Convert Buffer to string
        const message = data.toString();
        console.log('Received message from server:', message);

        if (message === 'flash') {
            mainWindow.webContents.send('flash');  // Send flash event to renderer
        }
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed.');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
}

// When Electron is ready, create the window and set up WebSocket
app.whenReady().then(() => {
    createWindow();
    setupWebSocket();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit app when all windows are closed (for macOS compatibility)
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
