module.exports = async (client) => {
	console.log(`- Connecter ${client.user.username}`);
	
	try {
		// Vérifier si l'intent GuildInvites est disponible
		if (client.options.intents.has('GuildInvites')) {
			client.guilds.cache.forEach(async guild => {
				try {
					const guildInvites = await guild.invites.fetch();
					client.guildInvites.set(guild.id, guildInvites);
				} catch (error) {
					console.log(`Impossible de récupérer les invitations pour le serveur ${guild.name}: ${error.message}`);
				}
			});
			console.log(`✅ Système d'invitations prêt`);
		} else {
			console.log(`⚠️ Système d'invitations désactivé - Intent GuildInvites requis`);
		}
	} catch (error) {
		console.log(`⚠️ Erreur lors de l'initialisation du système d'invitations: ${error.message}`);
	}
} 