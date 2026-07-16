const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const CATEGORIES = {
  moderation: { label: 'Modération', emoji: '🔨', desc: 'Gérer les membres et salons.' },
  config: { label: 'Configuration', emoji: '⚙️', desc: 'Paramètres du bot et serveurs.' },
  protection: { label: 'Protection', emoji: '🛡️', desc: 'Sécurité et modules anti-raid.' },
  giveaway: { label: 'Giveaway', emoji: '🎉', desc: 'Lancer et gérer des concours.' },
  info: { label: 'Informations', emoji: 'ℹ️', desc: 'Informations diverses.' },
  owner: { label: 'Owner', emoji: '👑', desc: 'Gestion exclusive et statut du bot.' }
};

// Fonction pour récupérer la liste des commandes d'une catégorie
function getCommandsInCategory(client, catId) {
  const cmds = [];
  client.prefixCommands.forEach(cmd => {
    // Éviter les doublons dus aux alias
    if (cmd.category === catId && !cmds.find(c => c.name === cmd.name)) {
      cmds.push(cmd);
    }
  });
  return cmds.sort((a, b) => a.name.localeCompare(b.name));
}

// Construction de l'embed Accueil
function buildHomeEmbed(prefix, botUser, config) {
  const embed = new EmbedBuilder()
    .setTitle('📖 S-V Protect — Accueil')
    .setDescription(`Bienvenue dans le menu d'aide du bot.\nPréfixe actuel : \`${prefix}\`\n\nSélectionnez une catégorie dans le menu déroulant ci-dessous pour voir les commandes disponibles.`)
    .setColor(config.theme || '#5865F2')
    .setThumbnail(botUser.displayAvatarURL())
    .setTimestamp()
    .setFooter({ text: 'S-V Protect', iconURL: botUser.displayAvatarURL() });

  if (config.helpImage) embed.setImage(config.helpImage);
  return embed;
}

// Construction de l'embed Catégorie
function buildCategoryEmbed(catId, client, prefix, botUser, config) {
  const cat = CATEGORIES[catId];
  const cmds = getCommandsInCategory(client, catId);
  const list = cmds.map(c => `\`${prefix}${c.name}\``).join(' • ');

  const embed = new EmbedBuilder()
    .setTitle(`${cat.emoji} Catégorie : ${cat.label}`)
    .setDescription(`**${cmds.length} commandes** disponibles dans cette catégorie.\nSélectionnez une commande dans le menu pour voir les détails.\n\n${list || '*Aucune commande*'}`)
    .setColor(config.theme || '#5865F2')
    .setTimestamp()
    .setFooter({ text: 'S-V Protect', iconURL: botUser.displayAvatarURL() });

  if (config.helpImage) embed.setImage(config.helpImage);
  return embed;
}

// Construction de l'embed Détaillé (Commande)
function buildCommandEmbed(cmdName, catId, client, prefix, botUser, config) {
  const cat = CATEGORIES[catId];
  const cmd = client.prefixCommands.get(cmdName);

  const embed = new EmbedBuilder()
    .setColor(config.theme || '#5865F2')
    .addFields(
      { name: 'Commande', value: `\`${cmd.name}\``, inline: true },
      { name: 'Catégorie', value: `\`${cat.label}\``, inline: true },
      { name: 'Description', value: cmd.description || 'Aucune description fournie.', inline: false },
      { name: 'Usage', value: `\`\`\`\n${prefix}${cmd.name}\n\`\`\``, inline: false }
    )
    .setTimestamp()
    .setFooter({ text: 'S-V Protect', iconURL: botUser.displayAvatarURL() });

  if (config.helpImage) embed.setImage(config.helpImage);
  return embed;
}

