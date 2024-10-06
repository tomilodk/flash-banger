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
});

console.log('Preload script is running');
