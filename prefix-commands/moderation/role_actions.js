const { PermissionFlagsBits } = require('discord.js');

module.exports = [
  {
    name: 'addrole',
    category: 'moderation',
    description: "Attribue un rôle à un membre.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
        return message.reply("❌ Permission insuffisante.");
      }

      const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
      const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);

      if (!member || !role) return message.reply("❌ Usage: `+addrole @user @role` (ou ID)");

      try {
        await member.roles.add(role);
        return message.reply(`✅ Le rôle **${role.name}** a été attribué à **${member.user.username}**.`);
      } catch (err) {
        return message.reply("❌ Impossible d'ajouter le rôle (rôle supérieur au bot ou permissions manquantes).");
      }
    }
  },
  {
    name: 'removerole',
    category: 'moderation',
    description: "Retire un rôle à un membre.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
        return message.reply("❌ Permission insuffisante.");
      }

      const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
      const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);

      if (!member || !role) return message.reply("❌ Usage: `+removerole @user @role` (ou ID)");

      try {
        await member.roles.remove(role);
        return message.reply(`✅ Le rôle **${role.name}** a été retiré à **${member.user.username}**.`);
      } catch (err) {
        return message.reply("❌ Impossible de retirer le rôle.");
      }
    }
  },
  {
    name: 'derank',
    category: 'moderation',
    description: "Retire tous les rôles d'un membre.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
        return message.reply("❌ Permission insuffisante.");
      }

      const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
      if (!member) return message.reply("❌ Spécifiez un membre.");

      try {
        const rolesToRemove = member.roles.cache.filter(r => r.id !== message.guild.id && r.managed === false);
        await member.roles.remove(rolesToRemove);
        return message.reply(`✅ Tous les rôles de **${member.user.username}** ont été retirés.`);
      } catch (err) {
        return message.reply("❌ Impossible de retirer les rôles.");
      }
    }
  },
  {
    name: 'massrole',
    category: 'moderation',
    description: "Attribue ou retire un rôle à tous les membres du serveur.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return message.reply("❌ Seuls les administrateurs peuvent utiliser cette commande.");
      }

      const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
      const action = args[1]?.toLowerCase(); // add / remove

      if (!role || !action || (action !== 'add' && action !== 'remove')) {
        return message.reply("❌ Usage: `+massrole @role [add/remove]`");
      }

      await message.reply("⚙️ Modification en masse démarrée... (Cela peut prendre du temps)");

      const members = await message.guild.members.fetch();
      let count = 0;
      for (const [id, m] of members) {
        try {
          if (action === 'add' && !m.roles.cache.has(role.id)) {
            await m.roles.add(role);
            count++;
          } else if (action === 'remove' && m.roles.cache.has(role.id)) {
            await m.roles.remove(role);
            count++;
          }
        } catch (e) {
          // Ignorer les erreurs individuelles (ex: bot n'a pas accès au proprio)
        }
      }

      return message.channel.send(`✅ Rôle mis à jour pour **${count}** membres.`);
    }
  },
  {
    name: 'temprole',
    category: 'moderation',
    description: "Attribue un rôle temporairement.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
        return message.reply("❌ Permission insuffisante.");
      }

      const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
      const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
      const durationStr = args[2];

      if (!member || !role || !durationStr) return message.reply("❌ Usage: `+temprole @user @role <durée (ex: 10m, 1h)>`");

      let durationMs = parseInt(durationStr);
      if (durationStr.endsWith('s')) durationMs *= 1000;
      else if (durationStr.endsWith('m')) durationMs *= 60000;
      else if (durationStr.endsWith('h')) durationMs *= 3600000;
      else durationMs *= 60000; // minutes par défaut

      try {
        await member.roles.add(role);
        message.reply(`✅ Rôle **${role.name}** ajouté à **${member.user.username}** pour **${durationStr}**.`);
        setTimeout(async () => {
          await member.roles.remove(role).catch(() => {});
        }, durationMs);
      } catch (err) {
        return message.reply("❌ Impossible de gérer ce rôle.");
      }
    }
  },
  {
    name: 'nickname',
    category: 'moderation',
    description: "Change le pseudo d'un membre.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageNicknames)) {
        return message.reply("❌ Permission insuffisante.");
      }

      const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
      const nick = args.slice(1).join(' ');

      if (!member || !nick) return message.reply("❌ Usage: `+nickname @user <nouveau pseudo>`");

      try {
        await member.setNickname(nick);
        return message.reply(`✅ Pseudo de **${member.user.username}** changé en **${nick}**.`);
      } catch (err) {
        return message.reply("❌ Impossible de changer le pseudo.");
      }
    }
  }
];
