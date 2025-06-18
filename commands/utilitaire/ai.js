const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ai')
    .setDescription('Poser une question à l\'IA Gemini')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('La question à poser à l\'IA')
        .setRequired(true)),

  async execute(interaction, client) {
    await interaction.deferReply();
    
    const question = interaction.options.getString('question');
    
    try {
      // Vérifier si la clé API est configurée
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#8B0000')
              .setTitle('❌ Configuration manquante')
              .setDescription('La clé API Gemini n\'est pas configurée. Veuillez contacter l\'administrateur du bot.')
              .setTimestamp()
          ]
        });
      }
      
      // Appel à l'API Gemini
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          contents: [{
            parts: [{
              text: question
            }]
          }]
        }
      );
      
      // Extraire la réponse
      const aiResponse = response.data.candidates[0].content.parts[0].text;
      
      // Limiter la réponse à 4000 caractères (limite des embeds Discord)
      const truncatedResponse = aiResponse.length > 4000
        ? aiResponse.substring(0, 3997) + '...'
        : aiResponse;
      
      // Créer l'embed de réponse
      const embed = new EmbedBuilder()
        .setColor('#8B0000')
        .setTitle('🤖 Réponse de l\'IA')
        .setDescription(truncatedResponse)
        .setFooter({ text: 'Propulsé par Google Gemini' })
        .setTimestamp();
      
      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(`Erreur lors de l'appel à l'API Gemini: ${error.message}`);
      
      // Créer un embed d'erreur
      const errorEmbed = new EmbedBuilder()
        .setColor('#8B0000')
        .setTitle('❌ Erreur')
        .setDescription('Une erreur est survenue lors de la communication avec l\'IA.\n\nVérifiez que la clé API est correcte et que le service est disponible.')
        .setTimestamp();
      
      return interaction.editReply({ embeds: [errorEmbed] });
    }
  }
}; 