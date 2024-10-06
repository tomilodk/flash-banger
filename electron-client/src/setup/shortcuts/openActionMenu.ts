import { ACTIONS } from "../../components/action-menu-actions";
import { mainWindow } from "../..";
import { hasEnteredName } from "../initial-launch-rules";

export function openActionMenu(action: keyof typeof ACTIONS) {
    if (!hasEnteredName() && action !== "set-name") {
        sendOpenActionMenu("set-name");
        return;
    }

    sendOpenActionMenu(action);
}

function sendOpenActionMenu(action: keyof typeof ACTIONS) {
    mainWindow.webContents.send('open-action-menu', action);
    setTimeout(() => {
        mainWindow.focus();
    }, 100);
}