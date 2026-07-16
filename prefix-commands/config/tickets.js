const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = [
  {
    name: 'ticketsetup',
    category: 'config',
    description: "Configure le panel de tickets.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return message.reply("❌ Vous devez être administrateur pour configurer les tickets.");
      }

      const channel = message.mentions.channels.first() || message.channel;

      const config = client.db.getGuildConfig(message.guild.id);
      
      const embed = new EmbedBuilder()
        .setTitle('🎟️ Ouvrir un ticket')
        .setDescription('Sélectionnez une catégorie ci-dessous pour ouvrir un ticket et contacter l\'équipe du serveur.')
        .setColor(config.theme || '#5865F2')
        .setFooter({ text: 'S-V Protect • Système de tickets' });

      if (config.ticketImage) {
        embed.setImage(config.ticketImage);
      }

      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('ticket_category_select')
          .setPlaceholder('🎟️ Cliquer pour sélectionner')
          .addOptions([
            {
              label: 'Recrutement',
              description: 'Postuler pour rejoindre l\'équipe ou le gang.',
              value: 'ticket_recrutement',
              emoji: '📋',
            },
            {
              label: 'Question',
              description: 'Poser une question à l\'équipe du serveur.',
              value: 'ticket_question',
              emoji: '❓',
            },
            {
              label: 'Gang Wars',
              description: 'Signaler un problème ou organiser une guerre de gang.',
              value: 'ticket_gangwars',
              emoji: '⚔️',
            },
            {
              label: 'Annuler la sélection',
              description: 'Cliquez ici pour pouvoir rouvrir un ticket plus tard.',
              value: 'ticket_cancel',
              emoji: '❌',
            }
          ])
      );

      await channel.send({ embeds: [embed], components: [row] });
      return message.reply(`✅ Le panel de tickets a été envoyé dans ${channel}.`);
    }
  },
  {
    name: 'settranscript',
    category: 'config',
    description: "Configure le salon où seront envoyés les transcripts des tickets.",
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return message.reply("❌ Vous devez être administrateur pour configurer les transcripts.");
      }

      const channel = message.mentions.channels.first();
      if (!channel) {
        if (args[0] === 'off') {
          client.db.updateGuildConfig(message.guild.id, { transcriptChannel: null });
          return message.reply("✅ L'envoi des transcripts dans un salon est désactivé.");
        }
        return message.reply("❌ Usage : `+settranscript #salon` ou `+settranscript off`");
      }

      client.db.updateGuildConfig(message.guild.id, { transcriptChannel: channel.id });
      return message.reply(`✅ Les transcripts des tickets seront maintenant envoyés dans ${channel}.`);
    }
  }
];
