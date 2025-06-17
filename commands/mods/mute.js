const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

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
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Aucune raison fournie';
    const embed = new EmbedBuilder()
      .setColor('#8B0000')
      .setTitle('🔇 Mute')
      .setDescription(`L'utilisateur ${user} a été rendu muet.\nRaison : ${reason}`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
};
