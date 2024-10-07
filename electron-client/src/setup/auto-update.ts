import { logger } from '../lib/logger';
import { updateElectronApp, UpdateSourceType } from 'update-electron-app';

export function addAutoUpdate() {
    updateElectronApp({
        updateSource: {
            type: UpdateSourceType.ElectronPublicUpdateService,
            repo: 'tomilodk/flash-banger',
            host: "https://github.com"
        },
        updateInterval: '5 minutes',
        logger: logger
    });
}
