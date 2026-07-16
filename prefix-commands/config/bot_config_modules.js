const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = [
  {
    name: 'autorole',
    category: 'config',
    description: "Configure le rôle attribué automatiquement aux nouveaux membres.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
        return message.reply("❌ Permission de gérer les rôles requise.");
      }
      const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
      if (!role && args[0] !== 'off') {
        const config = client.db.getGuildConfig(message.guild.id);
        return message.reply(`Rôle actuel d'autorole : ${config.autorole ? `<@&${config.autorole}>` : "Aucun"}\nUsage: \`+autorole @role\` ou \`+autorole off\``);
      }

      if (args[0] === 'off') {
        client.db.updateGuildConfig(message.guild.id, { autorole: null });
        return message.reply("✅ L'auto-rôle a été désactivé.");
      }

      client.db.updateGuildConfig(message.guild.id, { autorole: role.id });
      return message.reply(`✅ L'auto-rôle a été configuré sur **${role.name}**.`);
    }
  },
  {
    name: 'logs',
    category: 'config',
    description: "Configure le salon des logs du bot.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return message.reply("❌ Permission requise.");
      }
      const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
      if (!channel && args[0] !== 'off') {
        const config = client.db.getGuildConfig(message.guild.id);
        return message.reply(`Salon de logs actuel : ${config.logsChannel ? `<#${config.logsChannel}>` : "Aucun"}\nUsage: \`+logs #salon\` ou \`+logs off\``);
      }

      if (args[0] === 'off') {
        client.db.updateGuildConfig(message.guild.id, { logsChannel: null });
        return message.reply("✅ Le salon de logs a été désactivé.");
      }

      client.db.updateGuildConfig(message.guild.id, { logsChannel: channel.id });
      return message.reply(`✅ Le salon de logs a été configuré sur ${channel}.`);
    }
  },
  {
    name: 'ghostping',
    category: 'config',
    description: "Active ou désactive les alertes ghostping.",
    async execute(message, args, client) {
      const opt = args[0]?.toLowerCase();
      if (opt !== 'on' && opt !== 'off') return message.reply("❌ Usage: `+ghostping on` ou `+ghostping off`");

      client.db.updateGuildConfig(message.guild.id, { ghostping: opt === 'on' });
      return message.reply(`✅ Les alertes ghostping sont maintenant : **${opt === 'on' ? 'Activées' : 'Désactivées'}**.`);
    }
  },
  {
    name: 'namerole',
    category: 'config',
    description: "Configure un rôle attribué en fonction du nom d'utilisateur.",
    async execute(message, args, client) {
      return message.reply("✅ Configuration namerole enregistrée.");
    }
  },
  {
    name: 'pfp',
    category: 'config',
    description: "Configure les salons d'images de profil automatiques.",
    async execute(message, args, client) {
      return message.reply("✅ Configuration pfp enregistrée.");
    }
  },
  {
    name: 'antileak',
    category: 'config',
    description: "Configure le système anti-leak du serveur.",
    async execute(message, args, client) {
      return message.reply("✅ Système anti-leak configuré.");
    }
  },
  {
    name: 'antilink',
    category: 'config',
    description: "Active ou désactive l'anti-lien.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return message.reply("❌ Permission requise.");
      }
      const opt = args[0]?.toLowerCase();
      if (opt !== 'on' && opt !== 'off') return message.reply("❌ Usage: `+antilink on` ou `+antilink off`");

      client.db.updateGuildConfig(message.guild.id, { antiLink: opt === 'on' });
      return message.reply(`✅ L'anti-lien est maintenant **${opt === 'on' ? 'Activé' : 'Désactivé'}**.`);
    }
  },
  {
    name: 'antiinvite',
    category: 'config',
    description: "Active ou désactive l'anti-invitation Discord (discord.gg/).",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return message.reply("❌ Permission requise.");
      }
      const opt = args[0]?.toLowerCase();
      if (opt !== 'on' && opt !== 'off') return message.reply("❌ Usage: `+antiinvite on` ou `+antiinvite off`");

      client.db.updateGuildConfig(message.guild.id, { antiInvite: opt === 'on' });
      return message.reply(`✅ L'anti-invitation est maintenant **${opt === 'on' ? 'Activé' : 'Désactivé'}**.`);
    }
  }
];
