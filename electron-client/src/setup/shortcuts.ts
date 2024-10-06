import { globalShortcut } from "electron";
import { toggleActionMenu } from "./shortcuts/toggleActionMenu";

const shortcuts = {
    'Alt+Shift+.': () => toggleActionMenu('flash'),
}

export function addShortcuts() {
    for (const [shortcut, callback] of Object.entries(shortcuts)) {
        registerShortcut(shortcut, callback);
    }
}

function registerShortcut(shortcut: string, callback: () => void) {
    globalShortcut.register(shortcut, callback);
}