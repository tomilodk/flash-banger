import WebSocket from 'ws';
import { mainWindow } from '..';

// Set up WebSocket (or HTTP) to listen for flash commands
export function addWebSocket() {
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
      addWebSocket();
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