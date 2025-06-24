const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Rendre la parole à un utilisateur')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Utilisateur à unmute')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers),

  async execute(interaction) {
    await interaction.deferReply();
    
    try {
      const user = interaction.options.getUser('user');
      const guild = interaction.guild;
      const member = await guild.members.fetch(user.id).catch(() => null);
      
      if (!member) {
        return interaction.followUp({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('❌ Erreur')
              .setDescription('Utilisateur introuvable sur ce serveur.')
              .setTimestamp()
          ]
        });
      }
      
      // Vérifier si le bot a les permissions nécessaires
      if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
        return interaction.followUp({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('❌ Erreur')
              .setDescription('Je n\'ai pas la permission de gérer les rôles.')
              .setTimestamp()
          ]
        });
      }
      
      // Récupérer le rôle muet
      const muteRoleId = await db.get(`muterole_${guild.id}`);
      let muteRole = muteRoleId ? guild.roles.cache.get(muteRoleId) : null;
      
      // Si aucun rôle muet n'est défini, chercher un rôle "muet" standard
      if (!muteRole) {
        muteRole = guild.roles.cache.find(role => 
          role.name.toLowerCase() === 'muted' || 
          role.name.toLowerCase() === 'muet'
        );
      }
      
      // Vérifier si le membre a le rôle muet
      if (muteRole && member.roles.cache.has(muteRole.id)) {
        // Enlever le rôle muet
        await member.roles.remove(muteRole);
        
        // Répondre avec succès
        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('🔊 Unmute')
          .setDescription(`${user} a retrouvé la parole.`)
          .setTimestamp();
          
        await interaction.followUp({ embeds: [embed] });
      } else {
        // Le membre n'a pas le rôle muet
        return interaction.followUp({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('❓ Information')
              .setDescription(`${user} n'est pas muet.`)
              .setTimestamp()
          ]
        });
      }
    } catch (error) {
      console.error('Erreur lors du unmute:', error);
      await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ Erreur')
            .setDescription('Une erreur est survenue lors du unmute de l\'utilisateur.')
            .setTimestamp()
        ],
        ephemeral: true
      });
    }
  }
};
