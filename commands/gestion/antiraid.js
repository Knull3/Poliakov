const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antiraid')
    .setDescription('Configuration de l\'anti-raid')
    .addSubcommand(subcommand =>
      subcommand
        .setName('status')
        .setDescription('Voir le statut de l\'anti-raid'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('enable')
        .setDescription('Activer l\'anti-raid'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('disable')
        .setDescription('Désactiver l\'anti-raid'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'status') {
      const embed = new EmbedBuilder()
        .setColor('#8B0000')
        .setTitle('🛡️ Statut Anti-Raid')
        .setDescription('L\'anti-raid est actuellement **en cours de développement**.\n\n**Fonctionnalités prévues :**\n• Détection automatique des raids\n• Protection des rôles et canaux\n• Système de whitelist\n• Logs détaillés')
        .addFields(
          { name: '📊 Statut', value: '🟡 En développement', inline: true },
          { name: '🔧 Version', value: '2.0 (ES Module)', inline: true },
          { name: '⚡ Compatibilité', value: 'Discord.js v14+', inline: true }
        )
        .setFooter({ text: client.config.name })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (subcommand === 'enable') {
      const embed = new EmbedBuilder()
        .setColor('#8B0000')
        .setTitle('✅ Anti-Raid Activé')
        .setDescription('L\'anti-raid a été activé pour ce serveur.\n\n**Note :** Cette fonctionnalité est en cours de développement et sera pleinement opérationnelle dans une prochaine mise à jour.')
        .setFooter({ text: client.config.name })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (subcommand === 'disable') {
      const embed = new EmbedBuilder()
        .setColor('#8B0000')
        .setTitle('❌ Anti-Raid Désactivé')
        .setDescription('L\'anti-raid a été désactivé pour ce serveur.')
        .setFooter({ text: client.config.name })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }
  }
};
