// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

console.log("Preload initializing");

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    onFlash: (callback: (event: Electron.IpcRendererEvent, data: any) => void) => {
        console.log('Registering flash event listener in preload');
        ipcRenderer.on('flash', (event, data) => {
            callback(event, data);
        });
    },
});

console.log('Preload script is running');
