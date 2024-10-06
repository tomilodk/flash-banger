import { ipcMain } from "electron";
import { mainWindow } from "..";
import { getWebSocket } from "./websocket";
import { storage } from "../lib/storage";

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

    ipcMain.on('get-names', (event: Electron.IpcMainEvent) => {
        getWebSocket().send(JSON.stringify({
            command: "get-names",
            body: ""
        }));
    });

    ipcMain.on('get-my-name', (event: Electron.IpcMainEvent) => {
        event.reply('get-my-name-response', storage.getItem("name"))
    });
}