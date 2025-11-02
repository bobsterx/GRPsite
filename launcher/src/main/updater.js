const path = require('path');
const fs = require('fs-extra');
const { Notification } = require('electron');
const https = require('https');
const { spawn } = require('child_process');
const os = require('os');
const dns = require('dns');

class Updater {
  constructor(configManager) {
    this.configManager = configManager;
    this.componentsPath = path.join(os.homedir(), 'GravenholdRP', 'components');
    fs.ensureDirSync(this.componentsPath);

    this.components = [
      {
        id: 'voice-chat',
        title: 'Голосовий чат',
        required: false,
        description: 'Рекомендований мод для покращеного голосового зв\'язку між гравцями.',
        file: 'voicechat_mod.zip',
        size: 50
      },
      {
        id: 'datapacks',
        title: 'Серверні датапаки',
        required: true,
        description: 'Обов\'язкові датапаки з механіками Гравенхолду.',
        file: 'datapacks.zip',
        size: 30
      },
      {
        id: 'resource-pack',
        title: 'Ресурс-пак сервера',
        required: false,
        description: 'Покращує атмосферу завдяки звукам та анімаціям.',
        file: 'resourcepack.zip',
        size: 120
      }
    ];
  }

  getComponentStatus(id) {
    const statusFile = path.join(this.componentsPath, `${id}.json`);
    if (!fs.existsSync(statusFile)) {
      return { status: 'not-installed', progress: 0 };
    }
    return fs.readJSONSync(statusFile);
  }

  setComponentStatus(id, status) {
    const statusFile = path.join(this.componentsPath, `${id}.json`);
    fs.writeJSONSync(statusFile, status, { spaces: 2 });
  }

  async hasInternet() {
    return new Promise((resolve) => {
      dns.lookup('example.com', (error) => {
        resolve(!error);
      });
    });
  }

  getComponents() {
    return this.components.map((component) => ({
      ...component,
      state: this.getComponentStatus(component.id)
    }));
  }

  async installComponent(id) {
    const component = this.components.find((item) => item.id === id);
    if (!component) {
      throw new Error('Компонент не знайдено');
    }

    const online = await this.hasInternet();
    if (!online) {
      throw new Error('Немає підключення до інтернету. Спробуйте ще раз.');
    }

    const status = this.getComponentStatus(id);
    if (status.status === 'installed') {
      return { ...status, status: 'installed' };
    }

    this.setComponentStatus(id, { status: 'downloading', progress: 0 });
    for (let i = 1; i <= 10; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      this.setComponentStatus(id, { status: 'downloading', progress: i * 10 });
    }

    const filePath = path.join(this.componentsPath, component.file);
    fs.writeFileSync(filePath, `Mock data for ${component.id}`);
    this.setComponentStatus(id, { status: 'installed', progress: 100, updatedAt: new Date().toISOString() });
    return this.getComponentStatus(id);
  }

  requiredInstalled() {
    return this.components
      .filter((component) => component.required)
      .every((component) => this.getComponentStatus(component.id).status === 'installed');
  }

  async launchGame() {
    const config = this.configManager.getConfig();
    if (!this.requiredInstalled()) {
      throw new Error('Встановіть обов\'язкові компоненти.');
    }

    const args = [];
    if (config.ram) {
      args.push(`-Xmx${config.ram}G`);
    }

    args.push('-jar', 'GravenholdRP.jar');

    const javaExecutable = config.javaPath || 'java';

    const child = spawn(javaExecutable, args, {
      cwd: path.join(os.homedir(), 'GravenholdRP'),
      detached: true,
      stdio: 'ignore'
    });

    child.on('error', (error) => {
      console.error('Launch error', error);
      throw error;
    });

    child.unref();
    return true;
  }

  fetchUpdates() {
    let fallback = [];
    try {
      fallback = fs.readJSONSync(path.join(__dirname, '../data/updates.json'));
    } catch (error) {
      console.warn('Fallback updates missing', error);
    }
    const url = 'https://updates.gravenholdrp.com/launcher.json';
    return new Promise((resolve) => {
      https
        .get(url, (res) => {
          if (res.statusCode !== 200) {
            resolve(fallback);
            return;
          }
          const raw = [];
          res.on('data', (chunk) => raw.push(chunk));
          res.on('end', () => {
            try {
              const parsed = JSON.parse(Buffer.concat(raw).toString());
              resolve(parsed);
            } catch (error) {
              console.warn('Update parse fallback', error);
              resolve(fallback);
            }
          });
        })
        .on('error', (error) => {
          console.warn('Update fetch fallback', error);
          resolve(fallback);
        });
    });
  }

  submitSupport(payload) {
    const config = this.configManager.getConfig();
    const webhook = config.supportWebhook;
    if (!webhook) {
      const logPath = path.join(this.componentsPath, 'support-requests.log');
      const entry = `${new Date().toISOString()}|${payload.category}|${payload.email}|${payload.message}\n`;
      fs.appendFileSync(logPath, entry);
      return { status: 'logged' };
    }

    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        content: `**${payload.category}**\nВід: ${payload.email}\n${payload.message}`
      });
      const target = new URL(webhook);
      const req = https.request(
        {
          hostname: target.hostname,
          path: `${target.pathname}${target.search}`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
          }
        },
        (res) => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: 'sent' });
          } else {
            reject(new Error('Помилка надсилання звернення.'));
          }
        }
      );

      req.on('error', (err) => reject(err));
      req.write(data);
      req.end();
    });
  }

  notify(title, body) {
    if (Notification.isSupported()) {
      new Notification({ title, body }).show();
    }
  }
}

module.exports = Updater;
