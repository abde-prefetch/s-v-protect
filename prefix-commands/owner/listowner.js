const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'listowner',
  category: 'owner',
  description: "Affiche le propriétaire absolu du bot.",
  async execute(message, args, client) {
    const embed = new EmbedBuilder()
      .setTitle('👑 Propriétaire Global du Bot')
      .setDescription(`Le propriétaire absolu de ce bot est : <@578019414830743586> (ID: 578019414830743586)`)
      .setColor(client.db.getGuildConfig(message.guild.id).theme || '#5865F2')
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};
