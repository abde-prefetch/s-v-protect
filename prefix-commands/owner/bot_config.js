const { EmbedBuilder } = require('discord.js');

module.exports = [
  {
    name: 'prefix',
    category: 'owner',
    description: "Modifie le préfixe du bot sur le serveur.",
    async execute(message, args, client) {
      if (!args[0]) return message.reply("❌ Veuillez spécifier un nouveau préfixe.");
      const newPrefix = args[0];
      client.db.updateGuildConfig(message.guild.id, { prefix: newPrefix });
      return message.reply(`✅ Le préfixe a été changé en : \`${newPrefix}\``);
    }
  },
  {
    name: 'whitelist',
    category: 'owner',
    description: "Ajoute un membre à la whitelist.",
    async execute(message, args, client) {
      const target = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
      if (!target) return message.reply("❌ Veuillez mentionner un utilisateur ou donner son ID.");

      const config = client.db.getGuildConfig(message.guild.id);
      if (config.whitelist.includes(target.id)) return message.reply("❌ Cet utilisateur est déjà dans la whitelist.");

      config.whitelist.push(target.id);
      client.db.updateGuildConfig(message.guild.id, { whitelist: config.whitelist });
      return message.reply(`✅ **${target.tag}** a été ajouté à la whitelist.`);
    }
  },
  {
    name: 'unwhitelist',
    category: 'owner',
    description: "Retire un membre de la whitelist.",
    async execute(message, args, client) {
      const target = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
      if (!target) return message.reply("❌ Veuillez mentionner un utilisateur ou donner son ID.");

      const config = client.db.getGuildConfig(message.guild.id);
      if (!config.whitelist.includes(target.id)) return message.reply("❌ Cet utilisateur n'est pas dans la whitelist.");

      config.whitelist = config.whitelist.filter(id => id !== target.id);
      client.db.updateGuildConfig(message.guild.id, { whitelist: config.whitelist });
      return message.reply(`✅ **${target.tag}** a été retiré de la whitelist.`);
    }
  },
  {
    name: 'blacklist',
    category: 'owner',
    description: "Bannit un utilisateur de l'utilisation du bot.",
    async execute(message, args, client) {
      const target = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
      if (!target) return message.reply("❌ Veuillez mentionner un utilisateur ou donner son ID.");

      const globalData = client.db.getGlobalData();
      if (!globalData.blacklist) globalData.blacklist = [];
      if (globalData.blacklist.includes(target.id)) return message.reply("❌ Cet utilisateur est déjà blacklisté.");

      globalData.blacklist.push(target.id);
      client.db.updateGlobalData({ blacklist: globalData.blacklist });
      return message.reply(`✅ **${target.tag}** a été blacklisté globalement.`);
    }
  },
  {
    name: 'unblacklist',
    category: 'owner',
    description: "Retire un utilisateur de la blacklist.",
    async execute(message, args, client) {
      if (!args[0]) return message.reply("❌ Veuillez fournir l'ID ou mentionner l'utilisateur.");
      const targetId = args[0].replace(/[<@!>]/g, '');

      const globalData = client.db.getGlobalData();
      if (!globalData.blacklist || !globalData.blacklist.includes(targetId)) {
        return message.reply("❌ Cet utilisateur n'est pas blacklisté.");
      }

      globalData.blacklist = globalData.blacklist.filter(id => id !== targetId);
      client.db.updateGlobalData({ blacklist: globalData.blacklist });
      return message.reply(`✅ L'utilisateur avec l'ID **${targetId}** a été retiré de la blacklist.`);
    }
  },
  {
    name: 'alias',
    category: 'owner',
    description: "Crée un alias temporaire pour une commande.",
    async execute(message, args, client) {
      const aliasName = args[0];
      const cmdName = args[1];
      if (!aliasName || !cmdName) return message.reply("❌ Usage: `+alias <alias> <commande>`");

      const command = client.prefixCommands.get(cmdName);
      if (!command) return message.reply("❌ La commande d'origine n'existe pas.");

      client.prefixCommands.set(aliasName, command);
      return message.reply(`✅ Alias \`${aliasName}\` créé pour la commande \`${cmdName}\`.`);
    }
  },
  {
    name: 'disable',
    category: 'owner',
    description: "Désactive/réactive une commande sur ce serveur.",
    async execute(message, args, client) {
      const cmdName = args[0]?.toLowerCase();
      if (!cmdName) return message.reply("❌ Veuillez spécifier le nom d'une commande à désactiver.");
      if (cmdName === 'disable' || cmdName === 'config') return message.reply("❌ Cette commande ne peut pas être désactivée.");

      const config = client.db.getGuildConfig(message.guild.id);
      if (!config.disabledCommands) config.disabledCommands = [];

      if (config.disabledCommands.includes(cmdName)) {
        config.disabledCommands = config.disabledCommands.filter(name => name !== cmdName);
        client.db.updateGuildConfig(message.guild.id, { disabledCommands: config.disabledCommands });
        return message.reply(`✅ La commande \`${cmdName}\` a été réactivée.`);
      } else {
        config.disabledCommands.push(cmdName);
        client.db.updateGuildConfig(message.guild.id, { disabledCommands: config.disabledCommands });
        return message.reply(`✅ La commande \`${cmdName}\` a été désactivée.`);
      }
    }
  }
];
