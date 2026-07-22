const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'sethierarchie',
  category: 'config',
  description: "Envoie l'embed de la hiérarchie du serveur.",
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply("❌ Vous devez être administrateur pour utiliser cette commande.");
    }

    const config = client.db.getGuildConfig(message.guild.id);

    // Supprimer le message de commande
    await message.delete().catch(() => {});

    const embed = new EmbedBuilder()
      .setTitle('👑 ORGANISATION & HIÉRARCHIE')
      .setDescription(
        'Voici la structure officielle des rôles et des rangs du serveur.\n' +
        'Chaque grade reflète l\'implication et le statut des membres au sein de la communauté.\n\n' +
        '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬'
      )
      .setColor(config.theme || '#5865F2')
      .setThumbnail(message.guild.iconURL({ dynamic: true }))
      .addFields(
        {
          name: '👑 ── DIRECTION SUPRÊME',
          value: 
            `> **Yami 漢** ━ \`Directeur & Fondateur\`\n` +
            `> ┗ *Créateur du projet et décisionnaire absolu.*\n\n` +
            `> **Bras-droit** ━ \`Co-Directeur\`\n` +
            `> ┗ *Administrateur général, gère le serveur au quotidien.*`,
          inline: false
        },
        {
          name: '🛡️ ── HAUT COMMANDEMENT',
          value: 
            `> **Empereur** ━ \`Administrateur\`\n` +
            `> ┗ *Gère l'équipe de modération et le bon fonctionnement global.*\n\n` +
            `> **Souverain** ━ \`Modérateur Général\`\n` +
            `> ┗ *Supervise le chat et applique les directives administratives.*`,
          inline: false
        },
        {
          name: '⚔️ ── CORPS DE MODÉRATION',
          value: 
            `> **Apôtre** ━ \`Modérateur\`\n` +
            `> ┗ *Chargé du respect des règles et de la sécurité du chat.*\n\n` +
            `> **Emissaire** ━ \`Helper / Modérateur en test\`\n` +
            `> ┗ *Aide les membres et fait ses preuves au sein du staff.*`,
          inline: false
        },
        {
          name: '🔥 ── RANGS COMPÉTITIFS (ÉLITE)',
          value: 
            `> **Rang X** ━ \`Élite Suprême\`\n` +
            `> ┗ *Réservé aux joueurs de niveau professionnel ou semi-professionnel.*\n\n` +
            `> **Rang S** ━ \`Niveau Excellent\`\n` +
            `> ┗ *Joueurs de très haut niveau, maîtres de leur sujet.*\n\n` +
            `> **Rang A** ━ \`Niveau Supérieur\`\n` +
            `> ┗ *Joueurs confirmés possédant un excellent niveau de jeu.*`,
          inline: false
        },
        {
          name: '📊 ── RANGS COMPÉTITIFS (MÉDIAN)',
          value: 
            `> **Rang B** ━ \`Niveau Intermédiaire\`\n` +
            `> ┗ *Joueurs réguliers avec un bon niveau de jeu.*\n\n` +
            `> **Rang C** ━ \`Niveau Moyen\`\n` +
            `> ┗ *Joueurs en cours de progression et d'apprentissage.*`,
          inline: false
        },
        {
          name: '👥 ── ARRIVANTS & DÉBUTANTS',
          value: 
            `> **Novice** ━ \`Niveau Débutant\`\n` +
            `> ┗ *Joueurs novices ou nouveaux arrivants sur le jeu.*\n\n` +
            `> **Visiteur** ━ \`En attente\`\n` +
            `> ┗ *Rôle d'attente à l'arrivée sur le serveur.*`,
          inline: false
        }
      )
      .setTimestamp()
      .setFooter({ text: 'S-V Protect • Organisation et Ordre', iconURL: message.guild.iconURL() });

    await message.channel.send({ embeds: [embed] });
  }
};
