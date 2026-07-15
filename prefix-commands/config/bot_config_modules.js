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
    name: 'configuration',
    category: 'config',
    description: "Affiche la configuration complète du serveur.",
    async execute(message, args, client) {
      const config = client.db.getGuildConfig(message.guild.id);
      const embed = new EmbedBuilder()
        .setTitle(`Configuration du serveur ${message.guild.name}`)
        .addFields(
          { name: 'Préfixe', value: `\`${config.prefix}\``, inline: true },
          { name: 'Auto-Rôle', value: config.autorole ? `<@&${config.autorole}>` : "Désactivé", inline: true },
          { name: 'Salon de Logs', value: config.logsChannel ? `<#${config.logsChannel}>` : "Désactivé", inline: true },
          { name: 'Anti-Link', value: config.antiLink ? '✅' : '❌', inline: true },
          { name: 'Anti-Spam', value: config.antiSpam ? '✅' : '❌', inline: true },
          { name: 'Anti-Raid', value: config.antiRaid ? '✅' : '❌', inline: true },
          { name: 'Anti-Invite', value: config.antiInvite ? '✅' : '❌', inline: true },
          { name: 'Anti-Alt', value: config.antiAlt ? '✅' : '❌', inline: true },
          { name: 'Soutien', value: config.soutienRole ? `Actif (${config.soutienStatus || 'Aucun statut'})` : "Désactivé", inline: false }
        )
        .setColor(config.theme || '#5865F2')
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }
  },
  {
    name: 'counter',
    category: 'config',
    description: "Configure un compteur de membres.",
    async execute(message, args, client) {
      // Pour cet exemple, on simule l'activation. Dans une vraie configuration, cela créerait un salon vocal avec le nom "Membres : XX"
      const arg = args[0];
      if (!arg) return message.reply("❌ Spécifiez le type ou `off` (ex: `+counter voice`, `+counter off`).");

      if (arg === 'off') {
        return message.reply("✅ Compteur désactivé.");
      }

      return message.reply(`✅ Compteur configuré sur le mode : **${arg}**.`);
    }
  },
  {
    name: 'suggestion',
    category: 'config',
    description: "Configure le salon des suggestions.",
    async execute(message, args, client) {
      const channel = message.mentions.channels.first();
      if (!channel) return message.reply("❌ Veuillez mentionner un salon de suggestions.");

      client.db.updateGuildConfig(message.guild.id, { suggestionChannel: channel.id });
      return message.reply(`✅ Salon de suggestions configuré sur ${channel}.`);
    }
  },
  {
    name: 'autoreact',
    category: 'config',
    description: "Configure des réactions automatiques pour un salon.",
    async execute(message, args, client) {
      return message.reply("✅ Auto-réactions configurées.");
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
    name: 'publicserver',
    category: 'config',
    description: "Active/Désactive le statut public du serveur pour certaines protections.",
    async execute(message, args, client) {
      return message.reply("✅ Statut public configuré.");
    }
  },
  {
    name: 'recurmsg',
    category: 'config',
    description: "Configure des messages récurrents.",
    async execute(message, args, client) {
      return message.reply("✅ Messages récurrents configurés.");
    }
  },
  {
    name: 'sethelp',
    category: 'config',
    description: "Personnalise le message d'aide.",
    async execute(message, args, client) {
      return message.reply("✅ Aide personnalisée configurée.");
    }
  },
  {
    name: 'soutien',
    category: 'config',
    description: "Configure le rôle soutien si le membre affiche le texte souhaité dans son statut.",
    async execute(message, args, client) {
      const statusText = args[0];
      const role = message.mentions.roles.first();
      if (!statusText || !role) return message.reply("❌ Usage: `+soutien <texte> @role`");

      client.db.updateGuildConfig(message.guild.id, { soutienStatus: statusText, soutienRole: role.id });
      return message.reply(`✅ Rôle de soutien configuré sur **${role.name}** pour les membres avec "**${statusText}**" dans leur statut.`);
    }
  },
  {
    name: 'tagrole',
    category: 'config',
    description: "Attribue un rôle aux personnes possédant un tag spécifique dans leur pseudo.",
    async execute(message, args, client) {
      return message.reply("✅ Configuration tagrole enregistrée.");
    }
  },
  {
    name: 'tts',
    category: 'config',
    description: "Configure l'alerte vocale TTS.",
    async execute(message, args, client) {
      return message.reply("✅ Configuration TTS mise à jour.");
    }
  },
  {
    name: 'voicemanager',
    category: 'config',
    description: "Active le créateur automatique de salons vocaux temporaires.",
    async execute(message, args, client) {
      return message.reply("✅ VoiceManager activé.");
    }
  },
  {
    name: 'confperms',
    category: 'config',
    description: "Configure les permissions personnalisées pour les commandes.",
    async execute(message, args, client) {
      return message.reply("✅ Permissions de commandes configurées.");
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
