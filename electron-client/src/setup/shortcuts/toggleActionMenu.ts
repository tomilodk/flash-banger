import { ACTIONS } from "../../components/action-menu-actions";
import { mainWindow } from "../..";
import { hasEnteredName } from "../initial-launch-rules";

export function toggleActionMenu(action: keyof typeof ACTIONS) {
    if (!hasEnteredName && action !== "set-name") return;
    
    mainWindow.webContents.send('toggle-action-menu', action);
}