const { AuditLogEvent, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'channelCreate',
  async execute(channel, client) {
    const guild = channel.guild;
    const config = client.db.getGuildConfig(guild.id);

    if (!config.antiRaid) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const fetchedLogs = await guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.ChannelCreate,
      });

      const creationLog = fetchedLogs.entries.first();
      if (!creationLog) return;

      const { executor } = creationLog;

      if (executor.id === client.user.id) return;

      const isWhitelisted = executor.id === guild.ownerId || (config.whitelist && config.whitelist.includes(executor.id));

      if (!isWhitelisted) {
        // 1. Bannir l'exécuteur
        const member = await guild.members.fetch(executor.id).catch(() => null);
        if (member && member.bannable) {
          await member.ban({ reason: 'Anti-Channel Create: Création de salon non autorisée' });
        }

        // 2. Supprimer le salon créé
        await channel.delete('Anti-Channel Create: Suppression automatique');

        // 3. Envoyer un log
        if (config.logsChannel) {
          const logsChan = guild.channels.cache.get(config.logsChannel);
          if (logsChan) {
            const embed = new EmbedBuilder()
              .setTitle('🚨 ALERTE SÉCURITÉ : Salon Non Autorisé Supprimé')
              .setDescription(`Le salon **#${channel.name}** a été créé par <@${executor.id}> (ID: ${executor.id}).\n\n**Action prise :**\n- Utilisateur banni.\n- Salon supprimé.`)
              .setColor('#FF0000')
              .setTimestamp();

            await logsChan.send({ embeds: [embed] });
          }
        }
      }
    } catch (err) {
      console.error("Erreur dans l'événement anti-channel-create :", err);
    }
  },
};
