const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'userinfo',
  category: 'info',
  description: "Affiche les informations d'un membre.",
  async execute(message, args, client) {
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
    const user = member.user;
    const config = client.db.getGuildConfig(message.guild.id);

    const embed = new EmbedBuilder()
      .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ dynamic: true }) })
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
      .addFields(
        { name: 'Nom', value: user.username, inline: true },
        { name: 'Tag', value: `#${user.discriminator || '0000'}`, inline: true },
        { name: 'ID', value: user.id, inline: true },
        { name: 'Création du compte', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: 'Rejoint le serveur', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
        { name: 'Rôles', value: member.roles.cache.map(r => r).join(' ').slice(0, 1024) || 'Aucun' }
      )
      .setColor(config.theme || '#5865F2')
      .setFooter({ text: `S-V Protect • Demandé par ${message.author.tag}` })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
};
