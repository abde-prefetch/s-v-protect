const { PermissionFlagsBits } = require('discord.js');

module.exports = [
  {
    name: 'setarrive',
    category: 'config',
    description: "Configure le salon et le message de bienvenue pour les nouveaux membres.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return message.reply("❌ Permission `Gérer le serveur` requise.");
      }

      if (args[0]?.toLowerCase() === 'off') {
        client.db.updateGuildConfig(message.guild.id, { welcomeChannel: null });
        return message.reply("✅ Les messages d'arrivée ont été désactivés.");
      }

      const channel = message.mentions.channels.first();
      if (!channel) {
        return message.reply("❌ Usage : `+setarrive #salon [Votre message de bienvenue]` (ou `+setarrive off`) \n\n*Variables utilisables :* \n`{member}` (mentionner le membre), `{guild}` (nom du serveur), `{membercount}` (nombre total de membres).");
      }

      // Récupérer le message après le salon
      let welcomeMsg = args.slice(1).join(' ');
      if (!welcomeMsg) {
        welcomeMsg = "Bienvenue {member} sur le serveur **{guild}** ! Nous sommes maintenant **{membercount}** membres.";
      }

      client.db.updateGuildConfig(message.guild.id, {
        welcomeChannel: channel.id,
        welcomeMessage: welcomeMsg
      });

      return message.reply(`✅ Les messages de bienvenue sont configurés dans ${channel}.\nMessage actuel : \`${welcomeMsg}\``);
    }
  },
  {
    name: 'setimagearrive',
    category: 'config',
    description: "Configure l'image ou la bannière affichée dans le message de bienvenue.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return message.reply("❌ Permission `Gérer le serveur` requise.");
      }

      const url = args[0];
      if (!url) {
        return message.reply("❌ Usage : `+setimagearrive <url>` (ou `+setimagearrive off` pour la retirer).");
      }

      if (url.toLowerCase() === 'off') {
        client.db.updateGuildConfig(message.guild.id, { welcomeImage: null });
        return message.reply("✅ L'image de bienvenue a été retirée.");
      }

      if (!url.startsWith('http')) {
        return message.reply("❌ Veuillez fournir une URL d'image valide (commençant par http/https).");
      }

      client.db.updateGuildConfig(message.guild.id, { welcomeImage: url });
      return message.reply(`✅ L'image de bienvenue a bien été mise à jour.\nLien : ${url}`);
    }
  }
];
