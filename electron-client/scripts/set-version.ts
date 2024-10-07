import fs from 'fs';
import path from 'path';

const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const newVersion = process.argv[2].replace(/^v/, '');

packageJson.version = newVersion,

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
fs.writeFileSync(path.join(__dirname, '../src/runtime-version.ts'), `export const runtimeVersion = "${newVersion}";`);

console.log(`Version set to ${newVersion}`);
