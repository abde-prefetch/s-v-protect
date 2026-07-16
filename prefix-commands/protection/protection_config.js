const { PermissionFlagsBits } = require('discord.js');

module.exports = [
  {
    name: 'antiinvite',
    category: 'protection',
    description: "Active ou désactive l'anti-invitation.",
    async execute(message, args, client) {
      const opt = args[0]?.toLowerCase();
      if (opt !== 'on' && opt !== 'off') return message.reply("❌ Usage: `+antiinvite on` ou `+antiinvite off`");

      client.db.updateGuildConfig(message.guild.id, { antiInvite: opt === 'on' });
      return message.reply(`✅ L'anti-invitation est désormais : **${opt === 'on' ? 'Activé' : 'Désactivé'}**.`);
    }
  },
  {
    name: 'antilink',
    category: 'protection',
    description: "Active ou désactive l'anti-lien.",
    async execute(message, args, client) {
      const opt = args[0]?.toLowerCase();
      if (opt !== 'on' && opt !== 'off') return message.reply("❌ Usage: `+antilink on` ou `+antilink off`");

      client.db.updateGuildConfig(message.guild.id, { antiLink: opt === 'on' });
      return message.reply(`✅ L'anti-lien est désormais : **${opt === 'on' ? 'Activé' : 'Désactivé'}**.`);
    }
  },
  {
    name: 'antispam',
    category: 'protection',
    description: "Active ou désactive l'anti-spam.",
    async execute(message, args, client) {
      const opt = args[0]?.toLowerCase();
      if (opt !== 'on' && opt !== 'off') return message.reply("❌ Usage: `+antispam on` ou `+antispam off`");

      client.db.updateGuildConfig(message.guild.id, { antiSpam: opt === 'on' });
      return message.reply(`✅ L'anti-spam est désormais : **${opt === 'on' ? 'Activé' : 'Désactivé'}**.`);
    }
  },
  {
    name: 'badwords',
    category: 'protection',
    description: "Gère les mots interdits sur le serveur.",
    async execute(message, args, client) {
      const action = args[0]?.toLowerCase();
      const word = args.slice(1).join(' ');

      const config = client.db.getGuildConfig(message.guild.id);
      if (!config.badwords) config.badwords = [];

      if (action === 'add' && word) {
        if (config.badwords.includes(word)) return message.reply("❌ Ce mot est déjà interdit.");
        config.badwords.push(word);
        client.db.updateGuildConfig(message.guild.id, { badwords: config.badwords });
        return message.reply(`✅ Le mot "**${word}**" a été interdit.`);
      } else if (action === 'remove' && word) {
        if (!config.badwords.includes(word)) return message.reply("❌ Ce mot n'est pas dans la liste.");
        config.badwords = config.badwords.filter(w => w !== word);
        client.db.updateGuildConfig(message.guild.id, { badwords: config.badwords });
        return message.reply(`✅ Le mot "**${word}**" n'est plus interdit.`);
      } else {
        return message.reply(`Mots interdits : ${config.badwords.map(w => `\`${w}\``).join(', ') || "Aucun"}\nUsage: \`+badwords add <mot>\` ou \`+badwords remove <mot>\``);
      }
    }
  },
];
