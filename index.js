require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.prefixCommands = new Collection();
client.db = require('./db.js');

// Chargement récursif des commandes Préfixées
const prefixCommandsPath = path.join(__dirname, 'prefix-commands');
if (!fs.existsSync(prefixCommandsPath)) {
  fs.mkdirSync(prefixCommandsPath);
}

function loadPrefixCommands(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.lstatSync(filePath);
    if (stat.isDirectory()) {
      loadPrefixCommands(filePath);
    } else if (file.endsWith('.js')) {
      const required = require(filePath);
      const commands = Array.isArray(required) ? required : [required];
      for (const command of commands) {
        if (command.name && command.execute) {
          client.prefixCommands.set(command.name, command);
          if (command.aliases && Array.isArray(command.aliases)) {
            for (const alias of command.aliases) {
              client.prefixCommands.set(alias, command);
            }
          }
        }
      }
    }
  }
}
loadPrefixCommands(prefixCommandsPath);

// Chargement des événements
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
  for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
}

// Événement d'interaction (Boutons, etc. si besoin plus tard)
// (Slash commands supprimées)

client.once('ready', () => {
  console.log(`✅ S-V Protect connecté en tant que ${client.user.tag}`);
});

// Serveur HTTP minimal pour Render (UptimeRobot)
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write("S-V Protect is running!");
  res.end();
}).listen(process.env.PORT || 3000, () => {
  console.log(`📡 Serveur web démarré sur le port ${process.env.PORT || 3000}`);
});

client.login(process.env.TOKEN);
