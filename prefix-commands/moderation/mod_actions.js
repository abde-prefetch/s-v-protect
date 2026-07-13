const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Simple map en mémoire pour stocker les infractions. Dans un vrai bot, cela devrait être sauvegardé dans database.json
const infractionsMap = new Map();

module.exports = [
  {
    name: 'ban',
    category: 'moderation',
    description: "Bannit un membre du serveur.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
        return message.reply("❌ Vous n'avez pas la permission de bannir des membres.");
      }

      const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
      if (!target) return message.reply("❌ Veuillez mentionner un membre ou donner son ID.");
      if (target.roles.highest.position >= message.member.roles.highest.position) {
        return message.reply("❌ Vous ne pouvez pas bannir ce membre car son rôle est supérieur ou égal au vôtre.");
      }

      const reason = args.slice(1).join(' ') || 'Aucune raison spécifiée';
      await target.ban({ reason });
      return message.reply(`✅ **${target.user.tag}** a été banni pour : ${reason}`);
    }
  },
  {
    name: 'tempban',
    category: 'moderation',
    description: "Bannit temporairement un membre.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
        return message.reply("❌ Vous n'avez pas la permission de bannir des membres.");
      }

      const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
      const durationStr = args[1];
      if (!target || !durationStr) return message.reply("❌ Usage: `+tempban @user <durée en secondes/minutes/heures: e.g. 60s, 10m, 2h> [raison]`");

      let durationMs = parseInt(durationStr);
      if (durationStr.endsWith('s')) durationMs *= 1000;
      else if (durationStr.endsWith('m')) durationMs *= 60000;
      else if (durationStr.endsWith('h')) durationMs *= 3600000;
      else durationMs *= 1000; // secondes par défaut

      if (isNaN(durationMs)) return message.reply("❌ Durée invalide.");

      const reason = args.slice(2).join(' ') || 'Ban temporaire';
      await target.ban({ reason });
      message.reply(`✅ **${target.user.tag}** a été banni pour **${durationStr}**.`);

      setTimeout(async () => {
        await message.guild.members.unban(target.id, 'Fin du ban temporaire').catch(() => {});
      }, durationMs);
    }
  },
  {
    name: 'unban',
    category: 'moderation',
    description: "Débannit un membre avec son ID.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
        return message.reply("❌ Vous n'avez pas la permission.");
      }

      const id = args[0];
      if (!id) return message.reply("❌ Spécifiez l'ID de l'utilisateur à débannir.");

      try {
        await message.guild.members.unban(id);
        return message.reply(`✅ L'utilisateur avec l'ID **${id}** a été débanni.`);
      } catch (err) {
        return message.reply("❌ Impossible de débannir cet ID (non banni ou ID invalide).");
      }
    }
  },
  {
    name: 'kick',
    category: 'moderation',
    description: "Expulse un membre du serveur.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
        return message.reply("❌ Vous n'avez pas la permission.");
      }

      const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
      if (!target) return message.reply("❌ Spécifiez un membre.");
      if (target.roles.highest.position >= message.member.roles.highest.position) {
        return message.reply("❌ Rôle égal ou supérieur au vôtre.");
      }

      const reason = args.slice(1).join(' ') || 'Aucune raison';
      await target.kick(reason);
      return message.reply(`✅ **${target.user.tag}** a été expulsé.`);
    }
  },
  {
    name: 'mute',
    category: 'moderation',
    description: "Exclut temporairement (timeout) un membre.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
        return message.reply("❌ Permission insuffisante.");
      }

      const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
      const durationStr = args[1];
      if (!target || !durationStr) return message.reply("❌ Usage: `+mute @user <durée (ex: 10m, 1h)> [raison]`");

      let durationMs = parseInt(durationStr);
      if (durationStr.endsWith('s')) durationMs *= 1000;
      else if (durationStr.endsWith('m')) durationMs *= 60000;
      else if (durationStr.endsWith('h')) durationMs *= 3600000;
      else durationMs *= 60000; // minutes par défaut

      if (isNaN(durationMs)) return message.reply("❌ Durée invalide.");

      const reason = args.slice(2).join(' ') || 'Mute temporaire';
      await target.timeout(durationMs, reason);
      return message.reply(`✅ **${target.user.tag}** a été muté pour **${durationStr}**.`);
    }
  },
  {
    name: 'unmute',
    category: 'moderation',
    description: "Retire le mute (timeout) d'un membre.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
        return message.reply("❌ Permission insuffisante.");
      }

      const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
      if (!target) return message.reply("❌ Spécifiez un membre.");

      await target.timeout(null);
      return message.reply(`✅ Le mute de **${target.user.tag}** a été retiré.`);
    }
  },
  {
    name: 'warn',
    category: 'moderation',
    description: "Avertit un membre.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
        return message.reply("❌ Pas de permission.");
      }

      const target = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
      if (!target) return message.reply("❌ Spécifiez un utilisateur.");

      const reason = args.slice(1).join(' ') || 'Aucune raison';

      if (!infractionsMap.has(target.id)) infractionsMap.set(target.id, []);
      const warns = infractionsMap.get(target.id);
      
      const warnId = warns.length + 1;
      warns.push({ id: warnId, reason, date: new Date().toLocaleDateString() });

      return message.reply(`✅ **${target.tag}** a été averti (Warn ID: ${warnId}) pour : ${reason}`);
    }
  },
  {
    name: 'unwarn',
    category: 'moderation',
    description: "Retire un avertissement d'un membre.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
        return message.reply("❌ Pas de permission.");
      }

      const target = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
      const warnId = parseInt(args[1]);

      if (!target || isNaN(warnId)) return message.reply("❌ Usage: `+unwarn @user <ID du warn>`");

      const warns = infractionsMap.get(target.id);
      if (!warns || warns.length === 0) return message.reply("❌ Cet utilisateur n'a aucun avertissement.");

      const index = warns.findIndex(w => w.id === warnId);
      if (index === -1) return message.reply("❌ Cet ID d'avertissement n'existe pas.");

      warns.splice(index, 1);
      return message.reply(`✅ Avertissement #${warnId} retiré pour **${target.tag}**.`);
    }
  },
  {
    name: 'infractions',
    category: 'moderation',
    description: "Affiche la liste des infractions d'un membre.",
    async execute(message, args, client) {
      const target = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null) || message.author;
      const warns = infractionsMap.get(target.id) || [];

      const list = warns.map(w => `• **#${w.id}** - ${w.reason} (${w.date})`).join('\n') || 'Aucune infraction.';
      const embed = new EmbedBuilder()
        .setTitle(`Infractions de ${target.username}`)
        .setDescription(list)
        .setColor(client.db.getGuildConfig(message.guild.id).theme || '#5865F2')
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }
  }
];
