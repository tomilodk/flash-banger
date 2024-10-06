import { ACTIONS } from "../../components/action-menu-actions";
import { mainWindow } from "../..";
import { hasEnteredName } from "../initial-launch-rules";

export function toggleActionMenu(action: keyof typeof ACTIONS) {
    if (!hasEnteredName && action !== "set-name") {
        sendToggleActionMenu("set-name");
        return;
    }

    sendToggleActionMenu(action);
}

function sendToggleActionMenu(action: keyof typeof ACTIONS) {
    mainWindow.webContents.send('toggle-action-menu', action);
    setTimeout(() => {
        mainWindow.focus();
    }, 100);
}