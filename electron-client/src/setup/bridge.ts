import { ipcMain } from "electron";
import { mainWindow } from "..";
import { getWebSocket } from "./websocket";

export function addBridge() {
    ipcMain.on('clickable', (event: Electron.IpcMainEvent, clickable: boolean) => {
        mainWindow.setIgnoreMouseEvents(!clickable, { forward: true });
    });

    ipcMain.on('setName', (event: Electron.IpcMainEvent, name: string) => {
        mainWindow.webContents.send('setName', name);
        
        getWebSocket().send(JSON.stringify({
            command: "set-name",
            body: name
        }));
    });
}