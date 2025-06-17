import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Joue de la musique depuis YouTube ou Spotify')
    .addStringOption(option =>
      option.setName('lien')
        .setDescription('Lien YouTube ou Spotify, ou nom de la chanson')
        .setRequired(true)),
  
  async execute(interaction, client) {
    const query = interaction.options.getString('lien');
    
    const embed = new EmbedBuilder()
      .setColor('#8B0000')
      .setTitle('🎵 Musique')
      .setDescription('Les commandes de musique sont en cours de développement.')
      .addFields(
        { name: 'Recherche', value: query, inline: true },
        { name: 'Statut', value: '⏳ En développement', inline: true }
      )
      .setTimestamp()
      .setFooter({ text: client.config.name });
    
    await interaction.reply({ embeds: [embed] });
  }
}; 