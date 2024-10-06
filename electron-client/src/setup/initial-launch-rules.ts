import { ipcMain } from "electron";
import { toggleActionMenu } from "./shortcuts/toggleActionMenu";

export let hasEnteredName = false;

export function initialLaunchRules() {
    if (!hasEnteredName) {
        toggleActionMenu("set-name");

        ipcMain.on("name-entered", () => {
            hasEnteredName = true;
        });
    }
}