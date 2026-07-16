const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'listwhitelist',
  category: 'owner',
  description: "Affiche la liste des membres whitelistés sur ce serveur.",
  async execute(message, args, client) {
    const config = client.db.getGuildConfig(message.guild.id);
    const whitelistMembers = config.whitelist.map(id => `• <@${id}> (${id})`).join('\n') || 'Aucun membre whitelisté sur ce serveur.';

    const embed = new EmbedBuilder()
      .setTitle('📋 Membres Whitelistés (Ce Serveur)')
      .setDescription(whitelistMembers)
      .setColor(config.theme || '#5865F2')
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};
