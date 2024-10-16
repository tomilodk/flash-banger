// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts


import { contextBridge, ipcRenderer } from 'electron';
import { ACTIONS } from './components/action-menu-actions';
import { sendFlashSchema } from './schemas/send-flash-schema';

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
            getRawClients: () => Promise<string>;
            getMyName: () => Promise<string>;
            getVersion: () => Promise<string>;
            getPlatform: () => Promise<Platform>;
            pingWebSocket: () => void;
        }
    }
}

let closeActionMenu: () => void;
let openActionMenu: (action: keyof typeof ACTIONS) => void;

contextBridge.exposeInMainWorld('electronAPI', {
    onFlash: (callback: (event: Electron.IpcRendererEvent, data: FlashData) => void) => {
        console.log('Registering flash event listener in preload');
        ipcRenderer.on('flash', (event, data) => {
            const validation = sendFlashSchema.safeParse({ text: data.text });

            if (validation.success) 
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
    getRawClients: () => {
        return new Promise((resolve, reject) => {
            ipcRenderer.send('get-raw-clients');

            setTimeout(() => {
                reject('Timeout');
            }, 10000);

            ipcRenderer.on('get-raw-clients-response', (event, names) => {
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
    getVersion: () => {
        return new Promise((resolve, reject) => {
            ipcRenderer.send('get-version');

            setTimeout(() => {
                reject('Timeout');
            }, 10000);

            ipcRenderer.on('get-version-response', (event, version) => {
                resolve(version);
            });
        });
    },
    getPlatform: () => {
        return new Promise((resolve, reject) => {
            ipcRenderer.send('get-platform');

            setTimeout(() => {
                reject('Timeout');
            }, 10000);

            ipcRenderer.on('get-platform-response', (event, platform) => {
                resolve(platform);
            });
        });
    },
    pingWebSocket: () => {
        ipcRenderer.send('ping-websocket');
    }
});

console.log('Preload script is running');
