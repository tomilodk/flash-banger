import WebSocket from 'ws';
import { mainWindow } from '..';
import { hasEnteredName } from './initial-launch-rules';
import { storage } from '../lib/storage';
import { log } from '../lib/logger';
import { setNameSchema } from '../schemas/set-name-schema';

// Set up WebSocket (or HTTP) to listen for flash commands

let ws: WebSocket | null = null;

export function getWebSocket() {
    if(!ws) {
        addWebSocket();
    }

    return ws;
}

export function addWebSocket() {
    ws = new WebSocket('wss://flash.igloo.dk/ws');  // Replace with your WebSocket server address
  
    ws.on('open', () => {
      log('WebSocket connection established');

      if(hasEnteredName()) {
        const result = setNameSchema.safeParse({name: storage.getItem("name")});
        if (!result.success) {
            log("Failed to set name");
            storage.deleteItem("name");
            return;
        }

        ws.send(JSON.stringify({
          command: "set-name",
          body: storage.getItem("name")
        }));
      }
    });
  
    ws.on('message', (data) => {
      const message = data.toString();
      log('Received message: ' + message);
      if (!message.includes("command")) return;

      const messageObject = JSON.parse(message);
  
      // Trigger the flash in the renderer process
      if (messageObject.command === 'flash') {
        mainWindow.webContents.send('flash', messageObject.body);
      }

      if (messageObject.command === 'get-names-response') {
        mainWindow.webContents.send('get-names-response', messageObject.body);
      }
    });
  
    ws.on('close', () => {
      log('WebSocket connection closed');
    });
    // Function to reconnect WebSocket
    function reconnectWebSocket() {
      log('Attempting to reconnect WebSocket...');
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
      log(`WebSocket connection closed: ${code} ${reason}`);
      clearInterval(pingInterval);
    setTimeout(reconnectWebSocket, 5000); // Attempt to reconnect after 5 seconds
  });
}

export function pingWebSocket() {
  const ws = getWebSocket();
  if (ws.readyState === WebSocket.OPEN) {
    ws.ping();
  } else {
    addWebSocket();
  }
}