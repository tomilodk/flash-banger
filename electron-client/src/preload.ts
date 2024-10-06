// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts


import { contextBridge, ipcRenderer } from 'electron';

type FlashData = {
    text: string;
}

declare global {
    interface Window {
        electronAPI: {
            onFlash: (callback: (event: Electron.IpcRendererEvent, data: FlashData) => void) => void;
            clickable: (clickable: boolean) => void;
            onToggleActionMenu: (callback: () => void) => void;
        }
    }
}

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
    onToggleActionMenu: (callback: () => void) => {
        ipcRenderer.on('toggle-action-menu', callback);
    }
});

console.log('Preload script is running');