// Construction des menus et boutons
function buildComponents(state, catId, client) {
  const components = [];

  if (state === 'home') {
    const options = Object.keys(CATEGORIES).map(id => ({
      label: CATEGORIES[id].label,
      description: CATEGORIES[id].desc,
      value: `cat_${id}`,
      emoji: CATEGORIES[id].emoji
    }));

    const select = new StringSelectMenuBuilder()
      .setCustomId('help_select_cat')
      .setPlaceholder('📂 Choisir une catégorie')
      .addOptions(options);

    components.push(new ActionRowBuilder().addComponents(select));
  } else if (state === 'category' || state === 'command') {
    const cmds = getCommandsInCategory(client, catId);
    
    // Le select menu de commandes est limité à 25 options.
    const options = cmds.slice(0, 25).map(cmd => ({
      label: cmd.name,
      description: (cmd.description || '').substring(0, 50),
      value: `cmd_${cmd.name}`
    }));

    if (options.length > 0) {
      const select = new StringSelectMenuBuilder()
        .setCustomId(`help_select_cmd_${catId}`)
        .setPlaceholder('🔍 Choisir une commande')
        .addOptions(options);
      components.push(new ActionRowBuilder().addComponents(select));
    }

    const rowBtns = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('help_home')
        .setLabel('Accueil')
        .setStyle(ButtonStyle.Secondary)
    );

    if (state === 'command') {
      rowBtns.addComponents(
        new ButtonBuilder()
          .setCustomId(`help_back_${catId}`)
          .setLabel('Retour')
          .setStyle(ButtonStyle.Secondary)
      );
    }

    components.push(rowBtns);
  }

  return components;
}

module.exports = {
  name: 'help',
  category: 'info',
  description: "Affiche l'aide interactive du bot.",
  async execute(message, args, client) {
    const config = client.db.getGuildConfig(message.guild.id);
    const prefix = config.prefix || '+';

    let msg;
    
    // Affichage rapide si une commande est demandée en argument (ex: +help secur)
    if (args[0]) {
      const cmdName = args[0].toLowerCase();
      const cmd = client.prefixCommands.get(cmdName);
      if (cmd) {
        const catId = cmd.category || 'info';
        const embed = buildCommandEmbed(cmd.name, catId, client, prefix, client.user, config);
        const components = buildComponents('command', catId, client);
        msg = await message.reply({ embeds: [embed], components });
      } else {
        return message.reply(`❌ Commande \`${cmdName}\` introuvable.`);
      }
    } else {
      // Accueil classique
      const embed = buildHomeEmbed(prefix, client.user, config);
      const components = buildComponents('home', null, client);
      msg = await message.reply({ embeds: [embed], components });
    }

    const collector = msg.createMessageComponentCollector({
      filter: i => i.user.id === message.author.id,
      time: 5 * 60 * 1000,
    });

    collector.on('collect', async i => {
      // Bouton Accueil
      if (i.customId === 'help_home') {
        const embed = buildHomeEmbed(prefix, client.user, config);
        const components = buildComponents('home', null, client);
        await i.update({ embeds: [embed], components });
      } 
      // Bouton Retour
      else if (i.customId.startsWith('help_back_')) {
        const catId = i.customId.replace('help_back_', '');
        const embed = buildCategoryEmbed(catId, client, prefix, client.user, config);
        const components = buildComponents('category', catId, client);
        await i.update({ embeds: [embed], components });
      }
      // Select Menu Catégorie
      else if (i.customId === 'help_select_cat') {
        const catId = i.values[0].replace('cat_', '');
        const embed = buildCategoryEmbed(catId, client, prefix, client.user, config);
        const components = buildComponents('category', catId, client);
        await i.update({ embeds: [embed], components });
      }
      // Select Menu Commande
      else if (i.customId.startsWith('help_select_cmd_')) {
        const catId = i.customId.replace('help_select_cmd_', '');
        const cmdName = i.values[0].replace('cmd_', '');
        const embed = buildCommandEmbed(cmdName, catId, client, prefix, client.user, config);
        const components = buildComponents('command', catId, client);
        await i.update({ embeds: [embed], components });
      }
    });

    collector.on('end', async () => {
      // Désactiver le menu au bout de 5 minutes
      await msg.edit({ components: [] }).catch(() => {});
    });
  }
};
