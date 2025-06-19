const axios = require('axios');
const db = require("../../util/db.js");
const { EmbedBuilder } = require("discord.js");
const ms = require("ms")

module.exports = async (client, message) => {
	if (!message.guild) return;
	if (message.author.bot) return;

	try {
		await db.add(`msg_${message.guild.id}_${message.author.id}`, 1);
		await xp(message);
	} catch (error) {
		console.error("Erreur dans le système de rank:", error);
	}

	async function xp(message) {
		try {
			const prefix = await db.get(`prefix_${message.guild.id}`) || client.config.prefix;
			if (message.content.startsWith(prefix)) return;

			const randomNumber = Math.floor(Math.random() * 10) + 15;
			await db.add(`guild_${message.guild.id}_xp_${message.author.id}`, randomNumber);
			await db.add(`guild_${message.guild.id}_xptotal_${message.guild.id}`, randomNumber);

			const level = await db.get(`guild_${message.guild.id}_level_${message.author.id}`) || 1;
			const xp = await db.get(`guild_${message.guild.id}_xp_${message.author.id}`) || 0;
			const xpNeeded = level * 500;
			const messagefetch = await db.fetch(`msg_${message.guild.id}_${message.author.id}`) || 0;

			if (xpNeeded < xp) {
				const newLevel = await db.add(`guild_${message.guild.id}_level_${message.author.id}`, 1);

				// Gestion des récompenses de niveau
				const rewards = await db.all().filter(data => data.ID.startsWith(`rewardlevel_${message.guild.id}`));
				if (rewards && rewards.length > 0) {
					for (const reward of rewards) {
						const roleId = reward.ID.split('_')[2];
						const rewardLevel = parseInt(reward.ID.split('_')[3]);
						
						if (newLevel === rewardLevel && !message.member.roles.cache.has(roleId)) {
							const role = message.guild.roles.cache.get(roleId);
							if (role) {
								await message.member.roles.add(roleId).catch(err => 
									console.error(`Erreur lors de l'ajout du rôle de récompense:`, err)
								);
							}
						}
					}
				}

				await db.subtract(`guild_${message.guild.id}_xp_${message.author.id}`, xpNeeded);
				
				const levelChannelId = await db.get(`levelchannel_${message.guild.id}`);
				if (!levelChannelId) return;
				
				const channel = await client.channels.fetch(levelChannelId).catch(() => null);
				if (!channel) return;

				// Fonction pour remplacer les variables dans un texte
				const replaceVars = (text) => {
					return text
						.replace(/{user}/g, message.author.toString())
						.replace(/{user:username}/g, message.author.username)
						.replace(/{user:tag}/g, message.author.tag)
						.replace(/{user:id}/g, message.author.id)
						.replace(/{guild:name}/g, message.guild.name)
						.replace(/{guild:member}/g, message.guild.memberCount)
						.replace(/{level}/g, newLevel)
						.replace(/{xp}/g, xp)
						.replace(/{message}/g, messagefetch);
				};

				const embedConfig = await db.get(`levelmessageembed_${message.guild.id}`);
				
				if (embedConfig) {
					const embed = new EmbedBuilder()
						.setColor(embedConfig.color || client.config.color);
						
					if (embedConfig.title) 
						embed.setTitle(replaceVars(embedConfig.title));
					
					if (embedConfig.description) 
						embed.setDescription(replaceVars(embedConfig.description));
					
					if (embedConfig.footer) 
						embed.setFooter({ text: replaceVars(embedConfig.footer.text) });
					
					if (embedConfig.thumbnail && embedConfig.thumbnail.url)
						embed.setThumbnail(replaceVars(embedConfig.thumbnail.url));
					
					await channel.send({ embeds: [embed] });
				} else {
					let levelMessage = await db.get(`levelmsg_${message.guild.id}`);
					if (!levelMessage) levelMessage = client.config.defaultLevelmessage;
					
					await channel.send(replaceVars(levelMessage));
				}
			}
		} catch (error) {
			console.error("Erreur dans le traitement XP:", error);
		}
	}
}
