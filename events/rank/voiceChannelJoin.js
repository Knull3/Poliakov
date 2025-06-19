const axios = require('axios');
const db = require("../../util/db.js");
const { EmbedBuilder } = require("discord.js");
const ms = require("ms");

module.exports = async (client, member, channel) => {
	if (member.user.bot) return;
	
	try {
		const color = await db.get(`color_${member.guild.id}`) || client.config.color;
		const guild = member.guild;

		// Calcul d'XP pour le vocal
		let inter = setInterval(async () => {
			await db.add(`vocalrank_${guild.id}_${member.user.id}`, 1000);
			
			// Tous les 60 secondes (60000 ms), on ajoute de l'XP
			if (await db.get(`vocalrank_${guild.id}_${member.user.id}`) % 60000 === 0) {
				const randomXP = Math.floor(Math.random() * 10) + 5; // Entre 5 et 15 XP
				await db.add(`guild_${guild.id}_xp_${member.user.id}`, randomXP);
				await db.add(`guild_${guild.id}_xptotal_${guild.id}`, randomXP);
				
				// Vérification pour montée de niveau
				const level = await db.get(`guild_${guild.id}_level_${member.user.id}`) || 1;
				const xp = await db.get(`guild_${guild.id}_xp_${member.user.id}`) || 0;
				const xpNeeded = level * 500;
				
				if (xpNeeded < xp) {
					const newLevel = await db.add(`guild_${guild.id}_level_${member.user.id}`, 1);
					await db.subtract(`guild_${guild.id}_xp_${member.user.id}`, xpNeeded);
					
					// Gestion des récompenses et notifications
					const levelChannelId = await db.get(`levelchannel_${guild.id}`);
					if (levelChannelId) {
						const channel = await client.channels.fetch(levelChannelId).catch(() => null);
						if (channel) {
							const embed = new EmbedBuilder()
								.setColor(color)
								.setTitle('🎉 Niveau supérieur !')
								.setDescription(`${member.user} a atteint le niveau **${newLevel}** en vocal !`)
								.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
								.setFooter({ text: client.config.name })
								.setTimestamp();
							
							await channel.send({ embeds: [embed] });
						}
					}
				}
			}
		}, 1000);

		client.inter.push({
			interval: inter,
			id: member.user.id,
			guild: guild.id,
		});
	} catch (error) {
		console.error("Erreur dans l'événement voiceChannelJoin:", error);
	}
}
