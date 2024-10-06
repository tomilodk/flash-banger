const { execSync } = require('child_process');

function main() {
    // Build go server with docker and then run with port 8080
    execSync('docker build -t flash-server .');
    execSync('docker run -p 8080:8080 flash-server');
}

main();