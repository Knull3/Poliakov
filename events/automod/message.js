const axios = require('axios');
const db = require("../../util/db.js");
const { EmbedBuilder } = require("discord.js");
const ms = require("ms");
const random_string = require("randomstring");

module.exports = async (client, message) => {
	// Ignorer les DMs, les messages des bots et les messages vides
	if (!message.guild || message.author.bot || !message.content) return;

	try {
		const guild = message.guild;
		const color = await db.get(`color_${guild.id}`) || client.config.color;
		const raidlogId = await db.get(`${guild.id}.raidlog`);
		const raidlog = raidlogId ? guild.channels.cache.get(raidlogId) : null;
		
		let Muted = await db.fetch(`mRole_${guild.id}`);
		let muterole = await guild.roles.cache.get(Muted) || 
					   guild.roles.cache.find(role => role.name === `muet`) || 
					   guild.roles.cache.find(role => role.name === `Muted`) || 
					   guild.roles.cache.find(role => role.name === `Mute`);
		
		if (!muterole) {
			muterole = await guild.roles.create({
				name: 'muet',
				permissions: []
			});
			
			guild.channels.cache.forEach(async channel => {
				await channel.permissionOverwrites.create(muterole, {
					SendMessages: false,
					Connect: false,
					AddReactions: false
				});
			});
			
			await db.set(`mRole_${guild.id}`, muterole.id);
		}
		
		const linkwl = await db.get(`linkwl_${guild.id}`);
		
		let perm = false;
		if (linkwl === null) {
			perm = client.user.id === message.author.id || 
				   guild.ownerId === message.author.id || 
				   client.config.owner.includes(message.author.id) || 
				   await db.get(`ownermd_${client.user.id}_${message.author.id}`) === true || 
				   await db.get(`wlmd_${guild.id}_${message.author.id}`) === true;
		} else if (linkwl === true) {
			perm = client.user.id === message.author.id || 
				   guild.ownerId === message.author.id || 
				   client.config.owner.includes(message.author.id) || 
				   await db.get(`ownermd_${client.user.id}_${message.author.id}`) === true;
		}
		
		const linkProtection = await db.get(`link_${guild.id}`);
		
		if (linkProtection === true && !perm) {
			let pub;
			const linkType = await db.get(`linktype_${guild.id}`);
			
			if (linkType === null || linkType.toLowerCase() === "invite") {
				pub = [
					"discord.me",
					"discord.io",
					"discord.gg",
					"invite.me",
					"discordapp.com/invite",
					".gg"
				];
			}
			
			const typelink = await db.get(`typelink_${guild.id}`);
			if (typelink === "all" || typelink === " all") {
				pub = [
					"discord.me",
					"discord.com",
					"discord.io",
					"discord.gg",
					"invite.me",
					"discord.gg/",
					"discord.",
					"discordapp.com/invite",
					".gg",
					"https",
					"http",
					"https:"
				];
			}
			
			if (pub && pub.some(word => message.content.includes(word))) {
				try {
					await message.delete();
					
					await db.add(`warn_${message.author.id}`, 1);
					
					let warnID = random_string.generate({
						charset: 'numeric',
						length: 8
					});
					
					await db.push(`info.${guild.id}.${message.author.id}`, {
						moderator: `Système Anti-Lien`,
						reason: "Message contenant un lien",
						date: Math.floor(Date.now() / 1000),
						id: warnID
					});
					
					await db.add(`number.${guild.id}.${message.author.id}`, 1);
					
					message.channel.send(`${message.author} vous n'avez pas l'autorisation d'envoyer des liens ici`)
						.then(msg => {
							setTimeout(() => msg.delete().catch(() => {}), 3000);
						})
						.catch(() => {});
					
					const warnCount = await db.get(`warn_${message.author.id}`) || 0;
					
					if (warnCount <= 3) {
						await message.member.roles.add(muterole.id).catch(() => {});
						
						const embed = new EmbedBuilder()
							.setColor(color)
							.setDescription(`${message.author} a été **mute** pour avoir \`spam des invitations\``)
							.setTimestamp();
						
						if (raidlog) raidlog.send({ embeds: [embed] }).catch(() => {});
					} else if (warnCount <= 5) {
						await message.member.kick("Spam d'invitations").catch(() => {});
						
						const embed = new EmbedBuilder()
							.setColor(color)
							.setDescription(`${message.author} a été **kick** pour avoir \`spam des invitations\``)
							.setTimestamp();
						
						if (raidlog) raidlog.send({ embeds: [embed] }).catch(() => {});
					} else if (warnCount <= 9) {
						await message.member.ban({ reason: "Spam d'invitations" }).catch(() => {});
						
						const embed = new EmbedBuilder()
							.setColor(color)
							.setDescription(`${message.author} a été **ban** pour avoir \`spam des invitations\``)
							.setTimestamp();
						
						if (raidlog) raidlog.send({ embeds: [embed] }).catch(() => {});
					}
					
					// Réinitialiser les avertissements après 1 heure
					setTimeout(async () => {
						await db.delete(`warn_${message.author.id}`);
					}, 60 * 60000);
				} catch (deleteError) {
					console.error("Erreur lors de la suppression du message contenant un lien:", deleteError);
				}
			}
		}
	} catch (error) {
		console.error("Erreur dans le gestionnaire message.js:", error);
	}
};
