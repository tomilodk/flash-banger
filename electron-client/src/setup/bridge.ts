import { ipcMain } from "electron";
import { mainWindow } from "..";
import { getWebSocket, pingWebSocket } from "./websocket";
import { storage } from "../lib/storage";
import { setNameSchema } from "../schemas/set-name-schema";
import { sendFlashSchema } from "../schemas/send-flash-schema";
import { log } from "../lib/logger";
import { runtimeVersion } from "../runtime-version";

export function addBridge() {
    ipcMain.on('clickable', (event: Electron.IpcMainEvent, clickable: boolean) => {
        mainWindow.setIgnoreMouseEvents(!clickable, { forward: true });
    });

    ipcMain.on('set-name', (event: Electron.IpcMainEvent, name: string) => {
        const result = setNameSchema.safeParse({name});
        if (!result.success) {
            return;
        }

        log(`Setting name to ${name}`);

        getWebSocket().send(JSON.stringify({
            command: "set-name",
            body: name
        }));
    });

    ipcMain.on('send-message', (event: Electron.IpcMainEvent, name: string, text: string) => {
        const result = sendFlashSchema.safeParse({text});
        if (!result.success) {
            return;
        }

        getWebSocket().send(JSON.stringify({
            command: "send-message",
            body: JSON.stringify({
                name,
                text
            })
        }));
    });

    ipcMain.on('get-raw-clients', (event: Electron.IpcMainEvent) => {
        getWebSocket().send(JSON.stringify({
            command: "get-raw-clients",
            body: ""
        }));
    });

    ipcMain.on('get-my-name', (event: Electron.IpcMainEvent) => {
        event.reply('get-my-name-response', storage.getItem("name"))
    });

    ipcMain.on('get-platform', (event: Electron.IpcMainEvent) => {
        event.reply('get-platform-response', process.platform);
    });

    ipcMain.on('get-version', (event: Electron.IpcMainEvent) => {
        event.reply('get-version-response', runtimeVersion);
    });

    ipcMain.on("ping-websocket", (event: Electron.IpcMainEvent) => {
        pingWebSocket();
    });
}