const axios = require('axios');
const db = require("../../util/db");
const { EmbedBuilder } = require("discord.js");
const ms = require("ms");

module.exports = async (client, oldPresence, newPresence) => {
	try {
		if (!oldPresence) return;

		const txt = await db.get(`txtsupp_${oldPresence.guild.id}`);
		if (txt == null) return;
		
		const role = await db.get(`rolesupp_${oldPresence.guild.id}`);
		if (role == null) return;

		if (role && txt) {
			// Vérifier si l'utilisateur a une activité et si elle contient le texte de support
			if (newPresence.activities && 
				newPresence.activities[0] && 
				newPresence.activities[0].state && 
				newPresence.activities[0].state.includes(txt)) {
				
				// Ajouter le rôle si l'utilisateur ne l'a pas déjà
				if (!newPresence.member.roles.cache.some(r => r.id === role)) {
					await newPresence.member.roles.add(role);
				}
			} else {
				// Retirer le rôle si l'utilisateur l'a
				if (newPresence.member.roles.cache.some(r => r.id === role)) {
					await newPresence.member.roles.remove(role);
				}
			}
		}
	} catch (error) {
		console.error(`Erreur dans presenceUpdate: ${error.message}`);
	}
}
