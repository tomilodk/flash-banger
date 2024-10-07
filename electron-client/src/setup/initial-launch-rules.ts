import { ipcMain } from "electron";
import { storage } from "../lib/storage";
import { openActionMenu } from "./shortcuts/openActionMenu";
import { setNameSchema } from "../schemas/set-name-schema";

export const hasEnteredName = () => {
    return !!storage.getItem("name");
}

export function initialLaunchRules() {
    if (!hasEnteredName()) {
        openActionMenu("set-name");
    }

    ipcMain.on("set-name", (event: Electron.IpcMainEvent, name: string) => {
        const result = setNameSchema.safeParse({name});
        if (!result.success) {
            return;
        }
        
        storage.setItem("name", name);
        openActionMenu("flash");
    });
}