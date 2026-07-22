const { PermissionFlagsBits } = require('discord.js');
const { isOwner } = require('../config');
const { handleLinkSpam } = require('./messageCreate');

module.exports = {
  name: 'messageUpdate',
  async execute(oldMessage, newMessage, client) {
    // Ignorer si c'est un bot ou hors d'un serveur
    if (!newMessage.author || newMessage.author.bot || !newMessage.guild) return;
    if (!newMessage.content) return; // Si pas de texte (ex: juste un embed modifié)

    const guildId = newMessage.guild.id;
    const config = client.db.getGuildConfig(guildId);

    // Bypass pour l'owner et la whitelist
    const isWhitelisted = isOwner(newMessage.author.id) || 
                          (config.whitelist && config.whitelist.includes(newMessage.author.id));

    if (isWhitelisted) return;

    // Nettoyage du contenu modifié
    const cleanedContent = newMessage.content
      .toLowerCase()
      .replace(/[*_~`\\#|]/g, '')
      .replace(/\s+/g, '');

    // --- ANTI-INVITE ---
    if (config.antiInvite) {
      const inviteRegex = /(discord\.gg|discord\.com\/invite|discordapp\.com\/invite|discord\.io|discord\.me)/i;
      if (inviteRegex.test(cleanedContent)) {
        try {
          await newMessage.delete();
          const spammed = await handleLinkSpam(newMessage, config);
          if (!spammed) {
            await newMessage.channel.send(`⚠️ ${newMessage.author}, les invitations Discord ne sont pas autorisées (même après modification de votre message).`);
          }
          return;
        } catch (err) {
          console.error("Erreur lors de la suppression de l'invitation éditée :", err);
        }
      }
    }

    // --- ANTI-LINK ---
    if (config.antiLink) {
      const linkRegex = /(https?:\/\/|www\.|[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.(com|fr|net|org|io|info|gov|edu|me|xyz|gg|co|tk|cf|ga|gq|ml|us|uk|ca|de|jp|cn|ru|it|nl|se|no|dk|ch|at|es|pt|br|in|au|pl|ua|tr|gr|ro|cz|hu|ro|be|lu|ie|is|fi|ee|lv|lt|by|md|rs|hr|si|bg|al|mk|me|ge|am|az)(\/.*)?)/i;
      if (linkRegex.test(cleanedContent)) {
        try {
          await newMessage.delete();
          const spammed = await handleLinkSpam(newMessage, config);
          if (!spammed) {
            await newMessage.channel.send(`⚠️ ${newMessage.author}, les liens ne sont pas autorisés sur ce serveur (même après modification de votre message).`);
          }
          return;
        } catch (err) {
          console.error("Erreur lors de la suppression du lien édité :", err);
        }
      }
    }
  }
};
