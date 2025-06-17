import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('rolemenu')
    .setDescription('Configurer un menu de rôles')
    .addSubcommand(subcommand =>
      subcommand
        .setName('setup')
        .setDescription('Configurer le menu de rôles'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('Lister les menus de rôles'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === 'setup') {
      const embed = new EmbedBuilder()
        .setColor('#8B0000')
        .setTitle('🎭 Configuration Menu de Rôles')
        .setDescription('**Note :** Cette fonctionnalité sera disponible dans une prochaine mise à jour.')
        .setFooter({ text: client.config.name })
        .setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }
    if (subcommand === 'list') {
      const embed = new EmbedBuilder()
        .setColor('#8B0000')
        .setTitle('📋 Menus de Rôles')
        .setDescription('Aucun menu de rôles configuré.\n\n**Note :** Cette fonctionnalité sera disponible dans une prochaine mise à jour.')
        .setFooter({ text: client.config.name })
        .setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }
  }
};
