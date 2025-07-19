const axios = require('axios');
const db = require("../../util/db")
const { EmbedBuilder } = require("discord.js");
const ms = require("ms");
const embed = require('../../commands/gestion/embed');

module.exports = async (client, member) => {
	try {
		if (member.partial) member = await member.fetch();
		const color = await db.get(`color_${member.guild.id}`) === null ? client.config.color : await db.get(`color_${member.guild.id}`)

		// Vérifier si le système d'invitation est activé
		if (!client.guildInvites.has(member.guild.id)) {
			console.log(`Système d'invitations non initialisé pour le serveur ${member.guild.name}`);
			return;
		}

		let welcomeChannel = await client.channels.fetch(await db.get(`joinchannelmessage_${member.guild.id}`)).catch(err => {});
		if (!welcomeChannel) return;

		// Si c'est un bot, message spécial
		if (member.user.bot) {
			const botJoinEmbed = new EmbedBuilder()
				.setColor(color)
				.setDescription(`Le bot ${member.toString()} nous a rejoint en utilisant ***l'api OAuth2***`);
			return welcomeChannel.send({ embeds: [botJoinEmbed] }).catch(err => {});
		}

		// Récupérer les anciennes invitations
		const cachedInvites = client.guildInvites.get(member.guild.id);
		if (!cachedInvites) return;

		// Récupérer les nouvelles invitations
		let newInvites;
		try {
			newInvites = await member.guild.invites.fetch();
			client.guildInvites.set(member.guild.id, newInvites);
		} catch (error) {
			console.log(`Impossible de récupérer les invitations pour ${member.guild.name}: ${error.message}`);
			return welcomeChannel.send({ 
				embeds: [new EmbedBuilder()
					.setColor(color)
					.setDescription(`**Je n'arrive pas à trouver** comment ${member.toString()} a rejoint le serveur.`)]
			}).catch(err => {});
		}

		// Trouver l'invitation utilisée
		const usedInvite = newInvites.find(inv => {
			const cachedInv = cachedInvites.get(inv.code);
			return cachedInv && cachedInv.uses < inv.uses;
		});

		if (!usedInvite) {
			return welcomeChannel.send({ 
				embeds: [new EmbedBuilder()
					.setColor(color)
					.setDescription(`**Je n'arrive pas à trouver** comment ${member.toString()} a rejoint le serveur.`)]
			}).catch(err => {});
		}

		// Vérifier si c'est un lien d'invitation personnalisé
		let isVanity = false;
		try {
			if (member.guild.vanityURLCode && usedInvite.code === member.guild.vanityURLCode) {
				welcomeChannel.send({ 
					embeds: [new EmbedBuilder()
						.setColor(color)
						.setDescription(`${member.toString()} nous a rejoint en utilisant ***le lien d'invitation personnalisé du serveur.***`)]
				});
				await db.set(`inviter_${member.guild.id}_${member.id}`, "vanity");
				isVanity = true;
			}
		} catch (error) {
			console.log(`Erreur avec le lien vanity: ${error.message}`);
		}

		if (isVanity) return;

		// Mettre à jour les statistiques d'invitation
		let invite = await db.add(`invites_${member.guild.id}_${usedInvite.inviter.id}`, 1);
		let iv2 = usedInvite.inviter;
		await db.set(`inviter_${member.guild.id}_${member.id}`, usedInvite.inviter.id);
		await db.add(`Regular_${member.guild.id}_${usedInvite.inviter.id}`, 1);

		// Gérer les récompenses d'invitation
		let money = await db.all().filter(data => data.ID.startsWith(`rewardinvite_${member.guild.id}`)).sort((a, b) => b.data - a.data);
		money.filter(x => member.guild.roles.cache.get(x.ID.split('_')[2])).map((m, i) => {
			if (invite === parseInt(m.ID.split('_')[3]) && !member.roles.cache.has(m.ID.split('_')[2])) {
				member.roles.add(m.ID.split('_')[2]).catch(console.error);
			}
		});

		let inv = await db.fetch(`invites_${member.guild.id}_${usedInvite.inviter.id}`);
		if (inv == null) inv = 0;

		// Envoyer le message d'accueil
		if (await db.get(`joinmessageembed_${member.guild.id}`) !== null) {
			// Message d'accueil en embed
			let embedj = await db.get(`joinmessageembed_${member.guild.id}`);
			
			// Remplacer les variables dans l'embed
			if (embedj.description) {
				embedj.description = embedj.description
					.replace(/{user:name}/g, member.user.username)
					.replace(/{user:tag}/g, member.user.tag)
					.replace(/{user:id}/g, member.user.id)
					.replace(/{user}/g, member.toString())
					.replace(/{inviter}/g, iv2.toString())
					.replace(/{inviter:name}/g, iv2.username)
					.replace(/{inviter:tag}/g, iv2.tag)
					.replace(/{inviter:id}/g, iv2.id)
					.replace(/{guild:name}/g, member.guild.name)
					.replace(/{guild:member}/g, member.guild.memberCount)
					.replace(/{invite}/g, inv);
			}
			
			if (embedj.title) {
				embedj.title = embedj.title
					.replace(/{user:name}/g, member.user.username)
					.replace(/{user:tag}/g, member.user.tag)
					.replace(/{user:id}/g, member.user.id)
					.replace(/{user}/g, member.toString())
					.replace(/{inviter}/g, iv2.toString())
					.replace(/{inviter:name}/g, iv2.username)
					.replace(/{inviter:tag}/g, iv2.tag)
					.replace(/{inviter:id}/g, iv2.id)
					.replace(/{guild:name}/g, member.guild.name)
					.replace(/{guild:member}/g, member.guild.memberCount)
					.replace(/{invite}/g, inv);
			}
			
			if (embedj.footer) {
				embedj.footer.text = embedj.footer.text
					.replace(/{user:name}/g, member.user.username)
					.replace(/{user:tag}/g, member.user.tag)
					.replace(/{user:id}/g, member.user.id)
					.replace(/{user}/g, member.toString())
					.replace(/{inviter}/g, iv2.toString())
					.replace(/{inviter:name}/g, iv2.username)
					.replace(/{inviter:tag}/g, iv2.tag)
					.replace(/{inviter:id}/g, iv2.id)
					.replace(/{guild:name}/g, member.guild.name)
					.replace(/{guild:member}/g, member.guild.memberCount)
					.replace(/{invite}/g, inv);
			}

			// Créer et envoyer l'embed
			const welcomeEmbed = EmbedBuilder.from(embedj);
			const msggg = await welcomeChannel.send({ embeds: [welcomeEmbed] });
			const joinmsgdel = await db.get(`joinmsgdel_${member.guild.id}`);
			if (joinmsgdel) {
				setTimeout(() => {
					msggg.delete().catch(err => {});
				}, ms(joinmsgdel));
			}
		} else {
			// Message d'accueil normal
			let joinmessage = await db.get(`joinmessage_${member.guild.id}`);
			if (joinmessage === null) joinmessage = client.config.defaultjoinmessage;
			
			let toSend = joinmessage
				.replace(/{user:name}/g, member.user.username)
				.replace(/{user:tag}/g, member.user.tag)
				.replace(/{user:id}/g, member.user.id)
				.replace(/{user}/g, member.toString())
				.replace(/{inviter}/g, usedInvite.inviter.toString())
				.replace(/{inviter:name}/g, usedInvite.inviter.username)
				.replace(/{inviter:tag}/g, usedInvite.inviter.tag)
				.replace(/{inviter:id}/g, usedInvite.inviter.id)
				.replace(/{guild:name}/g, member.guild.name)
				.replace(/{guild:member}/g, member.guild.memberCount)
				.replace(/{invite}/g, inv);

			const msggg2 = await welcomeChannel.send(toSend);
			const joinmsgdel2 = await db.get(`joinmsgdel_${member.guild.id}`);
			if (joinmsgdel2) {
				setTimeout(() => {
					msggg2.delete().catch(err => {});
				}, ms(joinmsgdel2));
			}
		}
	} catch (error) {
		console.error(`Erreur dans guildMemberAdd: ${error.message}`);
	}
};
