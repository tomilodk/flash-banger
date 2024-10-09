import { mainWindow } from "../..";

export function forceEndFlash() {
    mainWindow.webContents.send('flash-force-end');
}