import { globalShortcut } from "electron";
import { toggleActionMenu } from "./shortcuts/toggleActionMenu";
import { deleteStorage } from "./shortcuts/deleteStorage";
import { closeActionMenu } from "./shortcuts/closeActionMenu";

const shortcuts = {
    'Alt+Shift+.': () => toggleActionMenu('flash'),
    'Alt+Shift+CommandOrControl+,': () => deleteStorage(),
}

const onOpenShortcuts = {
    'ESC': () => closeActionMenu(),
}

export function addShortcuts() {
    for (const [shortcut, callback] of Object.entries(shortcuts)) {
        registerShortcut(shortcut, callback);
    }
}

export function addOnOpenShortcuts() {
    for (const [shortcut, callback] of Object.entries(onOpenShortcuts)) {
        registerOnOpenShortcut(shortcut, callback);
    }
}

export function removeOnOpenShortcuts() {
    for (const [shortcut] of Object.entries(onOpenShortcuts)) {
        unregisterOnOpenShortcut(shortcut);
    }
}

function registerShortcut(shortcut: string, callback: () => void) {
    globalShortcut.register(shortcut, callback);
}

function registerOnOpenShortcut(shortcut: string, callback: () => void) {
    globalShortcut.register(shortcut, callback);
}

function unregisterOnOpenShortcut(shortcut: string) {
    globalShortcut.unregister(shortcut);
}
