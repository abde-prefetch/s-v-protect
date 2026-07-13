const { EmbedBuilder } = require('discord.js');

const activeGiveaways = new Map();

module.exports = [
  {
    name: 'gstart',
    category: 'giveaway',
    description: "Lance un giveaway.",
    async execute(message, args, client) {
      const durationStr = args[0];
      const winnersCount = parseInt(args[1]);
      const prize = args.slice(2).join(' ');

      if (!durationStr || isNaN(winnersCount) || !prize) {
        return message.reply("❌ Usage: `+gstart <durée: ex: 10m, 1h> <gagnants> <prix>`");
      }

      let durationMs = parseInt(durationStr);
      if (durationStr.endsWith('s')) durationMs *= 1000;
      else if (durationStr.endsWith('m')) durationMs *= 60000;
      else if (durationStr.endsWith('h')) durationMs *= 3600000;
      else durationMs *= 60000;

      const config = client.db.getGuildConfig(message.guild.id);

      const embed = new EmbedBuilder()
        .setTitle(`🎉 GIVEAWAY : ${prize}`)
        .setDescription(`Réagissez avec 🎉 pour participer !\n\n**Organisateur** : ${message.author}\n**Gagnants** : ${winnersCount}\n**Temps restant** : <t:${Math.floor((Date.now() + durationMs) / 1000)}:R>`)
        .setColor(config.theme || '#5865F2')
        .setTimestamp();

      const giveawayMessage = await message.channel.send({ embeds: [embed] });
      await giveawayMessage.react('🎉');

      const data = {
        messageId: giveawayMessage.id,
        channelId: message.channel.id,
        prize,
        winnersCount,
        endTime: Date.now() + durationMs,
        timer: null
      };

      activeGiveaways.set(giveawayMessage.id, data);

      const timer = setTimeout(async () => {
        await endGiveaway(client, giveawayMessage.id);
      }, durationMs);

      data.timer = timer;
    }
  },
  {
    name: 'gstop',
    category: 'giveaway',
    description: "Arrête un giveaway immédiatement.",
    async execute(message, args, client) {
      const id = args[0];
      if (!id) return message.reply("❌ Spécifiez l'ID du message du giveaway.");

      const gw = activeGiveaways.get(id);
      if (!gw) return message.reply("❌ Aucun giveaway actif trouvé avec cet ID.");

      clearTimeout(gw.timer);
      await endGiveaway(client, id);
      return message.reply("✅ Le giveaway a été arrêté.");
    }
  },
  {
    name: 'greroll',
    category: 'giveaway',
    description: "Sélectionne un nouveau gagnant pour un giveaway terminé.",
    async execute(message, args, client) {
      const id = args[0];
      if (!id) return message.reply("❌ Spécifiez l'ID du message du giveaway.");

      const channel = message.channel;
      try {
        const targetMessage = await channel.messages.fetch(id);
        const reaction = targetMessage.reactions.cache.get('🎉');
        if (!reaction) return message.reply("❌ Aucune réaction 🎉 trouvée.");

        const users = await reaction.users.fetch();
        const participants = users.filter(u => !u.bot);

        if (participants.size === 0) {
          return message.reply("❌ Pas assez de participants.");
        }

        const winner = participants.random();
        return channel.send(`🎉 **Nouveau tirage** : Félicitations à ${winner} qui gagne !`);
      } catch (err) {
        return message.reply("❌ Impossible de trouver le message ou de reroll.");
      }
    }
  },
  {
    name: 'glist',
    category: 'giveaway',
    description: "Liste tous les giveaways en cours.",
    async execute(message, args, client) {
      if (activeGiveaways.size === 0) return message.reply("❌ Aucun giveaway en cours.");

      const list = Array.from(activeGiveaways.values()).map(gw => {
        return `• **${gw.prize}** dans <#${gw.channelId}> (ID: ${gw.messageId}) - Fin : <t:${Math.floor(gw.endTime / 1000)}:R>`;
      }).join('\n');

      return message.reply(`Giveaways actifs :\n${list}`);
    }
  }
];

async function endGiveaway(client, messageId) {
  const gw = activeGiveaways.get(messageId);
  if (!gw) return;

  activeGiveaways.delete(messageId);

  try {
    const channel = await client.channels.fetch(gw.channelId);
    const msg = await channel.messages.fetch(messageId);
    const reaction = msg.reactions.cache.get('🎉');
    if (!reaction) return;

    const users = await reaction.users.fetch();
    const participants = users.filter(u => !u.bot);

    const winners = [];
    if (participants.size > 0) {
      const count = Math.min(gw.winnersCount, participants.size);
      for (let i = 0; i < count; i++) {
        const winner = participants.random();
        if (winner && !winners.includes(winner)) {
          winners.push(winner);
          participants.delete(winner.id);
        }
      }
    }

    const embed = EmbedBuilder.from(msg.embeds[0]);
    embed.setDescription(`Giveaway terminé !\n\nGagnant(s) : ${winners.length > 0 ? winners.join(', ') : "Aucun"}`);
    await msg.edit({ embeds: [embed] });

    if (winners.length > 0) {
      await channel.send(`🎉 Félicitations à ${winners.join(', ')} qui gagne(nt) **${gw.prize}** !`);
    } else {
      await channel.send(`😭 Personne n'a participé au giveaway pour **${gw.prize}**.`);
    }
  } catch (err) {
    console.error("Erreur fin de giveaway :", err);
  }
}
