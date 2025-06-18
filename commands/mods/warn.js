const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../../util/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Gérer les avertissements des utilisateurs')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Avertir un utilisateur')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('Utilisateur à avertir')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('reason')
            .setDescription('Raison de l\'avertissement')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Retirer un avertissement à un utilisateur')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('Utilisateur concerné')
            .setRequired(true))
        .addIntegerOption(option =>
          option.setName('id')
            .setDescription('ID de l\'avertissement à retirer')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('Afficher les avertissements d\'un utilisateur')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('Utilisateur concerné')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('clear')
        .setDescription('Supprimer tous les avertissements d\'un utilisateur')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('Utilisateur concerné')
            .setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const user = interaction.options.getUser('user');
    const guildId = interaction.guild.id;
    const warnsKey = `warns_${guildId}_${user.id}`;
    
    if (subcommand === 'add') {
      const reason = interaction.options.getString('reason') || 'Aucune raison fournie';
      const moderator = interaction.user;
      const timestamp = Date.now();
      
      // Récupérer les avertissements existants ou créer un tableau vide
      const warns = await db.get(warnsKey) || [];
      
      // Créer un nouvel avertissement
      const warnId = warns.length + 1;
      const newWarn = {
        id: warnId,
        reason,
        moderator: moderator.id,
        timestamp
      };
      
      // Ajouter l'avertissement à la liste
      warns.push(newWarn);
      await db.set(warnsKey, warns);
      
      // Créer l'embed de réponse
      const embed = new EmbedBuilder()
        .setColor('#8B0000')
        .setTitle('⚠️ Avertissement ajouté')
        .setDescription(`${user} a reçu un avertissement (ID: ${warnId})`)
        .addFields(
          { name: 'Raison', value: reason },
          { name: 'Modérateur', value: moderator.toString() },
          { name: 'Total', value: `${warns.length} avertissement(s)` }
        )
        .setTimestamp();
      
      // Envoyer la notification à l'utilisateur
      try {
        const dmEmbed = new EmbedBuilder()
          .setColor('#8B0000')
          .setTitle(`⚠️ Vous avez reçu un avertissement sur ${interaction.guild.name}`)
          .addFields(
            { name: 'Raison', value: reason },
            { name: 'Modérateur', value: moderator.toString() }
          )
          .setTimestamp();
        
        await user.send({ embeds: [dmEmbed] });
      } catch (error) {
        // L'utilisateur a peut-être désactivé ses DMs
        console.log(`Impossible d'envoyer un DM à ${user.tag}: ${error.message}`);
      }
      
      return interaction.reply({ embeds: [embed] });
    }
    
    else if (subcommand === 'remove') {
      const warnId = interaction.options.getInteger('id');
      
      // Récupérer les avertissements existants
      const warns = await db.get(warnsKey) || [];
      
      // Vérifier si l'avertissement existe
      const warnIndex = warns.findIndex(warn => warn.id === warnId);
      if (warnIndex === -1) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#8B0000')
          .setTitle('❌ Erreur')
          .setDescription(`L'avertissement avec l'ID ${warnId} n'existe pas pour ${user}.`)
          .setTimestamp();
        
        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
      
      // Supprimer l'avertissement
      warns.splice(warnIndex, 1);
      
      // Réindexer les IDs
      warns.forEach((warn, index) => {
        warn.id = index + 1;
      });
      
      // Sauvegarder les modifications
      await db.set(warnsKey, warns);
      
      const embed = new EmbedBuilder()
        .setColor('#8B0000')
        .setTitle('✅ Avertissement retiré')
        .setDescription(`L'avertissement avec l'ID ${warnId} a été retiré pour ${user}.`)
        .addFields(
          { name: 'Total', value: `${warns.length} avertissement(s)` }
        )
        .setTimestamp();
      
      return interaction.reply({ embeds: [embed] });
    }
    
    else if (subcommand === 'list') {
      // Récupérer les avertissements existants
      const warns = await db.get(warnsKey) || [];
      
      if (warns.length === 0) {
        const embed = new EmbedBuilder()
          .setColor('#8B0000')
          .setTitle('📋 Avertissements')
          .setDescription(`${user} n'a aucun avertissement.`)
          .setTimestamp();
        
        return interaction.reply({ embeds: [embed] });
      }
      
      // Créer la liste des avertissements
      let warnList = '';
      for (const warn of warns) {
        const moderator = await interaction.client.users.fetch(warn.moderator).catch(() => ({ tag: 'Utilisateur inconnu' }));
        const date = new Date(warn.timestamp).toLocaleString();
        warnList += `**ID ${warn.id}** | ${date}\n`;
        warnList += `**Raison:** ${warn.reason}\n`;
        warnList += `**Modérateur:** ${moderator.tag}\n\n`;
      }
      
      const embed = new EmbedBuilder()
        .setColor('#8B0000')
        .setTitle(`📋 Avertissements de ${user.tag}`)
        .setDescription(warnList)
        .setFooter({ text: `Total: ${warns.length} avertissement(s)` })
        .setTimestamp();
      
      return interaction.reply({ embeds: [embed] });
    }
    
    else if (subcommand === 'clear') {
      // Récupérer les avertissements existants
      const warns = await db.get(warnsKey) || [];
      
      if (warns.length === 0) {
        const embed = new EmbedBuilder()
          .setColor('#8B0000')
          .setTitle('📋 Avertissements')
          .setDescription(`${user} n'a aucun avertissement.`)
          .setTimestamp();
        
        return interaction.reply({ embeds: [embed] });
      }
      
      // Supprimer tous les avertissements
      await db.delete(warnsKey);
      
      const embed = new EmbedBuilder()
        .setColor('#8B0000')
        .setTitle('✅ Avertissements supprimés')
        .setDescription(`Tous les avertissements de ${user} ont été supprimés (${warns.length} au total).`)
        .setTimestamp();
      
      return interaction.reply({ embeds: [embed] });
    }
  }
}; 