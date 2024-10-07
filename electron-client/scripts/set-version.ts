import fs from 'fs';
import path from 'path';

const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const newVersion = process.argv[2];

packageJson.version = newVersion.replace(/^v/, '');

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log(`Version set to ${newVersion}`);
