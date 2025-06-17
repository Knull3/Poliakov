const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Avertir un utilisateur')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Utilisateur à avertir')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Raison de l\'avertissement')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Aucune raison fournie';
    const embed = new EmbedBuilder()
      .setColor('#8B0000')
      .setTitle('⚠️ Avertissement')
      .setDescription(`${user} a été averti.\nRaison : ${reason}`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}; 