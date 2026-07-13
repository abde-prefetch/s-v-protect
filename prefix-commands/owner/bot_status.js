const { ActivityType } = require('discord.js');

let rotatorInterval = null;

module.exports = [
  {
    name: 'playing',
    category: 'owner',
    description: "Définit le statut 'Joue à' du bot.",
    async execute(message, args, client) {
      if (rotatorInterval) clearInterval(rotatorInterval);
      const text = args.join(' ');
      if (!text) return message.reply("❌ Veuillez spécifier le texte du statut.");
      client.user.setActivity(text, { type: ActivityType.Playing });
      return message.reply(`✅ Statut mis à jour : **Joue à ${text}**`);
    }
  },
  {
    name: 'watching',
    category: 'owner',
    description: "Définit le statut 'Regarde' du bot.",
    async execute(message, args, client) {
      if (rotatorInterval) clearInterval(rotatorInterval);
      const text = args.join(' ');
      if (!text) return message.reply("❌ Veuillez spécifier le texte du statut.");
      client.user.setActivity(text, { type: ActivityType.Watching });
      return message.reply(`✅ Statut mis à jour : **Regarde ${text}**`);
    }
  },
  {
    name: 'streaming',
    category: 'owner',
    description: "Définit le statut 'En streaming' du bot.",
    async execute(message, args, client) {
      if (rotatorInterval) clearInterval(rotatorInterval);
      const url = args.pop();
      const text = args.join(' ');
      if (!text || !url) return message.reply("❌ Usage: `+streaming <texte> <url_twitch>`");
      client.user.setActivity(text, { type: ActivityType.Streaming, url: url });
      return message.reply(`✅ Statut mis à jour : **Streame ${text}**`);
    }
  },
  {
    name: 'competing',
    category: 'owner',
    description: "Définit le statut 'Participe à' du bot.",
    async execute(message, args, client) {
      if (rotatorInterval) clearInterval(rotatorInterval);
      const text = args.join(' ');
      if (!text) return message.reply("❌ Veuillez spécifier le texte du statut.");
      client.user.setActivity(text, { type: ActivityType.Competing });
      return message.reply(`✅ Statut mis à jour : **Participe à ${text}**`);
    }
  },
  {
    name: 'resetstatut',
    category: 'owner',
    description: "Réinitialise le statut du bot.",
    async execute(message, args, client) {
      if (rotatorInterval) clearInterval(rotatorInterval);
      client.user.setPresence({ activities: [], status: 'online' });
      return message.reply("✅ Statut réinitialisé.");
    }
  },
  {
    name: 'statutrotator',
    category: 'owner',
    description: "Met en place une rotation de statuts.",
    async execute(message, args, client) {
      if (rotatorInterval) clearInterval(rotatorInterval);
      // Format: +statutrotator <intervalle_sec> <statut1> | <statut2>
      const intervalSec = parseInt(args.shift());
      if (isNaN(intervalSec) || args.length === 0) {
        return message.reply("❌ Usage: `+statutrotator <secondes> <statut1> | <statut2> | ...`");
      }

      const rawStatuses = args.join(' ').split('|').map(s => s.trim());
      if (rawStatuses.length < 2) return message.reply("❌ Il faut au moins 2 statuts séparés par `|`.");

      let currentIndex = 0;
      client.user.setActivity(rawStatuses[currentIndex], { type: ActivityType.Custom });

      rotatorInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % rawStatuses.length;
        client.user.setActivity(rawStatuses[currentIndex], { type: ActivityType.Custom });
      }, intervalSec * 1000);

      return message.reply(`✅ Rotation de statuts activée toutes les ${intervalSec} secondes pour ${rawStatuses.length} statuts.`);
    }
  },
  {
    name: 'setname',
    category: 'owner',
    description: "Renomme le bot.",
    async execute(message, args, client) {
      const name = args.join(' ');
      if (!name) return message.reply("❌ Spécifiez le nouveau nom.");
      try {
        await client.user.setUsername(name);
        return message.reply(`✅ Le bot a été renommé en **${name}**.`);
      } catch (err) {
        return message.reply("❌ Impossible de changer le nom (limite de l'API Discord).");
      }
    }
  },
  {
    name: 'setpic',
    category: 'owner',
    description: "Modifie la photo de profil du bot.",
    async execute(message, args, client) {
      const url = args[0] || (message.attachments.first() ? message.attachments.first().url : null);
      if (!url) return message.reply("❌ Spécifiez une URL d'image ou attachez une image.");
      try {
        await client.user.setAvatar(url);
        return message.reply("✅ Photo de profil mise à jour.");
      } catch (err) {
        return message.reply("❌ Impossible de changer la photo de profil.");
      }
    }
  }
];
