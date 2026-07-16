const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'setticketimage',
  category: 'config',
  description: "Définit l'image de bannière affichée sur le panel de tickets.",
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply("❌ Vous devez être administrateur pour configurer l'image du panel ticket.");
    }

    const url = args[0];
    if (!url) {
      return message.reply("❌ Usage : `+setticketimage <url-de-limage>` ou `+setticketimage off` pour la retirer.");
    }

    if (url.toLowerCase() === 'off') {
      client.db.updateGuildConfig(message.guild.id, { ticketImage: null });
      return message.reply("✅ L'image du panel ticket a été retirée.");
    }

    if (!url.startsWith('http')) {
      return message.reply("❌ Veuillez fournir une URL valide (commençant par http/https).");
    }

    client.db.updateGuildConfig(message.guild.id, { ticketImage: url });
    return message.reply(`✅ L'image du panel ticket a été mise à jour.\nLien : ${url}\nN'oubliez pas de refaire \`+ticketsetup\` pour afficher le nouveau panel.`);
  }
};
