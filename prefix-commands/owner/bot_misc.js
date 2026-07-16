const { ChannelType } = require('discord.js');

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
  }
];
