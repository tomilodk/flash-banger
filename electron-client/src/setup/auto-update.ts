import { updateElectronApp, UpdateSourceType } from 'update-electron-app';

export function addAutoUpdate() {
    updateElectronApp({
        updateSource: {
            type: UpdateSourceType.ElectronPublicUpdateService,
            repo: 'tomilodk/flash-banger'
        },
        updateInterval: '5 minutes',
    });
}
