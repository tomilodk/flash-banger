import { logger } from '../lib/logger';
import { autoUpdater } from 'electron';

export function addAutoUpdate() {
    setInterval(() => {
        logger.info('Checking for updates')
        autoUpdater.checkForUpdates()
    }, 60000)

    autoUpdater.on('update-available', () => {
        logger.info('Update available');
    })

    autoUpdater.on('update-downloaded', () => {
        logger.info('Update downloaded, quitting and installing');
        autoUpdater.quitAndInstall()
    })

    autoUpdater.on('error', (message) => {
        logger.error('There was a problem updating the application')
        logger.error(JSON.stringify(message))
    })
}