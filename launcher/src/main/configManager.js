const path = require('path');
const fs = require('fs-extra');
const { app } = require('electron');

const resolveConfigPath = () => {
  const userDir = (() => {
    try {
      if (app && typeof app.getPath === 'function' && app.isReady()) {
        return app.getPath('userData');
      }
    } catch (error) {
      // ignored
    }
    const base = process.env.APPDATA || process.env.LOCALAPPDATA || process.cwd();
    return path.join(base, 'GravenholdRP');
  })();

  return path.join(userDir, 'config.json');
};

class ConfigManager {
  constructor() {
    this.defaultConfig = {
      javaPath: '',
      ram: 4,
      resolution: {
        width: 1920,
        height: 1080
      },
      theme: 'dark',
      winterEvent: false,
      locale: 'uk-UA',
      supportWebhook: '',
      autoUpdate: true
    };

    this.configPath = resolveConfigPath();
    this.ensureConfig();
  }

  ensureConfig() {
    fs.ensureDirSync(path.dirname(this.configPath));
    if (!fs.existsSync(this.configPath)) {
      fs.writeJSONSync(this.configPath, this.defaultConfig, { spaces: 2 });
    }
  }

  getConfig() {
    try {
      this.ensureConfig();
      return fs.readJSONSync(this.configPath);
    } catch (error) {
      console.error('Config read error', error);
      return { ...this.defaultConfig };
    }
  }

  saveConfig(payload) {
    try {
      const nextConfig = { ...this.defaultConfig, ...payload };
      fs.writeJSONSync(this.configPath, nextConfig, { spaces: 2 });
      return nextConfig;
    } catch (error) {
      console.error('Config write error', error);
      throw error;
    }
  }

  setTheme(theme) {
    const config = this.getConfig();
    config.theme = theme;
    this.saveConfig(config);
  }
}

module.exports = ConfigManager;
