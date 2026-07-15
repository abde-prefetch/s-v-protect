const { AuditLogEvent, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'channelDelete',
  async execute(channel, client) {
    const guild = channel.guild;
    const config = client.db.getGuildConfig(guild.id);

    // Si l'anti-raid/secur n'est pas activé, on ignore
    if (!config.antiRaid) return;

    try {
      // Attendre un tout petit peu pour s'assurer que l'Audit Log est enregistré
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Récupérer les logs de suppression de salon
      const fetchedLogs = await guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.ChannelDelete,
      });

      const deletionLog = fetchedLogs.entries.first();
      if (!deletionLog) return;

      const { executor, target } = deletionLog;

      // Si c'est le bot lui-même qui a supprimé (ex: lors de loadbackup), on ignore
      if (executor.id === client.user.id) return;

      // Vérifier si l'exécuteur est le propriétaire ou dans la whitelist
      const isWhitelisted = executor.id === guild.ownerId || (config.whitelist && config.whitelist.includes(executor.id));

      if (!isWhitelisted) {
        // 1. Bannir l'exécuteur
        const member = await guild.members.fetch(executor.id).catch(() => null);
        if (member && member.bannable) {
          await member.ban({ reason: 'Anti-Channel Delete: Suppression de salon non autorisée' });
        }

        // 2. Recréer le salon immédiatement (clonage)
        const clonedChannel = await channel.clone({
          name: channel.name,
          reason: 'Anti-Channel Delete: Restauration automatique'
        });

        // Repositionner le salon si possible
        if (channel.parent) {
          await clonedChannel.setParent(channel.parent).catch(() => {});
        }
        await clonedChannel.setPosition(channel.position).catch(() => {});

        // 3. Envoyer un log d'alerte
        if (config.logsChannel) {
          const logsChan = guild.channels.cache.get(config.logsChannel);
          if (logsChan) {
            const embed = new EmbedBuilder()
              .setTitle('🚨 ALERTE SÉCURITÉ : Salon Supprimé Restauré')
              .setDescription(`Le salon **#${channel.name}** a été supprimé par <@${executor.id}> (ID: ${executor.id}).\n\n**Action prise :**\n- Utilisateur banni.\n- Salon recréé : ${clonedChannel}.`)
              .setColor('#FF0000')
              .setTimestamp();

            await logsChan.send({ embeds: [embed] });
          }
        }
      }
    } catch (err) {
      console.error("Erreur dans l'événement anti-channel-delete :", err);
    }
  },
};
