const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Créer des embeds personnalisés')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Créer un embed personnalisé')
        .addStringOption(option =>
          option.setName('title')
            .setDescription('Titre de l\'embed')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('description')
            .setDescription('Description de l\'embed')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('color')
            .setDescription('Couleur de l\'embed (hex)')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('help')
        .setDescription('Aide pour créer des embeds'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'create') {
      const title = interaction.options.getString('title');
      const description = interaction.options.getString('description');
      const color = interaction.options.getString('color') || '#8B0000';

      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setFooter({ text: client.config.name })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (subcommand === 'help') {
      const embed = new EmbedBuilder()
        .setColor('#8B0000')
        .setTitle('📝 Aide - Création d\'Embeds')
        .setDescription('**Comment créer un embed :**\n\n`/embed create title:"Mon titre" description:"Ma description" color:"#8B0000"`\n\n**Paramètres :**\n• `title` : Le titre de l\'embed\n• `description` : Le contenu de l\'embed\n• `color` : La couleur (optionnel, défaut: #8B0000)\n\n**Exemple :**\n`/embed create title:"Bienvenue !" description:"Bienvenue sur le serveur !" color:"#00FF00"`')
        .setFooter({ text: client.config.name })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }
  }
};
