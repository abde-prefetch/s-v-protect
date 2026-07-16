// Stockage simple des arrivées récentes en mémoire
const joinHistory = [];
const RAID_JOIN_LIMIT = 10; // Nombre de membres
const RAID_TIME_WINDOW = 10000; // Fenêtre de temps en ms (10 secondes)

let isUnderRaid = false;
let raidTimeout = null;

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    const now = Date.now();
    joinHistory.push(now);

    // Nettoyer l'historique (garder seulement les arrivées dans la fenêtre de temps)
    while (joinHistory.length > 0 && joinHistory[0] < now - RAID_TIME_WINDOW) {
      joinHistory.shift();
    }

    if (joinHistory.length >= RAID_JOIN_LIMIT) {
      if (!isUnderRaid) {
        isUnderRaid = true;
        console.log(`🚨 RAID DÉTECTÉ sur ${member.guild.name} ! Activation du mode protection.`);
        
        // Trouver le salon système pour prévenir si possible
        const systemChannel = member.guild.systemChannel;
        if (systemChannel) {
          systemChannel.send(`🚨 **ALERTE RAID** 🚨\nTrop de membres ont rejoint en peu de temps. Les nouveaux membres seront expulsés automatiquement pendant quelques minutes.`);
        }
      }

      // Renouveler la période de raid à chaque nouvelle arrivée pendant le raid
      clearTimeout(raidTimeout);
      raidTimeout = setTimeout(() => {
        isUnderRaid = false;
        console.log(`✅ Fin du raid sur ${member.guild.name}.`);
        const systemChannel = member.guild.systemChannel;
        if (systemChannel) {
          systemChannel.send(`✅ L'alerte raid est levée. Les membres peuvent rejoindre normalement.`);
        }
      }, 60 * 1000 * 5); // Le mode raid s'arrête 5 minutes après la dernière arrivée suspecte
    }

    if (isUnderRaid) {
      try {
        await member.kick('Anti-Raid: Mode protection activé (kick automatique)');
        console.log(`🛡️ ${member.user.tag} expulsé (Anti-Raid)`);
        return; // On arrête là si le membre est expulsé
      } catch (err) {
        console.error("Impossible d'expulser le membre pendant le raid :", err);
      }
    }

    // --- AUTOROLE ---
    const config = client.db.getGuildConfig(member.guild.id);
    if (config && config.autorole) {
      const role = member.guild.roles.cache.get(config.autorole);
      if (role) {
        member.roles.add(role).catch(err => console.error(`Impossible d'ajouter l'autorole à ${member.user.tag}:`, err));
      }
    }
  },
};
