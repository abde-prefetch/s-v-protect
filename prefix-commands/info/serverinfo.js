const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'serverinfo',
  category: 'info',
  description: "Affiche les informations du serveur.",
  async execute(message, args, client) {
    const guild = message.guild;
    const config = client.db.getGuildConfig(guild.id);

    const embed = new EmbedBuilder()
      .setAuthor({ name: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
      .setThumbnail(guild.iconURL({ dynamic: true, size: 512 }))
      .addFields(
        { name: 'Propriétaire', value: `<@${guild.ownerId}> (ID: ${guild.ownerId})`, inline: false },
        { name: 'ID du serveur', value: guild.id, inline: true },
        { name: 'Membres', value: `${guild.memberCount}`, inline: true },
        { name: 'Création', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
        { name: 'Salons', value: `${guild.channels.cache.size}`, inline: true },
        { name: 'Rôles', value: `${guild.roles.cache.size}`, inline: true },
        { name: 'Boosts', value: `${guild.premiumSubscriptionCount || 0}`, inline: true }
      )
      .setColor(config.theme || '#5865F2')
      .setFooter({ text: `S-V Protect • Demandé par ${message.author.tag}` })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
};
