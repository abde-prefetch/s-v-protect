require('dotenv').config();
const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.prefixCommands = new Collection();
client.db = require('./db.js');

// Chargement récursif des commandes Préfixées
const prefixCommandsPath = path.join(__dirname, 'prefix-commands');
if (!fs.existsSync(prefixCommandsPath)) {
  fs.mkdirSync(prefixCommandsPath);
}

function loadPrefixCommands(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.lstatSync(filePath);
    if (stat.isDirectory()) {
      loadPrefixCommands(filePath);
    } else if (file.endsWith('.js')) {
      const required = require(filePath);
      const commands = Array.isArray(required) ? required : [required];
      for (const command of commands) {
        if (command.name && command.execute) {
          client.prefixCommands.set(command.name, command);
          if (command.aliases && Array.isArray(command.aliases)) {
            for (const alias of command.aliases) {
              client.prefixCommands.set(alias, command);
            }
          }
        }
      }
    }
  }
}
loadPrefixCommands(prefixCommandsPath);

// Chargement des événements
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
  for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
}

const { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, StringSelectMenuBuilder } = require('discord.js');

// Catégories de tickets
const TICKET_CATEGORIES = {
  ticket_recrutement: { label: 'Recrutement', emoji: '📋' },
  ticket_question:    { label: 'Question',    emoji: '❓' },
  ticket_gangwars:   { label: 'Gang Wars',   emoji: '⚔️' },
};

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

  const guildId = interaction.guild.id;
  const config = client.db.getGuildConfig(guildId);

  // --- SÉLECTION DE CATÉGORIE (Select Menu) ---
  if (interaction.customId === 'ticket_category_select') {
    const selected = interaction.values[0]; // ex: 'ticket_recrutement'
    
    if (selected === 'ticket_cancel') {
      return interaction.reply({ content: '❌ Sélection annulée.', ephemeral: true });
    }

    const category = TICKET_CATEGORIES[selected];
    if (!category) return;

    await interaction.deferReply({ ephemeral: true });

    const existingChannel = interaction.guild.channels.cache.find(
      c => c.name === `ticket-${interaction.user.username.toLowerCase()}`
    );
    if (existingChannel) {
      return interaction.editReply({ content: `❌ Vous avez déjà un ticket ouvert ici : ${existingChannel}` });
    }

    try {
      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        topic: `Ticket de ${interaction.user.id} | Catégorie: ${category.label}`,
        permissionOverwrites: [
          { id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
        ],
      });

      const welcomeEmbed = new EmbedBuilder()
        .setTitle(`${category.emoji} Ticket — ${category.label}`)
        .setDescription(`Bonjour ${interaction.user}, votre ticket **${category.label}** a bien été créé.\nL'équipe du serveur vous répondra dès que possible.`)
        .setColor(config.theme || '#5865F2')
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('Fermer le ticket')
          .setEmoji('🔒')
          .setStyle(ButtonStyle.Danger)
      );

      await channel.send({ content: `${interaction.user} | @here`, embeds: [welcomeEmbed], components: [row] });
      return interaction.editReply({ content: `✅ Votre ticket **${category.label}** a été créé : ${channel}` });
    } catch (err) {
      console.error(err);
      return interaction.editReply({ content: "❌ Impossible de créer le ticket." });
    }
  }

  // --- CRÉATION DE TICKET (ancien bouton, gardé pour compatibilité) ---
  if (interaction.customId === 'create_ticket') {
    await interaction.deferReply({ ephemeral: true });

    // Vérifier s'il y a déjà un ticket ouvert par ce membre
    const existingChannel = interaction.guild.channels.cache.find(c => c.name === `ticket-${interaction.user.username.toLowerCase()}`);
    if (existingChannel) {
      return interaction.editReply({ content: `❌ Vous avez déjà un ticket ouvert ici : ${existingChannel}` });
    }

    try {
      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        topic: `Ticket de ${interaction.user.id}`,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: interaction.user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
          },
        ],
      });

      const welcomeEmbed = new EmbedBuilder()
        .setTitle(`🎟️ Ticket ouvert`)
        .setDescription(`Bonjour ${interaction.user}, posez votre question ici. L'équipe du serveur vous répondra dès que possible.`)
        .setColor(config.theme || '#5865F2')
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('Fermer le ticket')
          .setEmoji('🔒')
          .setStyle(ButtonStyle.Danger)
      );

      await channel.send({ content: `${interaction.user} | @here`, embeds: [welcomeEmbed], components: [row] });
      return interaction.editReply({ content: `✅ Votre ticket a été créé : ${channel}` });
    } catch (err) {
      console.error(err);
      return interaction.editReply({ content: "❌ Impossible de créer le ticket." });
    }
  }

  // --- FERMETURE DE TICKET ---
  if (interaction.customId === 'close_ticket') {
    await interaction.deferUpdate();

    const channel = interaction.channel;
    const topic = channel.topic || '';
    const creatorId = topic.match(/Ticket de (\d+)/)?.[1];

    await channel.send("🔒 Fermeture du ticket en cours, génération du transcript...");

    // Récupérer les messages
    let messages;
    try {
      messages = await channel.messages.fetch({ limit: 100 });
    } catch (err) {
      messages = [];
    }

    // Générer le transcript texte
    let transcriptText = `TRANSCRIPT DU TICKET : ${channel.name}\n`;
    transcriptText += `Ouvert par l'utilisateur ID: ${creatorId || 'Inconnu'}\n`;
    transcriptText += `Généré le ${new Date().toLocaleString('fr-FR')}\n`;
    transcriptText += `=========================================\n\n`;

    const sortedMessages = Array.from(messages.values()).reverse();
    for (const msg of sortedMessages) {
      if (msg.author.bot && msg.embeds.length > 0) {
        transcriptText += `[${msg.createdAt.toLocaleString('fr-FR')}] [BOT] ${msg.author.tag} : (Embed)\n`;
      } else {
        transcriptText += `[${msg.createdAt.toLocaleString('fr-FR')}] ${msg.author.tag} : ${msg.content}\n`;
      }
    }

    const buffer = Buffer.from(transcriptText, 'utf-8');
    const attachment = new AttachmentBuilder(buffer, { name: `transcript-${channel.name}.txt` });

    // Envoyer en DM au créateur
    if (creatorId) {
      try {
        const creator = await client.users.fetch(creatorId);
        const dmEmbed = new EmbedBuilder()
          .setTitle("📁 Ticket Fermé")
          .setDescription(`Votre ticket sur le serveur **${interaction.guild.name}** a été fermé.\nVous trouverez ci-joint le transcript de vos échanges.`)
          .setColor(config.theme || '#5865F2')
          .setTimestamp();

        await creator.send({ embeds: [dmEmbed], files: [attachment] });
      } catch (err) {
        console.log(`Impossible d'envoyer le DM de transcript à l'utilisateur ${creatorId}`);
      }
    }

    // Optionnel : envoyer les logs dans le salon de logs s'il est configuré
    const targetChannelId = config.transcriptChannel || config.logsChannel;
    if (targetChannelId) {
      const logsChan = interaction.guild.channels.cache.get(targetChannelId);
      if (logsChan) {
        const logEmbed = new EmbedBuilder()
          .setTitle(`📁 Transcript - Ticket ${channel.name}`)
          .setDescription(`Le ticket de <@${creatorId || interaction.user.id}> a été fermé par ${interaction.user}.`)
          .setColor('#FF0000')
          .setTimestamp();
        await logsChan.send({ embeds: [logEmbed], files: [attachment] }).catch(() => {});
      }
    }

    // Supprimer le salon après 5 secondes
    setTimeout(async () => {
      await channel.delete().catch(() => {});
    }, 5000);
  }
});

client.once('ready', () => {
  console.log(`✅ S-V Protect connecté en tant que ${client.user.tag}`);
  client.user.setActivity('@loyalmadog', { type: require('discord.js').ActivityType.Playing });
});

// Serveur HTTP minimal pour Render (UptimeRobot)
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write("S-V Protect is running!");
  res.end();
}).listen(process.env.PORT || 3000, () => {
  console.log(`📡 Serveur web démarré sur le port ${process.env.PORT || 3000}`);
});

// Écouteur d'erreur Discord
client.on('error', e => console.error(`[Discord Error]`, e));

client.login(process.env.TOKEN);
