import { ipcMain } from "electron";
import { storage } from "../lib/storage";
import { openActionMenu } from "./shortcuts/openActionMenu";

export const hasEnteredName = () => {
    return !!storage.getItem("name");
}

export function initialLaunchRules() {
    if (!hasEnteredName()) {
        openActionMenu("set-name");
    }

    ipcMain.on("set-name", (event: Electron.IpcMainEvent, name: string) => {
        console.log("setName", name);
        storage.setItem("name", name);
        openActionMenu("flash");
    });
}