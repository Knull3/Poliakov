const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Rendre muet un utilisateur')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Utilisateur à rendre muet')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Raison du mute')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers),

  async execute(interaction) {
    await interaction.deferReply();
    
    try {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'Aucune raison fournie';
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
        
        // Si aucun rôle muet n'est trouvé, informer l'utilisateur
        if (!muteRole) {
          return interaction.followUp({
            embeds: [
              new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Erreur')
                .setDescription('Aucun rôle muet n\'est défini sur ce serveur. Utilisez `/muterole` pour définir un rôle muet.')
                .setTimestamp()
            ]
          });
        }
      }
      
      // Vérifier si le rôle est plus haut que celui du bot
      if (muteRole.position >= guild.members.me.roles.highest.position) {
        return interaction.followUp({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('❌ Erreur')
              .setDescription('Je ne peux pas attribuer ce rôle car il est plus haut que mon rôle le plus élevé.')
              .setTimestamp()
          ]
        });
      }
      
      // Appliquer le rôle muet
      await member.roles.add(muteRole);
      
      // Répondre avec succès
      const embed = new EmbedBuilder()
        .setColor('#8B0000')
        .setTitle('🔇 Mute')
        .setDescription(`L'utilisateur ${user} a été rendu muet.\nRaison : ${reason}`)
        .setTimestamp();
        
      await interaction.followUp({ embeds: [embed] });
      
    } catch (error) {
      console.error('Erreur lors du mute:', error);
      await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ Erreur')
            .setDescription('Une erreur est survenue lors du mute de l\'utilisateur.')
            .setTimestamp()
        ],
        ephemeral: true
      });
    }
  }
};
