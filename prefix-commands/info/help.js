const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  category: 'info',
  description: "Affiche la liste de toutes les commandes du bot.",
  async execute(message, args, client) {
    const config = client.db.getGuildConfig(message.guild.id);
    const prefix = config.prefix || '+';

    const categories = {
      owner: '👑 Owner',
      moderation: '🔨 Modération',
      giveaway: '🎉 Giveaway',
      info: '━━ Informations ━━',
      config: '⚙️ Configuration',
      protection: '🛡️ Protection'
    };

    // Obtenir toutes les commandes uniques (exclure les alias)
    const uniqueCommands = new Set();
    client.prefixCommands.forEach(cmd => {
      uniqueCommands.add(cmd);
    });

    const embeds = [];

    // On crée un embed principal
    const embed = new EmbedBuilder()
      .setTitle('📚 Liste des commandes S-V Protect')
      .setDescription(`Le préfixe sur ce serveur est \`${prefix}\`.`)
      .setColor(config.theme || '#5865F2')
      .setTimestamp();

    // Regrouper les commandes par catégorie
    for (const [key, label] of Object.entries(categories)) {
      const catCmds = Array.from(uniqueCommands)
        .filter(cmd => cmd.category === key)
        .map(cmd => `\`${prefix}${cmd.name}\``)
        .join(', ');

      if (catCmds) {
        embed.addFields({ name: label, value: catCmds, inline: false });
      }
    }

    return message.reply({ embeds: [embed] });
  }
};
