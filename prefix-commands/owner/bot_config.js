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
    name: 'perms',
    category: 'owner',
    description: "Affiche la whitelist du serveur.",
    async execute(message, args, client) {
      const config = client.db.getGuildConfig(message.guild.id);
      const whitelistMembers = config.whitelist.map(id => `<@${id}> (${id})`).join('\n') || 'Aucun membre whitelisté';

      const embed = new EmbedBuilder()
        .setTitle('Whitelist du serveur')
        .setDescription(whitelistMembers)
        .setColor(config.theme || '#5865F2')
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }
  },
  {
    name: 'setperm',
    category: 'owner',
    description: "Attribue un rôle d'administration ou de modération dans la config.",
    async execute(message, args, client) {
      // Pour cet exemple, on gère les rôles configurés (ownerRoles ou adminRoles)
      const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
      const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

      if (!target || !role) return message.reply("❌ Usage: `+setperm @user @role` ou ID");

      try {
        await target.roles.add(role);
        return message.reply(`✅ Rôle **${role.name}** ajouté à **${target.user.username}**.`);
      } catch (err) {
        return message.reply("❌ Impossible de rajouter ce rôle.");
      }
    }
  },
  {
    name: 'delperm',
    category: 'owner',
    description: "Retire un rôle à un utilisateur.",
    async execute(message, args, client) {
      const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
      const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

      if (!target || !role) return message.reply("❌ Usage: `+delperm @user @role` ou ID");

      try {
        await target.roles.remove(role);
        return message.reply(`✅ Rôle **${role.name}** retiré à **${target.user.username}**.`);
      } catch (err) {
        return message.reply("❌ Impossible de retirer ce rôle.");
      }
    }
  },
  {
    name: 'newperm',
    category: 'owner',
    description: "Remplace tous les rôles de l'utilisateur par un seul.",
    async execute(message, args, client) {
      const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
      const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

      if (!target || !role) return message.reply("❌ Usage: `+newperm @user @role` ou ID");

      try {
        await target.roles.set([role]);
        return message.reply(`✅ Rôles de **${target.user.username}** remplacés par **${role.name}**.`);
      } catch (err) {
        return message.reply("❌ Impossible de modifier les rôles.");
      }
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
      // Simplement stocké en mémoire pour la session actuelle
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
    description: "Désactive une commande sur ce serveur.",
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
  },
  {
    name: 'serverlist',
    category: 'owner',
    description: "Affiche la liste des serveurs où se trouve le bot.",
    async execute(message, args, client) {
      const list = client.guilds.cache.map(g => `• **${g.name}** (${g.id}) - ${g.memberCount} membres`).join('\n');
      const embed = new EmbedBuilder()
        .setTitle('Liste des serveurs')
        .setDescription(list.slice(0, 4096) || 'Aucun serveur')
        .setColor(client.db.getGuildConfig(message.guild.id).theme || '#5865F2');

      return message.reply({ embeds: [embed] });
    }
  },
  {
    name: 'theme',
    category: 'owner',
    description: "Modifie la couleur par défaut des embeds du bot.",
    async execute(message, args, client) {
      const color = args[0];
      if (!color || !/^#[0-9A-F]{6}$/i.test(color)) {
        return message.reply("❌ Veuillez spécifier une couleur hexadécimale valide (Ex: `#FF0000`).");
      }
      client.db.updateGuildConfig(message.guild.id, { theme: color });
      return message.reply(`✅ La couleur par défaut a été changée en : \`${color}\``);
    }
  }
];
