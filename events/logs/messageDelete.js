const db = require("../../util/db.js");
const { EmbedBuilder } = require("discord.js");

module.exports = async (client, message) => {
    // Ignorer les messages des bots et les messages provenant des DM
    if (!message.guild || !message.author || message.author.bot) return;
    
    try {
        const guild = message.guild;
        const color = await db.get(`color_${guild.id}`) || client.config.color;
        const logChannelId = await db.get(`msglog_${guild.id}`);
        
        if (!logChannelId) return;
        
        const logChannel = guild.channels.cache.get(logChannelId);
        if (!logChannel) return;

        // Limiter la longueur du message pour éviter des erreurs
        const maxLength = 1024;
        const content = message.content 
            ? (message.content.length > maxLength 
                ? message.content.substring(0, maxLength) + "..." 
                : message.content)
            : "Aucun contenu textuel";

        const embed = new EmbedBuilder()
            .setColor(color)
            .setAuthor({ 
                name: `Message supprimé`, 
                iconURL: message.author.displayAvatarURL({ dynamic: true }) 
            })
            .setDescription(`dans <#${message.channel.id}> par ${message.author}`)
            .addFields({ name: `Message Supprimé :`, value: content })
            .setFooter({ text: client.config.name })
            .setTimestamp();

        if (message.attachments.size > 0) {
            embed.addFields({ 
                name: 'Pièces jointes supprimées :',
                value: message.attachments.map(a => a.name || 'Pièce jointe sans nom').join('\n')
            });
        }

        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error("Erreur dans le log messageDelete:", error);
    }
};
