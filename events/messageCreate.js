const { PermissionFlagsBits } = require('discord.js');

const spamMap = new Map();
const SPAM_LIMIT = 5; 
const SPAM_TIME = 5000; 
const TIMEOUT_DURATION = 60 * 1000; 

const MASS_PING_LIMIT = 5; 

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

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
        const GLOBAL_OWNER_ID = '578019414830743586';
        const isGlobalOwner = message.author.id === GLOBAL_OWNER_ID;
        const isLocalWhitelisted = config.whitelist && config.whitelist.includes(message.author.id);

        // Seul le propriétaire global absolu peut utiliser les commandes de la catégorie 'owner'
        if (command.category === 'owner' && !isGlobalOwner) {
          return message.reply("❌ Seul le propriétaire global du bot (<@578019414830743586>) peut utiliser cette commande.");
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

    const GLOBAL_OWNER_ID = '578019414830743586';
    // --- BYPASS SECURITY CHECKS FOR WHITELISTED / ADMINS / OWNER ---
    const isWhitelisted = message.author.id === GLOBAL_OWNER_ID || 
                          (config.whitelist && config.whitelist.includes(message.author.id)) ||
                          (message.member && message.member.permissions.has(PermissionFlagsBits.Administrator));

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

    // --- ANTI-LINK ---
    if (config.antiLink) {
      const linkRegex = /(https?:\/\/[^\s]+)/g;
      if (linkRegex.test(message.content)) {
        // Check if anti-invite is also on and it is an invite link
        const isInvite = /(discord\.gg|discord\.com\/invite)/g.test(message.content);
        if (isInvite && config.antiInvite) {
          // Handled below or treated as link
        }
        try {
          await message.delete();
          await message.channel.send(`⚠️ ${message.author}, les liens ne sont pas autorisés sur ce serveur.`);
          return; 
        } catch (err) {
          console.error("Impossible de supprimer le lien :", err);
        }
      }
    }

    // --- ANTI-INVITE ---
    if (config.antiInvite) {
      const inviteRegex = /(discord\.gg|discord\.com\/invite)/g;
      if (inviteRegex.test(message.content)) {
        try {
          await message.delete();
          await message.channel.send(`⚠️ ${message.author}, les invitations Discord ne sont pas autorisées.`);
          return;
        } catch (err) {
          console.error(err);
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
