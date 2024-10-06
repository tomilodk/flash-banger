import { mainWindow } from "../..";

export function closeActionMenu() {
    mainWindow.webContents.send('close-action-menu');
}