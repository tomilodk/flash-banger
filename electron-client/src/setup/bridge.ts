import { ipcMain } from "electron";
import { mainWindow } from "..";

export function addBridge() {
    ipcMain.on('clickable', (event: Electron.IpcMainEvent, clickable: boolean) => {
        mainWindow.setIgnoreMouseEvents(!clickable, { forward: true });
    });

    ipcMain.on('setName', (event: Electron.IpcMainEvent, name: string) => {
        mainWindow.webContents.send('setName', name);
    });
}