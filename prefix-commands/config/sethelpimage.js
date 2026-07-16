const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'sethelpimage',
  category: 'config',
  description: "Définit l'image de bannière affichée dans le menu d'aide.",
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply("❌ Vous devez être administrateur pour configurer l'image du help.");
    }

    const url = args[0];
    if (!url) {
      return message.reply("❌ Usage : `+sethelpimage <url-de-limage>` ou `+sethelpimage off` pour la retirer.");
    }

    if (url.toLowerCase() === 'off') {
      client.db.updateGuildConfig(message.guild.id, { helpImage: null });
      return message.reply("✅ L'image du menu d'aide a été retirée.");
    }

    if (!url.startsWith('http')) {
      return message.reply("❌ Veuillez fournir une URL valide (commençant par http/https).");
    }

    client.db.updateGuildConfig(message.guild.id, { helpImage: url });
    return message.reply(`✅ L'image du menu d'aide a été mise à jour.\nLien : ${url}`);
  }
};
