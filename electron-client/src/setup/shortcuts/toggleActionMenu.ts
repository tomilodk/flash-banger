import { mainWindow } from "../..";

export function toggleActionMenu() {
    mainWindow.webContents.send('toggle-action-menu');
}