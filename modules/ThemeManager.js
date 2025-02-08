const fs = require('fs');
const path = require('path');

class ThemeManager {
  constructor() {
    this.themes = [];
  }

  async loadThemes() {
    const themesDir = path.join(__dirname, '..', 'public', 'themes');
    fs.readdirSync(themesDir).forEach(themeFile => {
      if (themeFile.endsWith('.css')) {
        this.themes.push(themeFile.replace('.css', ''));
      }
    });
  }
}

module.exports = ThemeManager;
