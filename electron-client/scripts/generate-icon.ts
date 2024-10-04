import path from "path";
import fs from "fs";
import { exec } from "child_process";
import util from "util";

const execAsync = util.promisify(exec);

(async function () {
  const imagePath = path.join(__dirname, "../packaging/app_icon.png");
  const iconOutputDir = path.join(__dirname, "../packaging/icon.iconset");

  await fs.promises.mkdir(iconOutputDir, { recursive: true });

  const iconConfigurations = [
    { size: 16, suffix: '' },
    { size: 32, suffix: '@2x' },
    { size: 32, suffix: '' },
    { size: 64, suffix: '@2x' },
    { size: 128, suffix: '' },
    { size: 256, suffix: '@2x' },
    { size: 256, suffix: '' },
    { size: 512, suffix: '@2x' },
    { size: 512, suffix: '' },
    { size: 1024, suffix: '@2x' }
  ];

  for (const config of iconConfigurations) {
    const outputPath = path.join(iconOutputDir, `icon_${config.size}x${config.size}${config.suffix}.png`);
    await execAsync(`magick ${imagePath} -resize ${config.size}x${config.size} ${outputPath}`);
  }
})();
