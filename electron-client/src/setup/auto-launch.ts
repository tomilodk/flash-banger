import AutoLaunch from 'auto-launch';

export function addAutoLaunch() {
    const autoLauncher = new AutoLaunch({
        name: "Flash Banger",
    });
    // Checking if autoLaunch is enabled, if not then enabling it.
    autoLauncher.isEnabled().then(function (isEnabled) {
        if (isEnabled) return;
        autoLauncher.enable();
    }).catch(function (err) {
        throw err;
    });
}