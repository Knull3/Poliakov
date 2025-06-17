import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Passe à la musique suivante'),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setColor('#8B0000')
      .setTitle('⏭️ Musique')
      .setDescription('Les commandes de musique sont en cours de développement.')
      .addFields(
        { name: 'Action', value: 'Passer à la suivante', inline: true },
        { name: 'Statut', value: '⏳ En développement', inline: true }
      )
      .setTimestamp()
      .setFooter({ text: client.config.name });
    
    await interaction.reply({ embeds: [embed] });
  }
}; 