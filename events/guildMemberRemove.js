const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member, client) {
    const guild = member.guild;
    const config = client.db.getGuildConfig(guild.id);

    // --- MESSAGE DE DÉPART ---
    if (config && config.leaveChannel) {
      const leaveChan = guild.channels.cache.get(config.leaveChannel);
      if (leaveChan) {
        let msg = config.leaveMessage || "Au revoir {member} !";
        msg = msg
          .replace(/{member}/g, `**${member.user.tag}**`)
          .replace(/{guild}/g, guild.name)
          .replace(/{membercount}/g, guild.memberCount);

        const embed = new EmbedBuilder()
          .setTitle(`👋 Un membre a quitté le serveur`)
          .setDescription(msg)
          .setColor(config.theme || '#5865F2')
          .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
          .setTimestamp();

        if (config.leaveImage) {
          embed.setImage(config.leaveImage);
        }

        leaveChan.send({ embeds: [embed] })
          .catch(err => console.error("Erreur d'envoi du message de départ :", err));
      }
    }
  }
};
