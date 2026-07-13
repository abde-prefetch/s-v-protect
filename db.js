const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.json');

// Initialiser le fichier de DB s'il n'existe pas
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({}, null, 2));
}

let cachedData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

function save() {
  fs.writeFile(dbPath, JSON.stringify(cachedData, null, 2), (err) => {
    if (err) console.error("Erreur lors de la sauvegarde de la DB :", err);
  });
}

module.exports = {
  getGuildConfig(guildId) {
    if (!cachedData[guildId]) {
      cachedData[guildId] = {
        prefix: '+',
        whitelist: [],
        blacklist: [],
        ownerRoles: [],
        adminRoles: [],
        logsChannel: null,
        antiLink: true,
        antiSpam: true,
        antiMassPing: true,
        antiRaid: true,
        antiInvite: false,
        antiAlt: false,
        piconlyChannels: [],
        badwords: [],
        mutedRole: null,
        backups: [],
        theme: '#5865F2'
      };
      save();
    }
    return cachedData[guildId];
  },
  
  updateGuildConfig(guildId, newConfig) {
    cachedData[guildId] = { ...this.getGuildConfig(guildId), ...newConfig };
    save();
    return cachedData[guildId];
  },

  getGlobalData() {
    if (!cachedData.global) {
      cachedData.global = {
        blacklist: []
      };
      save();
    }
    return cachedData.global;
  },

  updateGlobalData(newData) {
    cachedData.global = { ...this.getGlobalData(), ...newData };
    save();
    return cachedData.global;
  }
};
