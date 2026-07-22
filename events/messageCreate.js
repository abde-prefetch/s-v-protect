const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { isOwner, OWNER_IDS } = require('../config');

const spamMap = new Map();
const SPAM_LIMIT = 5; 
const SPAM_TIME = 5000; 
const TIMEOUT_DURATION = 60 * 1000; 

const MASS_PING_LIMIT = 5; 

const linkSpamMap = new Map();
const LINK_SPAM_LIMIT = 3;
const LINK_SPAM_WINDOW = 5 * 60 * 1000; // 5 minutes
const LINK_TIMEOUT_DURATION = 24 * 60 * 60 * 1000; // 24 heures

// Fonction d'aide pour gérer le spam de liens
async function handleLinkSpam(message, config) {
  const userId = message.author.id;
  const now = Date.now();
  
  if (!linkSpamMap.has(userId)) {
    linkSpamMap.set(userId, []);
  }
  
  const timestamps = linkSpamMap.get(userId);
  const activeTimestamps = timestamps.filter(t => now - t < LINK_SPAM_WINDOW);
  activeTimestamps.push(now);
  linkSpamMap.set(userId, activeTimestamps);
  
  if (activeTimestamps.length >= LINK_SPAM_LIMIT) {
    linkSpamMap.delete(userId); // Reset
    try {
      if (message.member && message.member.moderatable) {
        await message.member.timeout(LINK_TIMEOUT_DURATION, "S-V Guard: Spam de liens/invitations (3 fois en 5 min)");
        await message.channel.send(`🚨 ${message.author} a été rendu muet pour 24 heures après avoir envoyé 3 liens en moins de 5 minutes.`);
        
        // Log
        if (config.logsChannel) {
          const logsChan = message.guild.channels.cache.get(config.logsChannel);
          if (logsChan) {
            const logEmbed = new EmbedBuilder()
              .setTitle('🚨 Sanction Automatique — Anti-Spam Liens')
              .setDescription(`Un utilisateur a été rendu muet pour 24 heures pour spam de liens.`)
              .addFields(
                { name: '👤 Utilisateur', value: `${message.author} (${message.author.id})`, inline: true },
                { name: '🛡️ Raison', value: 'Spam de liens/invitations (3 fois en 5 minutes)', inline: true },
                { name: '⏱️ Durée', value: '24 heures (Timeout)', inline: true }
              )
              .setColor('#ED4245')
              .setTimestamp();
            await logsChan.send({ embeds: [logEmbed] }).catch(() => {});
          }
        }
      }
    } catch (err) {
      console.error("Erreur lors du timeout anti-spam liens :", err);
    }
    return true;
  }
  return false;
} 

