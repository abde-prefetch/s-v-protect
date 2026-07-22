const { PermissionFlagsBits } = require('discord.js');

module.exports = [
  {
    name: 'setdepart',
    category: 'config',
    description: "Configure le salon et le message de départ pour les membres qui quittent le serveur.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return message.reply("❌ Permission `Gérer le serveur` requise.");
      }

      if (args[0]?.toLowerCase() === 'off') {
        client.db.updateGuildConfig(message.guild.id, { leaveChannel: null });
        return message.reply("✅ Les messages de départ ont été désactivés.");
      }

      const channel = message.mentions.channels.first();
      if (!channel) {
        return message.reply("❌ Usage : `+setdepart #salon [Votre message de départ]` (ou `+setdepart off`) \n\n*Variables utilisables :* \n`{member}` (nom du membre), `{guild}` (nom du serveur), `{membercount}` (nombre total de membres restants).");
      }

      // Récupérer le message après le salon
      let leaveMsg = args.slice(1).join(' ');
      if (!leaveMsg) {
        leaveMsg = "Au revoir {member} ! Nous sommes désormais **{membercount}** sur le serveur.";
      }

      client.db.updateGuildConfig(message.guild.id, {
        leaveChannel: channel.id,
        leaveMessage: leaveMsg
      });

      return message.reply(`✅ Les messages de départ sont configurés dans ${channel}.\nMessage actuel : \`${leaveMsg}\``);
    }
  },
  {
    name: 'setimagedepart',
    category: 'config',
    description: "Configure l'image ou la bannière affichée dans le message de départ.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return message.reply("❌ Permission `Gérer le serveur` requise.");
      }

      const url = args[0];
      if (!url) {
        return message.reply("❌ Usage : `+setimagedepart <url>` (ou `+setimagedepart off` pour la retirer).");
      }

      if (url.toLowerCase() === 'off') {
        client.db.updateGuildConfig(message.guild.id, { leaveImage: null });
        return message.reply("✅ L'image de départ a été retirée.");
      }

      if (!url.startsWith('http')) {
        return message.reply("❌ Veuillez fournir une URL d'image valide (commençant par http/https).");
      }

      client.db.updateGuildConfig(message.guild.id, { leaveImage: url });
      return message.reply(`✅ L'image de départ a bien été mise à jour.\nLien : ${url}`);
    }
  }
];
