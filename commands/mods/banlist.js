const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('banlist')
    .setDescription('Afficher la liste des bannis du serveur')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    await interaction.deferReply();
    
    try {
      // Récupérer la liste des bannis
      const bans = await interaction.guild.bans.fetch();
      
      if (bans.size === 0) {
        return interaction.followUp({
          embeds: [
            new EmbedBuilder()
              .setColor('#8B0000')
              .setTitle('📜 Liste des bannis')
              .setDescription('Aucun utilisateur banni sur ce serveur.')
              .setTimestamp()
          ]
        });
      }
      
      // Limiter à 25 bannis par page pour éviter de dépasser la limite d'embed
      const maxBansPerPage = 25;
      const totalPages = Math.ceil(bans.size / maxBansPerPage);
      const currentPage = 1;
      
      // Obtenir les bannis pour la page actuelle
      const startIndex = (currentPage - 1) * maxBansPerPage;
      const endIndex = Math.min(startIndex + maxBansPerPage, bans.size);
      const currentBans = Array.from(bans.values()).slice(startIndex, endIndex);
      
      // Créer une liste formatée des bannis
      let banList = '';
      
      currentBans.forEach((ban, index) => {
        const user = ban.user;
        const reason = ban.reason || 'Aucune raison fournie';
        banList += `**${startIndex + index + 1}.** ${user.tag} (ID: ${user.id})\n`;
        banList += `└ Raison: ${reason}\n\n`;
      });
      
      // Créer l'embed
      const embed = new EmbedBuilder()
        .setColor('#8B0000')
        .setTitle('📜 Liste des bannis')
        .setDescription(banList)
        .setFooter({ 
          text: `Page ${currentPage}/${totalPages} • Total: ${bans.size} utilisateur${bans.size > 1 ? 's' : ''} banni${bans.size > 1 ? 's' : ''}` 
        })
        .setTimestamp();
      
      await interaction.followUp({ embeds: [embed] });
      
      // Note: Pour une implémentation complète, on pourrait ajouter des boutons de pagination
      // pour naviguer entre les différentes pages de bannis si le nombre est important
      
    } catch (error) {
      console.error('Erreur lors de la récupération des bannis:', error);
      await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ Erreur')
            .setDescription('Une erreur est survenue lors de la récupération de la liste des bannis.')
            .setTimestamp()
        ],
        ephemeral: true
      });
    }
  }
};
