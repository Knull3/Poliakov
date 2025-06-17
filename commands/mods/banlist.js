import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('banlist')
    .setDescription('Afficher la liste des bannis du serveur')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#8B0000')
      .setTitle('📜 Liste des bannis')
      .setDescription('Aucun banni trouvé (stub).')
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
};
