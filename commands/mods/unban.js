const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Débannir un utilisateur du serveur')
    .addStringOption(option =>
      option.setName('userid')
        .setDescription('ID de l\'utilisateur à débannir')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const userid = interaction.options.getString('userid');
    const embed = new EmbedBuilder()
      .setColor('#8B0000')
      .setTitle('🔓 Débannissement')
      .setDescription(`L'utilisateur avec l'ID ${userid} a été débanni.`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
};
