const { PermissionFlagsBits } = require('discord.js');

module.exports = [
  {
    name: 'vkick',
    category: 'moderation',
    description: "Expulse un membre d'un salon vocal.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.MoveMembers)) {
        return message.reply("❌ Permission insuffisante.");
      }

      const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
      if (!target || !target.voice.channel) return message.reply("❌ Le membre doit être connecté dans un salon vocal.");

      try {
        await target.voice.disconnect();
        return message.reply(`✅ **${target.user.username}** a été déconnecté du vocal.`);
      } catch (err) {
        return message.reply("❌ Impossible de le déconnecter.");
      }
    }
  },
  {
    name: 'vkickall',
    category: 'moderation',
    description: "Expulse tout le monde du salon vocal de l'auteur.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.MoveMembers)) {
        return message.reply("❌ Permission insuffisante.");
      }

      const channel = message.member.voice.channel;
      if (!channel) return message.reply("❌ Vous devez être dans un salon vocal.");

      let count = 0;
      for (const [id, m] of channel.members) {
        await m.voice.disconnect().catch(() => {});
        count++;
      }
      return message.reply(`✅ **${count}** membres déconnectés du vocal.`);
    }
  },
  {
    name: 'vmove',
    category: 'moderation',
    description: "Déplace un membre dans un autre salon vocal.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.MoveMembers)) {
        return message.reply("❌ Permission insuffisante.");
      }

      const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
      const channel = message.guild.channels.cache.get(args[1]) || message.guild.channels.cache.find(c => c.name === args[1] && c.isVoiceBased());

      if (!target || !channel) return message.reply("❌ Usage: `+vmove @user <ID_Salon_Vocal>`");

      try {
        await target.voice.setChannel(channel);
        return message.reply(`✅ Déplacé.`);
      } catch (err) {
        return message.reply("❌ Erreur.");
      }
    }
  },
  {
    name: 'vmoveall',
    category: 'moderation',
    description: "Déplace tous les membres d'un salon vocal vers un autre.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.MoveMembers)) {
        return message.reply("❌ Permission insuffisante.");
      }

      const srcChannel = message.guild.channels.cache.get(args[0]);
      const dstChannel = message.guild.channels.cache.get(args[1]);

      if (!srcChannel || !dstChannel) return message.reply("❌ Usage: `+vmoveall <ID_Source> <ID_Cible>`");

      let count = 0;
      for (const [id, m] of srcChannel.members) {
        await m.voice.setChannel(dstChannel).catch(() => {});
        count++;
      }
      return message.reply(`✅ **${count}** membres déplacés de **${srcChannel.name}** à **${dstChannel.name}**.`);
    }
  },
  {
    name: 'find',
    category: 'moderation',
    description: "Cherche des membres contenant le terme recherché dans leur nom.",
    async execute(message, args, client) {
      const term = args.join(' ');
      if (!term) return message.reply("❌ Entrez un terme de recherche.");

      const members = await message.guild.members.fetch();
      const matches = members.filter(m => m.user.username.toLowerCase().includes(term.toLowerCase())).first(20);

      const list = matches.map(m => `• **${m.user.username}** (${m.id})`).join('\n') || 'Aucune correspondance.';
      return message.reply(`Résultats de la recherche :\n${list}`);
    }
  },
  {
    name: 'sync',
    category: 'moderation',
    description: "Synchronise les commandes slash avec Discord.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return message.reply("❌ Permission insuffisante.");
      }

      try {
        const deploy = require('../../deploy-commands.js');
        return message.reply("✅ Déploiement des commandes slash initié.");
      } catch (err) {
        return message.reply("❌ Impossible de recharger deploy-commands.js.");
      }
    }
  },
  {
    name: 'emojiadd',
    category: 'moderation',
    description: "Ajoute un émoji au serveur.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
        return message.reply("❌ Permission insuffisante.");
      }

      const url = args[1] || (message.attachments.first() ? message.attachments.first().url : null);
      const name = args[0];

      if (!name || !url) return message.reply("❌ Usage: `+emojiadd <nom> <url>`");

      try {
        const emoji = await message.guild.emojis.create({ attachment: url, name: name });
        return message.reply(`✅ Émoji ${emoji} créé sous le nom de **${name}**.`);
      } catch (err) {
        return message.reply("❌ Impossible d'ajouter l'émoji (format incorrect ou taille trop lourde).");
      }
    }
  },
  {
    name: 'emojidel',
    category: 'moderation',
    description: "Supprime un émoji du serveur.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
        return message.reply("❌ Permission insuffisante.");
      }

      const emojiInput = args[0];
      if (!emojiInput) return message.reply("❌ Spécifiez l'émoji à supprimer.");

      // Extraire l'ID s'il s'agit d'un émoji personnalisé
      const emojiId = emojiInput.match(/:(\d+)>/)?.[1] || emojiInput;
      const emoji = message.guild.emojis.cache.get(emojiId);

      if (!emoji) return message.reply("❌ Émoji introuvable sur ce serveur.");

      await emoji.delete();
      return message.reply(`✅ Émoji supprimé.`);
    }
  },
  {
    name: 'emojirename',
    category: 'moderation',
    description: "Renomme un émoji du serveur.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
        return message.reply("❌ Permission insuffisante.");
      }

      const emojiInput = args[0];
      const newName = args[1];

      if (!emojiInput || !newName) return message.reply("❌ Usage: `+emojirename <emoji> <nouveau_nom>`");

      const emojiId = emojiInput.match(/:(\d+)>/)?.[1] || emojiInput;
      const emoji = message.guild.emojis.cache.get(emojiId);

      if (!emoji) return message.reply("❌ Émoji introuvable.");

      await emoji.edit({ name: newName });
      return message.reply(`✅ Émoji renommé en **${newName}**.`);
    }
  }
];
