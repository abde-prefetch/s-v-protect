const { PermissionFlagsBits } = require('discord.js');

module.exports = [
  {
    name: 'clear',
    category: 'moderation',
    description: "Supprime un nombre donné de messages.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
        return message.reply("❌ Permission insuffisante.");
      }

      const amount = parseInt(args[0]);
      if (isNaN(amount) || amount < 1 || amount > 100) {
        return message.reply("❌ Veuillez spécifier un nombre entre 1 et 100.");
      }

      await message.channel.bulkDelete(amount, true);
      const res = await message.channel.send(`✅ ${amount} messages supprimés.`);
      setTimeout(() => res.delete().catch(() => {}), 3000);
    }
  },
  {
    name: 'clearuser',
    category: 'moderation',
    description: "Supprime les messages d'un utilisateur spécifique dans le salon.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
        return message.reply("❌ Permission insuffisante.");
      }

      const target = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
      const amount = parseInt(args[1]) || 50;

      if (!target) return message.reply("❌ Usage: `+clearuser @user [nombre (max 100)]`");

      const messages = await message.channel.messages.fetch({ limit: 100 });
      const userMessages = messages.filter(m => m.author.id === target.id).first(amount);

      await message.channel.bulkDelete(userMessages, true);
      const res = await message.channel.send(`✅ Messages de **${target.tag}** nettoyés.`);
      setTimeout(() => res.delete().catch(() => {}), 3000);
    }
  },
  {
    name: 'clearall',
    category: 'moderation',
    description: "Vide entièrement le salon (bulkdelete tout ce qui est possible).",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply("❌ Permission insuffisante.");
      }

      const position = message.channel.position;
      const newChannel = await message.channel.clone();
      await message.channel.delete();
      await newChannel.setPosition(position);
      await newChannel.send("✅ Salon recréé et vidé.");
    }
  },
  {
    name: 'lock',
    category: 'moderation',
    description: "Verrouille le salon.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply("❌ Permission insuffisante.");
      }

      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: false
      });
      return message.reply("🔒 Salon verrouillé.");
    }
  },
  {
    name: 'unlock',
    category: 'moderation',
    description: "Déverrouille le salon.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply("❌ Permission insuffisante.");
      }

      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: null
      });
      return message.reply("🔓 Salon déverrouillé.");
    }
  },
  {
    name: 'lockall',
    category: 'moderation',
    description: "Verrouille tous les salons textuels.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply("❌ Permission insuffisante.");
      }

      const channels = message.guild.channels.cache.filter(c => c.isTextBits());
      for (const [id, c] of channels) {
        await c.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false }).catch(() => {});
      }
      return message.reply("🔒 Tous les salons ont été verrouillés.");
    }
  },
  {
    name: 'unlockall',
    category: 'moderation',
    description: "Déverrouille tous les salons textuels.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply("❌ Permission insuffisante.");
      }

      const channels = message.guild.channels.cache.filter(c => c.isTextBits());
      for (const [id, c] of channels) {
        await c.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: null }).catch(() => {});
      }
      return message.reply("🔓 Tous les salons ont été déverrouillés.");
    }
  },
  {
    name: 'slow',
    category: 'moderation',
    description: "Modifie le mode lent (slowmode) du salon.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply("❌ Permission insuffisante.");
      }

      const seconds = parseInt(args[0]);
      if (isNaN(seconds)) return message.reply("❌ Spécifiez le nombre de secondes (ou 0 pour désactiver).");

      await message.channel.setRateLimitPerUser(seconds);
      return message.reply(`⏳ Mode lent configuré sur **${seconds}** secondes.`);
    }
  },
  {
    name: 'hide',
    category: 'moderation',
    description: "Masque le salon aux yeux des membres.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply("❌ Permission insuffisante.");
      }

      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        ViewChannel: false
      });
      return message.reply("👁️ Salon masqué.");
    }
  },
  {
    name: 'unhide',
    category: 'moderation',
    description: "Rend le salon visible à nouveau.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply("❌ Permission insuffisante.");
      }

      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        ViewChannel: null
      });
      return message.reply("👁️ Salon de nouveau visible.");
    }
  },
  {
    name: 'hideall',
    category: 'moderation',
    description: "Masque tous les salons.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply("❌ Permission insuffisante.");
      }

      const channels = message.guild.channels.cache.filter(c => c.isTextBits());
      for (const [id, c] of channels) {
        await c.permissionOverwrites.edit(message.guild.roles.everyone, { ViewChannel: false }).catch(() => {});
      }
      return message.reply("👁️ Tous les salons ont été masqués.");
    }
  },
  {
    name: 'unhideall',
    category: 'moderation',
    description: "Rend tous les salons de nouveau visibles.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply("❌ Permission insuffisante.");
      }

      const channels = message.guild.channels.cache.filter(c => c.isTextBits());
      for (const [id, c] of channels) {
        await c.permissionOverwrites.edit(message.guild.roles.everyone, { ViewChannel: null }).catch(() => {});
      }
      return message.reply("👁️ Tous les salons sont de nouveau visibles.");
    }
  },
  {
    name: 'renew',
    category: 'moderation',
    description: "Recrée le salon actuel en supprimant l'ancien.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply("❌ Permission insuffisante.");
      }

      const clone = await message.channel.clone();
      await message.channel.delete();
      await clone.send("🔄 Salon recréé (renew).");
    }
  }
];
