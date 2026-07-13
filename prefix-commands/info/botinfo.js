const { EmbedBuilder } = require('discord.js');
const packageJson = require('../../package.json');

module.exports = {
  name: 'botinfo',
  category: 'info',
  description: "Affiche les informations sur le bot.",
  async execute(message, args, client) {
    const config = client.db.getGuildConfig(message.guild.id);

    const embed = new EmbedBuilder()
      .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        { name: 'Version du bot', value: packageJson.version, inline: true },
        { name: 'Librairie', value: 'Discord.js v14', inline: true },
        { name: 'Node.js', value: process.version, inline: true },
        { name: 'Mémoire utilisée', value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true },
        { name: 'Uptime', value: `<t:${Math.floor((Date.now() - client.uptime) / 1000)}:R>`, inline: true },
        { name: 'Serveurs', value: `${client.guilds.cache.size}`, inline: true }
      )
      .setColor(config.theme || '#5865F2')
      .setFooter({ text: `S-V Protect • Demandé par ${message.author.tag}` })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
};
