const db = require("../../util/db.js");
const { EmbedBuilder } = require("discord.js");

module.exports = async (client, member, channel) => {
    if (!member || !channel || !member.guild) return;
    
    try {
        const color = await db.get(`color_${member.guild.id}`) || client.config.color;
        const logChannelId = await db.get(`logvc_${member.guild.id}`);
        
        if (!logChannelId) return;
        
        const logChannel = member.guild.channels.cache.get(logChannelId);
        if (!logChannel) return;
        
        const embed = new EmbedBuilder()
            .setColor(color)
            .setDescription(`${member} a arrêté de diffuser dans le salon vocal <#${channel.id}>`)
            .setFooter({ text: client.config.name })
            .setTimestamp();
        
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error("Erreur dans le log voiceStreamingStop:", error);
    }
};
