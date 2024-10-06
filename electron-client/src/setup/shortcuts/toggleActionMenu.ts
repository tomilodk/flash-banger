import { ACTIONS } from "../../components/action-menu-actions";
import { mainWindow } from "../..";

export function toggleActionMenu(action: keyof typeof ACTIONS) {
    mainWindow.webContents.send('toggle-action-menu', action);
}