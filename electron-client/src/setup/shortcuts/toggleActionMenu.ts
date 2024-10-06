import { mainWindow } from "../..";

export function toggleActionMenu() {
    console.log('toggle-action-menu calling in renderer');
    mainWindow.webContents.send('toggle-action-menu');
}