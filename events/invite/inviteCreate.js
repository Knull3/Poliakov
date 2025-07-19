const axios = require('axios');
const db = require("../../util/db")
const { EmbedBuilder } = require("discord.js");
const ms = require("ms")

module.exports = async (client, invite) => {
	try {
		// Vérifier si le système d'invitation est activé
		if (!client.guildInvites) {
			client.guildInvites = new Map();
		}
		
		// Récupérer les invitations du serveur
		try {
			const guildInvites = await invite.guild.invites.fetch();
			client.guildInvites.set(invite.guild.id, guildInvites);
			
			// Tentative de récupération du lien vanity s'il existe
			if (invite.guild.vanityURLCode) {
				try {
					const vanityData = await invite.guild.fetchVanityData();
					if (vanityData) {
						guildInvites.set(invite.guild.vanityURLCode, vanityData);
					}
				} catch (vanityError) {
					console.log(`Impossible de récupérer le lien vanity pour ${invite.guild.name}: ${vanityError.message}`);
				}
			}
		} catch (error) {
			console.log(`Impossible de mettre à jour les invitations pour ${invite.guild.name}: ${error.message}`);
		}
	} catch (error) {
		console.error(`Erreur dans inviteCreate: ${error.message}`);
	}
};
