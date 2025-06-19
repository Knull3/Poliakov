const axios = require('axios');
const db = require("../../util/db.js");
const { EmbedBuilder } = require("discord.js");
const ms = require("ms");
const Discord = require("discord.js");

module.exports = async (client, member) => {
	try {
		const guild = member.guild;
		if (!guild) return;
		
		// Récupérer les configurations
		const raidlogId = await db.get(`${guild.id}.raidlog`);
		const raidlog = raidlogId ? guild.channels.cache.get(raidlogId) : null;
		const color = await db.get(`color_${guild.id}`) || client.config.color;
		
		// Anti-token
		const antiToken = await db.get(`antitoken_${guild.id}`);
		if (antiToken === true) {
			// Implémentation à compléter si nécessaire
			// const maxMembers = await db.get(`antitokenlimmit1_${guild.id}`) || 10;
			// const maxTimeStr = await db.get(`antitokenlimmit2_${guild.id}`) || "10s";
			// const maxTime = ms(maxTimeStr);
			// etc.
		}
		
		// Limite d'âge du compte
		const creaLimit = await db.get(`crealimit_${guild.id}`);
		if (creaLimit === true) {
			const durationStr = await db.get(`crealimittemps_${guild.id}`) || "0s";
			const duration = ms(durationStr);
			const created = member.user.createdTimestamp;
			const sum = created + duration;
			const diff = Date.now() - sum;
			
			if (diff < 0) {
				await member.kick().catch(console.error);
				
				if (raidlog) {
					const embed = new EmbedBuilder()
						.setColor(color)
						.setDescription(`${member} a été **kick** parce que \`son compte a été créé trop récemment\``);
					
					await raidlog.send({ embeds: [embed] }).catch(console.error);
				}
			}
		}
		
		// Blacklist
		const isBlacklisted = await db.get(`blmd_${client.user.id}_${member.id}`);
		if (isBlacklisted === true) {
			try {
				await member.ban();
				
				if (raidlog) {
					const embed = new EmbedBuilder()
						.setColor(color)
						.setDescription(`${member} a rejoint alors qu'il était blacklist, il a été **ban**`);
					
					await raidlog.send({ embeds: [embed] }).catch(console.error);
				}
			} catch (error) {
				if (raidlog) {
					const embed = new EmbedBuilder()
						.setColor(color)
						.setDescription(`${member} a rejoint alors qu'il était blacklist, mais il n'a pas pu être **ban**`);
					
					await raidlog.send({ embeds: [embed] }).catch(console.error);
				}
			}
		}
		
		// Anti-bot
		if (member.user.bot) {
			try {
				const action = await guild.fetchAuditLogs({
					limit: 1,
					type: "BOT_ADD"
				}).then(async (audit) => audit.entries.first());
				
				if (action && action.executor && action.executor.id) {
					const userId = action.executor.id;
					
					// Vérification des permissions
					let perm = false;
					const botWl = await db.get(`botwl_${guild.id}`);
					const isOwnerMd = await db.get(`ownermd_${client.user.id}_${userId}`);
					const isWlMd = await db.get(`wlmd_${guild.id}_${userId}`);
					
					if (botWl === null) {
						perm = client.user.id === userId || 
							guild.ownerId === userId || 
							client.config.owner.includes(userId) || 
							isOwnerMd === true || 
							isWlMd === true;
					}
					
					if (botWl === true) {
						perm = client.user.id === userId || 
							guild.ownerId === userId || 
							client.config.owner.includes(userId) || 
							isOwnerMd === true;
					}
					
					const antiBot = await db.get(`bot_${guild.id}`);
					if (antiBot === true && !perm) {
						const botSanction = await db.get(`botsanction_${guild.id}`);
						
						if (botSanction === "ban") {
							try {
								await axios({
									url: `https://discord.com/api/v9/guilds/${guild.id}/bans/${userId}`,
									method: 'PUT',
									headers: {
										Authorization: `Bot ${process.env.token}`
									},
									data: {
										delete_message_days: '1',
										reason: 'Antibot'
									}
								});
								
								if (raidlog) {
									const embed = new EmbedBuilder()
										.setColor(color)
										.setDescription(`<@${userId}> a invité le bot ${member}, il a été **ban** !`);
									
									await raidlog.send({ embeds: [embed] }).catch(console.error);
								}
							} catch (error) {
								if (raidlog) {
									const embed = new EmbedBuilder()
										.setColor(color)
										.setDescription(`<@${userId}> a invité le bot ${member}, mais il n'a pas pu être **ban** !`);
									
									await raidlog.send({ embeds: [embed] }).catch(console.error);
								}
							}
						} else if (botSanction === "kick") {
							try {
								const executor = await guild.members.fetch(userId).catch(() => null);
								if (executor) await executor.kick();
								
								if (raidlog) {
									const embed = new EmbedBuilder()
										.setColor(color)
										.setDescription(`<@${userId}> a invité le bot ${member}, il a été **kick** !`);
									
									await raidlog.send({ embeds: [embed] }).catch(console.error);
								}
							} catch (error) {
								if (raidlog) {
									const embed = new EmbedBuilder()
										.setColor(color)
										.setDescription(`<@${userId}> a invité le bot ${member}, mais il n'a pas pu être **kick** !`);
									
									await raidlog.send({ embeds: [embed] }).catch(console.error);
								}
							}
						} else if (botSanction === "derank") {
							try {
								const executor = await guild.members.fetch(userId).catch(() => null);
								if (executor) await executor.roles.set([]);
								
								if (raidlog) {
									const embed = new EmbedBuilder()
										.setColor(color)
										.setDescription(`<@${userId}> a invité le bot ${member}, il a été **derank** !`);
									
									await raidlog.send({ embeds: [embed] }).catch(console.error);
								}
							} catch (error) {
								if (raidlog) {
									const embed = new EmbedBuilder()
										.setColor(color)
										.setDescription(`<@${userId}> a invité le bot ${member}, mais il n'a pas pu être **derank** !`);
									
									await raidlog.send({ embeds: [embed] }).catch(console.error);
								}
							}
						}
					}
				}
			} catch (error) {
				console.error("Erreur lors du traitement de l'anti-bot:", error);
			}
		}
	} catch (error) {
		console.error("Erreur dans l'événement guildMemberAdd:", error);
	}
};
