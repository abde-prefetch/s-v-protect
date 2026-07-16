const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// ──────────────────────────────────────────────
//  Définition statique des catégories & commandes
// ──────────────────────────────────────────────
const PAGES = [
  {
    id: 'overview',
    emoji: '🏠',
    label: 'Accueil',
    color: '#5865F2',
    title: '📖 Aide — Vue d\'ensemble',
    description: null, // généré dynamiquement
    fields: null,
  },
  {
    id: 'moderation',
    emoji: '🔨',
    label: 'Modération',
    color: '#ED4245',
    title: '🔨 Modération',
    fields: [
      { name: '👤 Membres', value: '`+ban` `+tempban` `+unban`\n`+kick` `+mute` `+unmute`\n`+warn` `+unwarn` `+infractions`\n`+nickname`', inline: false },
      { name: '💬 Salons', value: '`+clear` `+clearuser` `+clearall`\n`+lock` `+unlock` `+lockall` `+unlockall`\n`+slow` `+hide` `+unhide` `+hideall` `+unhideall`\n`+renew`', inline: false },
      { name: '🎭 Rôles', value: '`+addrole` `+removerole` `+derank`\n`+massrole` `+temprole`', inline: false },
      { name: '🎤 Vocal', value: '`+vkick` `+vkickall` `+vmove` `+vmoveall`', inline: false },
      { name: '😀 Émojis', value: '`+emojiadd` `+emojidel` `+emojirename`', inline: false },
      { name: '🔍 Outils', value: '`+find` `+sync`', inline: false },
    ]
  },
  {
    id: 'config',
    emoji: '⚙️',
    label: 'Configuration',
    color: '#FEE75C',
    title: '⚙️ Configuration',
    fields: [
      { name: '🎭 Rôles auto', value: '`+autorole @role/off` — Rôle auto aux nouveaux membres\n`+namerole` — Rôle selon le pseudo', inline: false },
      { name: '📋 Logs & Tickets', value: '`+logs #salon/off` — Configurer les logs\n`+ticketsetup [#salon]` — Envoyer le panel tickets\n`+settranscript #salon/off` — Salon des transcripts', inline: false },
      { name: '🛡️ Anti & Protections', value: '`+antilink on/off` — Anti-lien\n`+antiinvite on/off` — Anti-invitation\n`+ghostping on/off` — Alertes ghostping\n`+antileak` — Anti-leak\n`+badwords add/remove <mot>` — Mots interdits', inline: false },
      { name: '🖼️ Autres', value: '`+pfp` — Salons images de profil\n`+antilink on/off` — Anti-lien', inline: false },
    ]
  },
  {
    id: 'protection',
    emoji: '🛡️',
    label: 'Protection',
    color: '#57F287',
    title: '🛡️ Protection',
    fields: [
      { name: '🚫 Anti-systèmes', value: '`+antilink on/off` — Anti-lien\n`+antiinvite on/off` — Anti-invitation\n`+antispam on/off` — Anti-spam', inline: false },
      { name: '📝 Mots interdits', value: '`+badwords add <mot>` — Interdire un mot\n`+badwords remove <mot>` — Autoriser un mot\n`+badwords` — Voir la liste', inline: false },
    ]
  },
  {
    id: 'giveaway',
    emoji: '🎉',
    label: 'Giveaway',
    color: '#EB459E',
    title: '🎉 Giveaway',
    fields: [
      { name: '🎯 Commandes', value:
        '`+gstart <durée> <gagnants> <prix>` — Lancer un giveaway\n' +
        '`+gstop <ID>` — Arrêter un giveaway\n' +
        '`+greroll <ID>` — Nouveau tirage\n' +
        '`+glist` — Voir les giveaways actifs',
        inline: false
      },
      { name: '⏱️ Format durée', value: '`10s` = 10 secondes\n`5m` = 5 minutes\n`2h` = 2 heures', inline: false },
    ]
  },
  {
    id: 'info',
    emoji: 'ℹ️',
    label: 'Informations',
    color: '#5865F2',
    title: 'ℹ️ Informations',
    fields: [
      { name: '📊 Commandes', value:
        '`+botinfo` — Infos sur le bot\n' +
        '`+serverinfo` — Infos sur le serveur\n' +
        '`+userinfo [@user]` — Infos sur un membre',
        inline: false
      },
    ]
  },
  {
    id: 'owner',
    emoji: '👑',
    label: 'Owner',
    color: '#F1C40F',
    title: '👑 Owner — Gestion du bot',
    fields: [
      { name: '⚙️ Config bot', value:
        '`+prefix <nouveau>` — Changer le préfixe\n' +
        '`+whitelist @user` — Ajouter à la whitelist\n' +
        '`+unwhitelist @user` — Retirer de la whitelist\n' +
        '`+blacklist @user` — Blacklister un user\n' +
        '`+unblacklist <ID>` — Retirer de la blacklist\n' +
        '`+disable <commande>` — Activer/désactiver une commande\n' +
        '`+alias <alias> <cmd>` — Créer un alias',
        inline: false
      },
      { name: '🎭 Statuts', value:
        '`+playing <texte>` — Statut "Joue à"\n' +
        '`+watching <texte>` — Statut "Regarde"\n' +
        '`+streaming <texte> <url>` — Statut streaming\n' +
        '`+competing <texte>` — Statut "Participe à"\n' +
        '`+resetstatut` — Réinitialiser le statut\n' +
        '`+statutrotator <sec> <s1> | <s2>` — Rotation de statuts',
        inline: false
      },
      { name: '🤖 Bot', value:
        '`+say <texte>` — Faire parler le bot\n' +
        '`+mp @user <msg>` — Envoyer un MP via le bot\n' +
        '`+setname <nom>` — Renommer le bot\n' +
        '`+setpic <url>` — Changer l\'avatar',
        inline: false
      },
    ]
  },
];

