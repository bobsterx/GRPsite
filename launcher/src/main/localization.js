const path = require('path');
const fs = require('fs-extra');

class Localization {
  constructor(configManager) {
    this.configManager = configManager;
    this.localizationPath = path.join(__dirname, '../localization');
  }

  getStrings() {
    const { locale } = this.configManager.getConfig();
    const filePath = path.join(this.localizationPath, `${locale}.json`);
    if (!fs.existsSync(filePath)) {
      return fs.readJSONSync(path.join(this.localizationPath, 'uk-UA.json'));
    }
    return fs.readJSONSync(filePath);
  }
}

module.exports = Localization;
