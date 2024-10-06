import { ipcMain } from "electron";
import { mainWindow } from "..";
import { getWebSocket } from "./websocket";

export function addBridge() {
    ipcMain.on('clickable', (event: Electron.IpcMainEvent, clickable: boolean) => {
        mainWindow.setIgnoreMouseEvents(!clickable, { forward: true });
    });

    ipcMain.on('set-name', (event: Electron.IpcMainEvent, name: string) => {
        getWebSocket().send(JSON.stringify({
            command: "set-name",
            body: name
        }));
    });

    ipcMain.on('send-message', (event: Electron.IpcMainEvent, name: string, text: string) => {
        getWebSocket().send(JSON.stringify({
            command: "send-message",
            body: JSON.stringify({
                name,
                text
            })
        }));
    });
}