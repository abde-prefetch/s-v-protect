const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

async function updatePalmaresMessage(client, guild, config) {
  const palmares = config.palmares;
  if (!palmares.channelId || !palmares.messageId) return false;

  const channel = guild.channels.cache.get(palmares.channelId);
  if (!channel) return false;

  try {
    const message = await channel.messages.fetch(palmares.messageId);
    if (!message) return false;

    const total = palmares.wins + palmares.losses;
    const winrate = total > 0 ? Math.round((palmares.wins / total) * 100) : 0;

    let historyText = '*Aucun match enregistré.*';
    if (palmares.history && palmares.history.length > 0) {
      // Prendre les 10 derniers matchs
      const recent = palmares.history.slice(-10);
      historyText = recent.map(m => {
        const icon = m.result === 'win' ? '✅' : '❌';
        return `${icon} **${m.result.toUpperCase()}** ${m.detail ? `- ${m.detail}` : ''}`;
      }).join('\n');
    }

    const embed = new EmbedBuilder()
      .setTitle('🏆 Palmarès Officiel')
      .setDescription('Voici l\'historique des affrontements (Gang Wars, Events, etc).')
      .setColor(config.theme || '#5865F2')
      .addFields(
        { name: '📊 Statistiques', value: `**Victoires :** ${palmares.wins}\n**Défaites :** ${palmares.losses}\n**Winrate :** ${winrate}%`, inline: true },
        { name: '🔥 Winstreak', value: `Série actuelle : **${palmares.winstreak}** victoires consécutives`, inline: true },
        { name: '📜 Historique récent', value: historyText, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: 'S-V Protect • Palmarès', iconURL: guild.iconURL() });

    await message.edit({ embeds: [embed] });
    return true;
  } catch (err) {
    console.error("Erreur lors de la mise à jour du palmares:", err);
    return false;
  }
}

module.exports = {
  name: 'palmares',
  category: 'moderation',
  description: "Gérer le système de palmarès (victoires/défaites/winstreak).",
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply("❌ Vous devez avoir la permission `Gérer le Serveur` pour utiliser cette commande.");
    }

    const sub = args[0]?.toLowerCase();
    const config = client.db.getGuildConfig(message.guild.id);
    
    // Initialiser l'objet si absent (au cas où)
    if (!config.palmares) {
      config.palmares = { channelId: null, messageId: null, wins: 0, losses: 0, winstreak: 0, history: [] };
    }

    if (sub === 'setup') {
      const embed = new EmbedBuilder()
        .setTitle('🏆 Palmarès Officiel')
        .setDescription('Initialisation en cours...')
        .setColor(config.theme || '#5865F2');

      const msg = await message.channel.send({ embeds: [embed] });
      
      config.palmares.channelId = message.channel.id;
      config.palmares.messageId = msg.id;
      client.db.updateGuildConfig(message.guild.id, { palmares: config.palmares });
      
      await updatePalmaresMessage(client, message.guild, config);
      return message.reply("✅ Le palmarès a été configuré ici. Vous pouvez supprimer ce message.");
    }

    if (sub === 'win' || sub === 'loss') {
      if (!config.palmares.messageId) {
        return message.reply("❌ Le palmarès n'est pas configuré. Faites `+palmares setup` d'abord.");
      }

      const detail = args.slice(1).join(' ');
      
      if (sub === 'win') {
        config.palmares.wins += 1;
        config.palmares.winstreak += 1;
      } else {
        config.palmares.losses += 1;
        config.palmares.winstreak = 0; // Winstreak brisée
      }

      config.palmares.history.push({
        result: sub,
        detail: detail,
        date: Date.now()
      });

      client.db.updateGuildConfig(message.guild.id, { palmares: config.palmares });
      
      const success = await updatePalmaresMessage(client, message.guild, config);
      if (success) {
        return message.reply(`✅ Le résultat **${sub.toUpperCase()}** a été ajouté avec succès !`);
      } else {
        return message.reply("⚠️ Le résultat est sauvegardé, mais impossible de modifier le message d'origine (il a peut-être été supprimé). Refaites `+palmares setup`.");
      }
    }

    if (sub === 'reset') {
      config.palmares.wins = 0;
      config.palmares.losses = 0;
      config.palmares.winstreak = 0;
      config.palmares.history = [];
      
      client.db.updateGuildConfig(message.guild.id, { palmares: config.palmares });
      await updatePalmaresMessage(client, message.guild, config);
      
      return message.reply("✅ Le palmarès a été remis à zéro.");
    }

    return message.reply("❌ Usage : `+palmares setup` | `+palmares win [détails]` | `+palmares loss [détails]` | `+palmares reset`");
  }
};
