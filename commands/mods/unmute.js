import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Rendre la parole à un utilisateur')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Utilisateur à unmute')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const embed = new EmbedBuilder()
      .setColor('#8B0000')
      .setTitle('🔊 Unmute')
      .setDescription(`${user} a été unmute (stub).`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
};
