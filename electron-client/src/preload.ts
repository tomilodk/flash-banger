// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts


import { contextBridge, ipcRenderer } from 'electron';
import { ACTIONS } from './components/action-menu-actions';

type FlashData = {
    text: string;
}

declare global {
    interface Window {
        electronAPI: {
            onFlash: (callback: (event: Electron.IpcRendererEvent, data: FlashData) => void) => void;
            clickable: (clickable: boolean) => void;
            onToggleActionMenu: (callback: (action: keyof typeof ACTIONS) => void) => void;
            setName: (name: string) => void;
            sendMessage: (name: string, text: string) => void;
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
    onToggleActionMenu: (callback: (action: keyof typeof ACTIONS) => void) => {
        ipcRenderer.on('toggle-action-menu', (event, action) => {
            callback(action);
        });
    },
    setName: (name: string) => {
        ipcRenderer.send('set-name', name);
    },
    sendMessage: (name: string, text: string) => {
        ipcRenderer.send('send-message', name, text);
    }
});

console.log('Preload script is running');