function buildEmbed(page, prefix, pageIndex, totalPages, botUser, config) {
  const embed = new EmbedBuilder()
    .setColor(page.color || config.theme || '#5865F2')
    .setTimestamp()
    .setFooter({ text: `Gestion Bot • Page ${pageIndex + 1}/${totalPages} • Préfixe : ${prefix}`, iconURL: botUser.displayAvatarURL() });

  if (page.id === 'overview') {
    embed
      .setTitle('📖 Gestion — Aide complète')
      .setThumbnail(botUser.displayAvatarURL())
      .setDescription(
        `Bienvenue sur l'aide du bot **Gestion** !\n` +
        `Préfixe sur ce serveur : \`${prefix}\`\n\n` +
        `Utilisez les boutons ci-dessous pour naviguer entre les catégories.\n\n` +
        `**Catégories disponibles :**\n` +
        PAGES.filter(p => p.id !== 'overview').map(p => `${p.emoji} **${p.label}**`).join('\n')
      );
  } else {
    embed.setTitle(page.title);
    if (page.fields) {
      for (const field of page.fields) {
        embed.addFields(field);
      }
    }
  }

  return embed;
}

function buildRow(currentIndex, totalPages) {
  const prevDisabled = currentIndex === 0;
  const nextDisabled = currentIndex === totalPages - 1;

  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('help_prev')
      .setEmoji('⬅️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(prevDisabled),
    new ButtonBuilder()
      .setCustomId('help_home')
      .setEmoji('🏠')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('help_next')
      .setEmoji('➡️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(nextDisabled),
  );
}

module.exports = {
  name: 'help',
  category: 'info',
  description: "Affiche l'aide complète du bot avec navigation.",
  async execute(message, args, client) {
    const config = client.db.getGuildConfig(message.guild.id);
    const prefix = config.prefix || '+';
    const totalPages = PAGES.length;
    let currentIndex = 0;

    // Si un argument est donné, chercher la catégorie
    if (args[0]) {
      const query = args[0].toLowerCase();
      const found = PAGES.findIndex(p => p.id === query || p.label.toLowerCase() === query);
      if (found !== -1) currentIndex = found;
    }

    const embed = buildEmbed(PAGES[currentIndex], prefix, currentIndex, totalPages, client.user, config);
    const row = buildRow(currentIndex, totalPages);

    const msg = await message.reply({ embeds: [embed], components: [row] });

    // Collecteur de boutons (5 min)
    const collector = msg.createMessageComponentCollector({
      filter: i => i.user.id === message.author.id,
      time: 5 * 60 * 1000,
    });

    collector.on('collect', async i => {
      if (i.customId === 'help_prev') currentIndex = Math.max(0, currentIndex - 1);
      else if (i.customId === 'help_next') currentIndex = Math.min(totalPages - 1, currentIndex + 1);
      else if (i.customId === 'help_home') currentIndex = 0;

      const newEmbed = buildEmbed(PAGES[currentIndex], prefix, currentIndex, totalPages, client.user, config);
      const newRow = buildRow(currentIndex, totalPages);
      await i.update({ embeds: [newEmbed], components: [newRow] });
    });

    collector.on('end', async () => {
      // Désactiver les boutons après expiration
      const disabledRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('help_prev').setEmoji('⬅️').setStyle(ButtonStyle.Secondary).setDisabled(true),
        new ButtonBuilder().setCustomId('help_home').setEmoji('🏠').setStyle(ButtonStyle.Primary).setDisabled(true),
        new ButtonBuilder().setCustomId('help_next').setEmoji('➡️').setStyle(ButtonStyle.Secondary).setDisabled(true),
      );
      await msg.edit({ components: [disabledRow] }).catch(() => {});
    });
  }
};
