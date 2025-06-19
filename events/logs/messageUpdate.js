const db = require("../../util/db.js");
const { EmbedBuilder } = require("discord.js");

module.exports = async (client, oldMessage, newMessage) => {
    // Ignorer les messages des bots et les messages provenant des DM
    if (!oldMessage.guild || !oldMessage.author || oldMessage.author.bot) return;
    // Ignorer si le contenu n'a pas changé
    if (oldMessage.content === newMessage.content) return;

    try {
        const guild = oldMessage.guild;
        const color = await db.get(`color_${guild.id}`) || client.config.color;
        const logChannelId = await db.get(`msglog_${guild.id}`);
        
        if (!logChannelId) return;
        
        const logChannel = guild.channels.cache.get(logChannelId);
        if (!logChannel) return;

        // Limiter la longueur des messages pour éviter des erreurs
        const maxLength = 1024;
        const oldContent = oldMessage.content 
            ? (oldMessage.content.length > maxLength 
                ? oldMessage.content.substring(0, maxLength) + "..." 
                : oldMessage.content)
            : "Aucun contenu";
            
        const newContent = newMessage.content 
            ? (newMessage.content.length > maxLength 
                ? newMessage.content.substring(0, maxLength) + "..." 
                : newMessage.content) 
            : "Aucun contenu";

        const embed = new EmbedBuilder()
            .setColor(color)
            .setAuthor({ 
                name: `Message modifié`, 
                iconURL: oldMessage.author.displayAvatarURL({ dynamic: true }) 
            })
            .setDescription(`${oldMessage.author} a modifié son message dans <#${oldMessage.channel.id}>`)
            .addFields(
                { name: `Ancien message :`, value: oldContent || "Contenu non textuel" },
                { name: `Nouveau message :`, value: newContent || "Contenu non textuel" }
            )
            .setFooter({ text: client.config.name })
            .setTimestamp();

        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error("Erreur dans le log messageUpdate:", error);
    }
};
