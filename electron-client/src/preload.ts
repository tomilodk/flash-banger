// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts


import { contextBridge, ipcRenderer } from 'electron';
import { ACTIONS } from './components/action-menu-actions';

type FlashData = {
    text: string;
    from: string;
}

declare global {
    interface Window {
        electronAPI: {
            onFlash: (callback: (event: Electron.IpcRendererEvent, data: FlashData) => void) => void;
            clickable: (clickable: boolean) => void;
            onToggleActionMenu: (callback: (action: keyof typeof ACTIONS) => void) => void;
            onCloseActionMenu: (callback: () => void) => void;
            onOpenActionMenu: (callback: (action: keyof typeof ACTIONS) => void) => void;
            setName: (name: string) => void;
            sendMessage: (name: string, text: string) => void;
            closeActionMenu: () => void;
            openActionMenu: (action: keyof typeof ACTIONS) => void;
            getNames: () => Promise<string>;
            getMyName: () => Promise<string>;
        }
    }
}

let closeActionMenu: () => void;
let openActionMenu: (action: keyof typeof ACTIONS) => void;

contextBridge.exposeInMainWorld('electronAPI', {
    onFlash: (callback: (event: Electron.IpcRendererEvent, data: FlashData) => void) => {
        console.log('Registering flash event listener in preload');
        ipcRenderer.on('flash', (event, data) => {
            callback(event, data);
        });
    },
    clickable: (clickable: boolean) => {
        ipcRenderer.send('clickable', clickable);
    },
    onToggleActionMenu: (callback: (action: keyof typeof ACTIONS) => void) => {
        ipcRenderer.on('toggle-action-menu', (event, action) => {
            callback(action);
        });
    },
    onCloseActionMenu: (callback: () => void) => {
        closeActionMenu = callback;
        ipcRenderer.on('close-action-menu', () => {
            closeActionMenu();
        });
    },
    onOpenActionMenu: (callback: (action: keyof typeof ACTIONS) => void) => {
        openActionMenu = callback;
        ipcRenderer.on('open-action-menu', (event, action) => {
            openActionMenu(action);
        });
    },
    closeActionMenu: () => {
        closeActionMenu();
    },
    openActionMenu: (action: keyof typeof ACTIONS) => {
        openActionMenu(action);
    },
    setName: (name: string) => {
        ipcRenderer.send('set-name', name);
    },
    sendMessage: (name: string, text: string) => {
        ipcRenderer.send('send-message', name, text);
    },
    getNames: () => {
        return new Promise((resolve, reject) => {
            ipcRenderer.send('get-names');

            setTimeout(() => {
                reject('Timeout');
            }, 10000);

            ipcRenderer.on('get-names-response', (event, names) => {
                resolve(names);
            });
        });
    },
    getMyName: () => {
        return new Promise((resolve, reject) => {
            ipcRenderer.send('get-my-name');

            setTimeout(() => {
                reject('Timeout');
            }, 10000);

            ipcRenderer.on('get-my-name-response', (event, name) => {
                resolve(name);
            });
        });
    },
});

console.log('Preload script is running');
