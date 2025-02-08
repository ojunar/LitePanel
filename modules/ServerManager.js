const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

class ServerManager {
  constructor() {
    this.servers = [];
  }

  async loadServers() {
    const serversDir = path.join(__dirname, '..', 'servers');
    fs.readdirSync(serversDir).forEach(serverDir => {
      const serverPath = path.join(serversDir, serverDir);
      const propertiesPath = path.join(serverPath, 'litepanel.properties');
      if (fs.existsSync(propertiesPath)) {
        const properties = fs.readFileSync(propertiesPath, 'utf8');
        this.servers.push({
          id: serverDir,
          name: properties.serverName,
          minecraftVersion: properties.minecraftVersion,
          javaVersion: properties.javaVersion,
          path: serverPath,
          process: null
        });
      }
    });
  }

  async startServer(server) {
    return new Promise((resolve, reject) => {
      server.process = childProcess.spawn('java', [
        `-Xmx1024M`,
        `-jar`,
        path.join(server.path, 'server.jar')
      ], {
        cwd: server.path
      });

      server.process.stdout.on('data', (data) => {
        console.log(`Server ${server.id}: ${data}`);
      });

      server.process.stderr.on('data', (data) => {
        console.error(`Server ${server.id}: ${data}`);
      });

      server.process.on('close', () => {
        console.log(`Server ${server.id} stopped`);
      });

      resolve();
    });
  }
}

module.exports = ServerManager;
