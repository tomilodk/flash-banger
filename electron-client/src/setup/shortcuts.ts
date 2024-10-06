import { globalShortcut } from "electron";
import { toggleActionMenu } from "./shortcuts/toggleActionMenu";
import { deleteStorage } from "./shortcuts/deleteStorage";

const shortcuts = {
    'Alt+Shift+.': () => toggleActionMenu('flash'),
    'Alt+Shift+CommandOrControl+,': () => deleteStorage(),
}

export function addShortcuts() {
    for (const [shortcut, callback] of Object.entries(shortcuts)) {
        registerShortcut(shortcut, callback);
    }
}

function registerShortcut(shortcut: string, callback: () => void) {
    globalShortcut.register(shortcut, callback);
}