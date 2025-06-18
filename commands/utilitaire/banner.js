const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

// Fonction pour récupérer l'URL de la bannière d'un utilisateur
async function getUserBannerUrl(userId, client, options = {}) {
    const { size = 4096, format = 'webp', dynamic = true } = options;
    
    try {
        // Vérifier que la taille est valide
        if (![16, 32, 64, 128, 256, 512, 1024, 2048, 4096].includes(size)) {
            throw new Error(`La taille '${size}' n'est pas supportée!`);
        }
        
        // Vérifier que le format est valide
        if (!['webp', 'png', 'jpg', 'jpeg', 'gif'].includes(format)) {
            throw new Error(`Le format '${format}' n'est pas supporté!`);
        }
        
        // Récupérer les données de l'utilisateur via l'API Discord
        const user = await client.rest.get(`/users/${userId}`);
        
        // Vérifier si l'utilisateur a une bannière
        if (!user.banner) {
            return null;
        }
        
        // Construire l'URL de base
        const baseUrl = `https://cdn.discordapp.com/banners/${userId}/${user.banner}`;
        
        // Ajouter le format dynamique si demandé
        if (dynamic && user.banner.startsWith('a_')) {
            return `${baseUrl}.gif?size=${size}`;
        }
        
        // Sinon, utiliser le format spécifié
        return `${baseUrl}.${format}?size=${size}`;
    } catch (error) {
        console.error(`Erreur lors de la récupération de la bannière: ${error.message}`);
        return null;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banner')
        .setDescription('Affiche la bannière d\'un utilisateur')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('Utilisateur dont vous voulez voir la bannière')
                .setRequired(false)),
    
    async execute(interaction, client) {
        await interaction.deferReply();
        
        const targetUser = interaction.options.getUser('user') || interaction.user;
        
        try {
            const bannerUrl = await getUserBannerUrl(targetUser.id, client, {
                size: 4096,
                dynamic: true
            });
            
            if (bannerUrl) {
                const embed = new EmbedBuilder()
                    .setColor('#8B0000')
                    .setTitle(`Bannière de ${targetUser.username}`)
                    .setImage(bannerUrl)
                    .setFooter({ text: client.config.name })
                    .setTimestamp();
                
                return interaction.editReply({ embeds: [embed] });
            } else {
                const embed = new EmbedBuilder()
                    .setColor('#8B0000')
                    .setTitle(`${targetUser.username}`)
                    .setDescription(`${targetUser} n'a pas de bannière.`)
                    .setFooter({ text: client.config.name })
                    .setTimestamp();
                
                return interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            console.error(`Erreur dans la commande banner: ${error.message}`);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#8B0000')
                .setTitle('❌ Erreur')
                .setDescription('Une erreur est survenue lors de la récupération de la bannière.')
                .setFooter({ text: client.config.name })
                .setTimestamp();
            
            return interaction.editReply({ embeds: [errorEmbed] });
        }
    }
}; 