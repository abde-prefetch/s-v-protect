const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

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

      const embed = new EmbedBuilder()
        .setTitle('🎟️ Support - Tickets')
        .setDescription('Besoin d\'aide ? Cliquez sur le bouton ci-dessous pour ouvrir un ticket et contacter l\'équipe du serveur.')
        .setColor(client.db.getGuildConfig(message.guild.id).theme || '#5865F2')
        .setFooter({ text: 'S-V Protect • Système de tickets' });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('create_ticket')
          .setLabel('Ouvrir un ticket')
          .setEmoji('🎟️')
          .setStyle(ButtonStyle.Primary)
      );

      await channel.send({ embeds: [embed], components: [row] });
      return message.reply(`✅ Le panel de tickets a été envoyé dans ${channel}.`);
    }
  }
];
