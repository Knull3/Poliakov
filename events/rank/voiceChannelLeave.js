const axios = require('axios');
const db = require("../../util/db.js");
const { EmbedBuilder } = require("discord.js");
const ms = require("ms");

module.exports = async (client, member, voiceChannel) => {
	if (member.user.bot) return;
	
	try {
		const color = await db.get(`color_${member.guild.id}`) || client.config.color;
		
		// Récupérer le temps passé en vocal
		const vocalTime = await db.get(`vocalrank_${member.guild.id}_${member.user.id}`) || 0;
		
		// Arrêter l'intervalle
		if (client.inter.find(c => c.id === member.user.id && c.guild === member.guild.id)) {
			clearInterval(client.inter.find(c => c.id === member.user.id && c.guild === member.guild.id).interval);
			
			const index = client.inter.findIndex(c => c.id === member.user.id && c.guild === member.guild.id);
			if (index !== -1) {
				client.inter.splice(index, 1);
			}
		}
		
		// Enregistrer les statistiques vocales
		await db.set(`lastVocalTime_${member.guild.id}_${member.user.id}`, vocalTime);
		
		// Ajouter aux statistiques totales
		const totalVocalTime = await db.get(`totalVocalTime_${member.guild.id}_${member.user.id}`) || 0;
		await db.set(`totalVocalTime_${member.guild.id}_${member.user.id}`, totalVocalTime + vocalTime);
		
		// Réinitialiser le temps de session
		await db.set(`vocalrank_${member.guild.id}_${member.user.id}`, 0);
	} catch (error) {
		console.error("Erreur dans l'événement voiceChannelLeave:", error);
	}
}
