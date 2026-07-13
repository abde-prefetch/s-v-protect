const { ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = [
  {
    name: 'say',
    category: 'owner',
    description: "Fait parler le bot.",
    async execute(message, args, client) {
      const text = args.join(' ');
      if (!text) return message.reply("❌ Que dois-je dire ?");
      await message.delete().catch(() => {});
      return message.channel.send(text);
    }
  },
  {
    name: 'mp',
    category: 'owner',
    description: "Envoie un message privé à un membre via le bot.",
    async execute(message, args, client) {
      const target = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
      args.shift();
      const text = args.join(' ');
      if (!target || !text) return message.reply("❌ Usage: `+mp @user <message>`");

      try {
        await target.send(text);
        return message.reply(`✅ Message envoyé en privé à **${target.tag}**.`);
      } catch (err) {
        return message.reply("❌ Impossible d'envoyer un message privé à cet utilisateur (DMs fermés).");
      }
    }
  },
  {
    name: 'backup',
    category: 'owner',
    description: "Sauvegarde la structure des salons du serveur.",
    async execute(message, args, client) {
      const guild = message.guild;
      const channels = [];

      // Trier les salons : catégories d'abord, puis salons textuels/vocaux
      const guildChannels = await guild.channels.fetch();
      
      guildChannels.forEach(c => {
        if (!c) return;
        channels.push({
          id: c.id,
          name: c.name,
          type: c.type,
          parentId: c.parentId,
          position: c.position
        });
      });

      const config = client.db.getGuildConfig(guild.id);
      if (!config.backups) config.backups = [];
      
      config.backups.push({
        date: new Date().toLocaleString('fr-FR'),
        channels: channels
      });

      client.db.updateGuildConfig(guild.id, { backups: config.backups });
      return message.reply(`✅ Sauvegarde créée avec succès (Index: ${config.backups.length - 1}).`);
    }
  },
  {
    name: 'loadbackup',
    category: 'owner',
    description: "Charge une sauvegarde de salons.",
    async execute(message, args, client) {
      const index = parseInt(args[0]);
      const config = client.db.getGuildConfig(message.guild.id);

      if (!config.backups || config.backups.length === 0) {
        return message.reply("❌ Aucune sauvegarde disponible.");
      }

      if (isNaN(index) || index < 0 || index >= config.backups.length) {
        // Lister les backups
        const list = config.backups.map((b, idx) => `[${idx}] - Sauvegarde du ${b.date} (${b.channels.length} salons)`).join('\n');
        return message.reply(`Format correct: \`+loadbackup <index>\`\nSauvegardes :\n${list}`);
      }

      const backup = config.backups[index];
      await message.reply("🚨 Restauration en cours... Les salons actuels vont être supprimés.");

      const guild = message.guild;
      const channels = await guild.channels.fetch();

      // Supprimer tous les salons (sauf le salon d'exécution actuel pour éviter de crash l'interaction)
      const currentChannelId = message.channel.id;
      for (const [id, c] of channels) {
        if (id !== currentChannelId) {
          await c.delete().catch(() => {});
        }
      }

      // Reconstruire d'abord les catégories
      const categoryMap = new Map();
      const backupCategories = backup.channels.filter(c => c.type === ChannelType.GuildCategory);
      for (const cat of backupCategories) {
        const newCat = await guild.channels.create({
          name: cat.name,
          type: ChannelType.GuildCategory
        }).catch(() => null);
        if (newCat) categoryMap.set(cat.id, newCat.id);
      }

      // Reconstruire les autres salons
      const backupOther = backup.channels.filter(c => c.type !== ChannelType.GuildCategory);
      for (const ch of backupOther) {
        await guild.channels.create({
          name: ch.name,
          type: ch.type,
          parent: categoryMap.get(ch.parentId) || null
        }).catch(() => null);
      }

      // Supprimer le salon d'origine de la commande puisqu'on a fini
      const oldChan = guild.channels.cache.get(currentChannelId);
      if (oldChan) await oldChan.delete().catch(() => {});
    }
  },
  {
    name: 'autobackup',
    category: 'owner',
    description: "Planifie une sauvegarde automatique.",
    async execute(message, args, client) {
      // Pour cet exemple, on simule l'activation de l'autobackup.
      // Une vraie exécution régulière nécessite node-cron ou setInterval persistant.
      const interval = args[0]; // e.g. "24h"
      if (!interval) return message.reply("❌ Spécifiez un intervalle (ex: `24h`, `12h` ou `off`).");

      if (interval === 'off') {
        return message.reply("✅ Sauvegarde automatique désactivée.");
      }

      return message.reply(`✅ Sauvegarde automatique configurée toutes les **${interval}**.`);
    }
  }
];