module.exports = {
  name: 'messageCreate',
  handleLinkSpam,
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    console.log(`[DEBUG] Bot Gestion - Message reçu de ${message.author.tag} (${message.author.id}) : "${message.content}"`);

    const guildId = message.guild.id;
    const config = client.db.getGuildConfig(guildId);
    const globalData = client.db.getGlobalData();

    // --- CHECK BLACKLIST ---
    if (globalData.blacklist && globalData.blacklist.includes(message.author.id)) return;
    if (config.blacklist && config.blacklist.includes(message.author.id)) return;

    // --- PREFIX COMMAND HANDLER ---
    const prefix = config.prefix || '+';
    if (message.content.startsWith(prefix)) {
      const args = message.content.slice(prefix.length).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();

      // Check if command is disabled
      if (config.disabledCommands && config.disabledCommands.includes(commandName)) {
        return message.reply("❌ Cette commande a été désactivée sur ce serveur.");
      }

      const command = client.prefixCommands.get(commandName);
      if (command) {
        const GLOBAL_OWNER_ID = OWNER_IDS[0];
        const isGlobalOwner = isOwner(message.author.id);
        const isLocalWhitelisted = config.whitelist && config.whitelist.includes(message.author.id);

        // Seul un propriétaire global absolu peut utiliser les commandes de la catégorie 'owner'
        if (command.category === 'owner' && !isGlobalOwner) {
          return message.reply(`❌ Seul un propriétaire global du bot peut utiliser cette commande.`);
        }

        // Bypass permissions pour le global owner et les whitelistés locaux
        const originalHas = message.member.permissions.has.bind(message.member.permissions);
        if (isGlobalOwner || isLocalWhitelisted) {
          message.member.permissions.has = () => true;
        }

        try {
          return await command.execute(message, args, client);
        } catch (error) {
          console.error(`Erreur commande préfixée ${commandName}:`, error);
          return message.reply("❌ Une erreur est survenue lors de l'exécution de la commande.");
        } finally {
          if (isGlobalOwner || isLocalWhitelisted) {
            message.member.permissions.has = originalHas;
          }
        }
      }
    }

    // --- BYPASS SECURITY CHECKS FOR WHITELISTED / OWNER ---
    const isWhitelisted = isOwner(message.author.id) || 
                          (config.whitelist && config.whitelist.includes(message.author.id));

    if (isWhitelisted) return;

    // --- PIC ONLY CHANNELS ---
    if (config.piconlyChannels && config.piconlyChannels.includes(message.channel.id)) {
      const hasAttachment = message.attachments.size > 0;
      const hasLink = /(https?:\/\/[^\s]+)/g.test(message.content);
      if (!hasAttachment && !hasLink) {
        try {
          await message.delete();
          return;
        } catch (err) {
          console.error(err);
        }
      }
    }

    // --- BAD WORDS ---
    if (config.badwords && config.badwords.length > 0) {
      const contentLower = message.content.toLowerCase();
      const hasBadWord = config.badwords.some(word => contentLower.includes(word.toLowerCase()));
      if (hasBadWord) {
        try {
          await message.delete();
          await message.channel.send(`⚠️ ${message.author}, merci de surveiller votre langage.`);
          return;
        } catch (err) {
          console.error(err);
        }
      }
    }

    // --- NETTOYAGE DU CONTENU POUR EVITER LES BYPASS MARCKDOWN ---
    // Enlève les caractères de formatage Discord (ex: #, *, _, ~, `, \, |, /) qui cassent les regex
    const cleanedContent = message.content
      .toLowerCase()
      .replace(/[*_~`\\#|]/g, '') // Supprime le markdown de formatage et les antislashs
      .replace(/\s+/g, '');       // Supprime tous les espaces pour contrer les "discord . gg" ou "http : //"

    // --- ANTI-INVITE ---
    // On le gère en premier car une invitation est aussi un lien
    if (config.antiInvite) {
      // Détecte "discord.gg", "discord.com/invite", "discordapp.com/invite"
      const inviteRegex = /(discord\.gg|discord\.com\/invite|discordapp\.com\/invite|discord\.io|discord\.me)/i;
      if (inviteRegex.test(cleanedContent)) {
        try {
          await message.delete();
          const spammed = await handleLinkSpam(message, config);
          if (!spammed) {
            await message.channel.send(`⚠️ ${message.author}, les invitations Discord ne sont pas autorisées.`);
          }
          return;
        } catch (err) {
          console.error("Erreur lors de la suppression de l'invitation :", err);
        }
      }
    }

    // --- ANTI-LINK ---
    if (config.antiLink) {
      // Détecte les protocoles "http://", "https://" et "www." mais aussi les formats de domaine classiques
      // comme "site.com", "site.fr/chemin" même attachés à d'autres caractères
      const linkRegex = /(https?:\/\/|www\.|[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.(com|fr|net|org|io|info|gov|edu|me|xyz|gg|co|tk|cf|ga|gq|ml|us|uk|ca|de|jp|cn|ru|it|nl|se|no|dk|ch|at|es|pt|br|in|au|pl|ua|tr|gr|ro|cz|hu|ro|be|lu|ie|is|fi|ee|lv|lt|by|md|rs|hr|si|bg|al|mk|me|ge|am|az)(\/.*)?)/i;
      if (linkRegex.test(cleanedContent)) {
        try {
          await message.delete();
          const spammed = await handleLinkSpam(message, config);
          if (!spammed) {
            await message.channel.send(`⚠️ ${message.author}, les liens ne sont pas autorisés sur ce serveur.`);
          }
          return; 
        } catch (err) {
          console.error("Erreur lors de la suppression du lien :", err);
        }
      }
    }

    // --- ANTI-MASS PING ---
    if (config.antiMassPing && message.mentions.users.size > MASS_PING_LIMIT) {
      try {
        await message.delete();
        await message.member.timeout(TIMEOUT_DURATION, 'Anti-Mass Ping: Trop de mentions dans un seul message');
        await message.channel.send(`🚨 ${message.author} a été rendu muet pour avoir mentionné trop de personnes (Mass Ping).`);
        return;
      } catch (err) {
        console.error("Impossible de sanctionner le mass ping :", err);
      }
    }

    // --- ANTI-SPAM ---
    if (config.antiSpam) {
      const userId = message.author.id;
      if (spamMap.has(userId)) {
        const userData = spamMap.get(userId);
        userData.msgCount += 1;

        if (userData.msgCount >= SPAM_LIMIT) {
          try {
            await message.delete();
            if (message.member.bannable) {
              await message.member.ban({ reason: 'Anti-Spam: Trop de messages rapides' });
              await message.channel.send(`🚨 **${message.author.tag}** a été banni pour spam massif.`);
            } else {
              await message.channel.send(`🚨 Impossible de bannir ${message.author} (hiérarchie trop élevée).`);
            }
            clearTimeout(userData.timer);
            spamMap.delete(userId);
            return;
          } catch (err) {
            console.error("Impossible de bannir pour spam :", err);
          }
        } else {
          spamMap.set(userId, userData);
        }
      } else {
        const timer = setTimeout(() => {
          spamMap.delete(userId);
        }, SPAM_TIME);

        spamMap.set(userId, { msgCount: 1, timer });
      }
    }
  },
};
