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

client.commands = new Collection();
client.prefixCommands = new Collection();
client.db = require('./db.js');

// Chargement des commandes Slash
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
    }
  }
}

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

// Événement d'interaction (Commandes Slash)
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(`Erreur commande ${interaction.commandName}:`, error);
    const msg = { content: '❌ Une erreur est survenue lors de l\'exécution de la commande.', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(msg);
    } else {
      await interaction.reply(msg);
    }
  }
});

client.once('ready', () => {
  console.log(`✅ S-V Protect connecté en tant que ${client.user.tag}`);
});

client.login(process.env.TOKEN);
