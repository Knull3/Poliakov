const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Map pour stocker les messages supprimés
const snipeMap = new Map();

// Fonction pour enregistrer un message supprimé
function saveDeletedMessage(message) {
    if (!message.content && !message.attachments.size) return;
    
    const guildId = message.guild.id;
    const channelId = message.channel.id;
    const userId = message.author.id;
    
    // Créer la clé pour le guild si elle n'existe pas
    if (!snipeMap.has(guildId)) {
        snipeMap.set(guildId, new Map());
    }
    
    // Créer la clé pour le channel si elle n'existe pas
    const guildMap = snipeMap.get(guildId);
    if (!guildMap.has(channelId)) {
        guildMap.set(channelId, new Map());
    }
    
    // Créer la clé pour l'utilisateur si elle n'existe pas
    const channelMap = guildMap.get(channelId);
    if (!channelMap.has(userId)) {
        channelMap.set(userId, []);
    }
    
    // Ajouter le message à la liste des messages de l'utilisateur
    const userMessages = channelMap.get(userId);
    userMessages.unshift({
        content: message.content,
        author: message.author,
        timestamp: message.createdTimestamp,
        attachments: [...message.attachments.values()].map(att => att.proxyURL)
    });
    
    // Limiter à 5 messages par utilisateur
    if (userMessages.length > 5) {
        userMessages.pop();
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('snipe')
        .setDescription('Affiche les derniers messages supprimés')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('Utilisateur dont vous voulez voir les messages supprimés')
                .setRequired(false)),
    
    // Fonction pour configurer les événements nécessaires
    setup: (client) => {
        client.on('messageDelete', (message) => {
            if (message.author.bot) return;
            saveDeletedMessage(message);
        });
    },
    
    async execute(interaction, client) {
        const targetUser = interaction.options.getUser('user');
        const guildId = interaction.guild.id;
        const channelId = interaction.channel.id;
        
        // Vérifier si des messages ont été enregistrés pour ce serveur
        if (!snipeMap.has(guildId) || !snipeMap.get(guildId).has(channelId)) {
            return interaction.reply({ 
                embeds: [
                    new EmbedBuilder()
                        .setColor('#8B0000')
                        .setDescription('Aucun message supprimé récemment dans ce salon.')
                        .setTimestamp()
                ],
                ephemeral: true 
            });
        }
        
        const channelMap = snipeMap.get(guildId).get(channelId);
        
        if (targetUser) {
            // Afficher les messages d'un utilisateur spécifique
            if (!channelMap.has(targetUser.id) || channelMap.get(targetUser.id).length === 0) {
                return interaction.reply({ 
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#8B0000')
                            .setDescription(`Aucun message supprimé récemment par ${targetUser.toString()} dans ce salon.`)
                            .setTimestamp()
                    ],
                    ephemeral: true 
                });
            }
            
            const userMessages = channelMap.get(targetUser.id);
            const embeds = userMessages.map((msg, index) => {
                const embed = new EmbedBuilder()
                    .setColor('#8B0000')
                    .setAuthor({ 
                        name: `${msg.author.username}`, 
                        iconURL: msg.author.displayAvatarURL({ dynamic: true }) 
                    })
                    .setDescription(msg.content || '*Aucun contenu textuel*')
                    .setFooter({ text: `Message ${index + 1}/${userMessages.length}` })
                    .setTimestamp(msg.timestamp);
                
                if (msg.attachments.length > 0) {
                    embed.setImage(msg.attachments[0]);
                    if (msg.attachments.length > 1) {
                        embed.addFields({ 
                            name: 'Pièces jointes supplémentaires', 
                            value: `${msg.attachments.length - 1} pièce(s) jointe(s) non affichée(s)` 
                        });
                    }
                }
                
                return embed;
            });
            
            return interaction.reply({ embeds: [embeds[0]] });
        } else {
            // Afficher le dernier message supprimé dans le salon
            let lastMessage = null;
            let lastTimestamp = 0;
            
            // Trouver le message le plus récent
            for (const [userId, messages] of channelMap.entries()) {
                if (messages.length > 0 && messages[0].timestamp > lastTimestamp) {
                    lastMessage = messages[0];
                    lastTimestamp = messages[0].timestamp;
                }
            }
            
            if (!lastMessage) {
                return interaction.reply({ 
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#8B0000')
                            .setDescription('Aucun message supprimé récemment dans ce salon.')
                            .setTimestamp()
                    ],
                    ephemeral: true 
                });
            }
            
            const embed = new EmbedBuilder()
                .setColor('#8B0000')
                .setAuthor({ 
                    name: `${lastMessage.author.username}`, 
                    iconURL: lastMessage.author.displayAvatarURL({ dynamic: true }) 
                })
                .setDescription(lastMessage.content || '*Aucun contenu textuel*')
                .setFooter({ text: `Utilisez /snipe @utilisateur pour voir plus de messages` })
                .setTimestamp(lastMessage.timestamp);
            
            if (lastMessage.attachments.length > 0) {
                embed.setImage(lastMessage.attachments[0]);
                if (lastMessage.attachments.length > 1) {
                    embed.addFields({ 
                        name: 'Pièces jointes supplémentaires', 
                        value: `${lastMessage.attachments.length - 1} pièce(s) jointe(s) non affichée(s)` 
                    });
                }
            }
            
            return interaction.reply({ embeds: [embed] });
        }
    }
}; 