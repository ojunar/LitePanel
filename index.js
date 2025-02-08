const express = require('express');
const WebSocket = require('ws');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const os = require('os');
const childProcess = require('child_process');
const schedule = require('node-schedule');
const SSHClient = require('ssh2').Client;

const app = express();
app.use(express.json());
app.use(express.static('public'));

const config = yaml.load(fs.readFileSync('config.yml', 'utf8'));
const ServerManager = require('./modules/ServerManager');
const ThemeManager = require('./modules/ThemeManager');
const BackupManager = require('./modules/BackupManager');
const WebSocketServer = require('./modules/WebSocketServer');

class LitePanel {
  constructor() {
    this.servers = [];
    this.themes = [];
    this.backupManager = new BackupManager();
    this.themeManager = new ThemeManager();
    this.serverManager = new ServerManager();
    this.webSocketServer = new WebSocketServer();
  }

  async init() {
    await this.serverManager.loadServers();
    await this.themeManager.loadThemes();
    this.backupManager.init();
    this.setupRoutes();
    this.setupScheduler();
  }

  setupRoutes() {
    app.get('/', (req, res) => {
      res.render('index', { servers: this.servers, themes: this.themes });
    });

    app.get('/servers/:serverId/files', (req, res) => {
      const server = this.servers.find(s => s.id === req.params.serverId);
      res.render('files', { server });
    });

    app.get('/servers/:serverId/console', (req, res) => {
      const server = this.servers.find(s => s.id === req.params.serverId);
      res.render('console', { server });
    });
  }

  setupScheduler() {
    schedule.scheduleJob('0 0 * * *', () => {
      this.backupManager.runBackup();
    });
  }

  start() {
    const server = app.listen(3000, () => {
      console.log('LitePanel started on port 3000');
    });
    this.webSocketServer.init(server);
  }
}

const litePanel = new LitePanel();
litePanel.init().then(() => {
  litePanel.start();
});
