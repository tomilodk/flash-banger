import { ipcMain } from "electron";
import { toggleActionMenu } from "./shortcuts/toggleActionMenu";
import { storage } from "../lib/storage";

export const hasEnteredName = () => {
    return !!storage.getItem("name");
}

export function initialLaunchRules() {
    if (!hasEnteredName()) {
        toggleActionMenu("set-name");
    }

    ipcMain.on("set-name", (event: Electron.IpcMainEvent, name: string) => {
        console.log("setName", name);
        storage.setItem("name", name);
        toggleActionMenu("flash");
        toggleActionMenu("flash");
    });
}