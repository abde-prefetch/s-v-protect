const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'embed',
  category: 'moderation',
  description: "Envoie un embed personnalisé dans un salon.",
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply("❌ Permission `Gérer les messages` requise.");
    }

    const config = client.db.getGuildConfig(message.guild.id);
    const prefix = config.prefix || '+';

    // +embed #salon "Titre" "Description" #couleur
    // ou +embed "Titre" "Description"
    // Syntaxe souple via parsing des arguments

    // Récupérer le salon cible (optionnel, sinon salon actuel)
    let targetChannel = message.mentions.channels.first() || message.channel;

    // Retirer la mention du salon des args si elle existe
    let content = args.join(' ');
    if (message.mentions.channels.size > 0) {
      content = content.replace(/<#\d+>/g, '').trim();
    }

    // Parser les "guillemets" pour extraire titre, description et footer
    const parts = [];
    const regex = /"((?:[^"\\]|\\.)*)"/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      parts.push(match[1].replace(/\\n/g, '\n'));
    }

    // Chercher une couleur hex dans le contenu (#RRGGBB)
    const colorMatch = content.match(/#([0-9A-Fa-f]{6})\b/);
    const color = colorMatch ? `#${colorMatch[1]}` : (config.theme || '#5865F2');

    if (parts.length === 0) {
      return message.reply(
        `❌ Usage : \`${prefix}embed [#salon] "Titre" "Description" [#couleur]\`\n\n` +
        `**Exemples :**\n` +
        `\`${prefix}embed "Mon titre" "Ma description"\`\n` +
        `\`${prefix}embed #annonces "Annonce importante" "Contenu de l'annonce ici\\nNouvelle ligne" #FF5500\`\n\n` +
        `> ℹ️ Utilisez \\\\n dans la description pour sauter une ligne.`
      );
    }

    const title = parts[0] || null;
    const description = parts[1] || null;
    const footer = parts[2] || null;

    const embed = new EmbedBuilder().setColor(color);

    if (title) embed.setTitle(title);
    if (description) embed.setDescription(description);
    if (footer) embed.setFooter({ text: footer });

    embed.setTimestamp();

    try {
      await targetChannel.send({ embeds: [embed] });
      if (targetChannel.id !== message.channel.id) {
        return message.reply(`✅ Embed envoyé dans ${targetChannel}.`);
      } else {
        // Supprimer la commande discrètement si même salon
        await message.delete().catch(() => {});
      }
    } catch (err) {
      return message.reply("❌ Impossible d'envoyer l'embed dans ce salon.");
    }
  }
};
