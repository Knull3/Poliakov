const axios = require('axios');
const db = require("../../util/db.js");
const { EmbedBuilder } = require("discord.js");
const ms = require("ms");
const Discord = require("discord.js");

module.exports = async (client, oldMessage, newMessage) => {
	// Ignorer les messages des bots et les messages provenant des DM
	if (!oldMessage.guild || oldMessage.author.bot) return;

	try {
		const guild = oldMessage.guild;
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
			perm = client.user.id === oldMessage.author.id || 
				   guild.ownerId === oldMessage.author.id || 
				   client.config.owner.includes(oldMessage.author.id) || 
				   await db.get(`ownermd_${client.user.id}_${oldMessage.author.id}`) === true || 
				   await db.get(`wlmd_${guild.id}_${oldMessage.author.id}`) === true;
		} else if (linkwl === true) {
			perm = client.user.id === oldMessage.author.id || 
				   guild.ownerId === oldMessage.author.id || 
				   client.config.owner.includes(oldMessage.author.id) || 
				   await db.get(`ownermd_${client.user.id}_${oldMessage.author.id}`) === true;
		}
		
		const linkProtection = await db.get(`link_${guild.id}`);
		
		if (linkProtection === true && !perm && newMessage.content) {
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
			if (typelink === "all") {
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
			
			if (pub && pub.some(word => newMessage.content.includes(word))) {
				await newMessage.delete().catch(() => {});
				
				const channel = newMessage.channel;
				await db.add(`warn_${newMessage.author.id}`, 1);
				
				channel.send(`${newMessage.author} vous n'avez pas l'autorisation d'envoyer des liens ici`).then(msg => {
					setTimeout(() => msg.delete().catch(() => {}), 3000);
				}).catch(() => {});
				
				const warnCount = await db.get(`warn_${newMessage.author.id}`) || 0;
				
				if (warnCount <= 3) {
					const member = await guild.members.fetch(newMessage.author.id).catch(() => null);
					if (member) {
						await member.roles.add(muterole.id).catch(() => {});
						
						const embed = new EmbedBuilder()
							.setColor(color)
							.setDescription(`${newMessage.author} a été **mute 15minutes** pour avoir \`spam des invitations\``);
						
						if (raidlog) raidlog.send({ embeds: [embed] }).catch(() => {});
					}
				} else if (warnCount <= 5) {
					const member = await guild.members.fetch(newMessage.author.id).catch(() => null);
					if (member) {
						await member.kick("Spam des invitations").catch(() => {});
						
						const embed = new EmbedBuilder()
							.setColor(color)
							.setDescription(`${newMessage.author} a été **kick** pour avoir \`spam des invitations\``);
						
						if (raidlog) raidlog.send({ embeds: [embed] }).catch(() => {});
					}
				} else if (warnCount <= 9) {
					const member = await guild.members.fetch(newMessage.author.id).catch(() => null);
					if (member) {
						await member.ban({ reason: "Spam des invitations" }).catch(() => {});
						
						const embed = new EmbedBuilder()
							.setColor(color)
							.setDescription(`${newMessage.author} a été **ban** pour avoir \`spam des invitations\``);
						
						if (raidlog) raidlog.send({ embeds: [embed] }).catch(() => {});
					}
				}
				
				// Réinitialiser les avertissements après 1 heure
				setTimeout(async () => {
					await db.delete(`warn_${newMessage.author.id}`);
				}, 60 * 60000);
			}
		}
	} catch (error) {
		console.error("Erreur dans messageUpdate.js:", error);
	}
};
