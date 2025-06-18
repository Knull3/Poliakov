const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mutelist')
		.setDescription('Afficher la liste des utilisateurs muets')
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

	async execute(interaction) {
		await interaction.deferReply();
		
		try {
			const guild = interaction.guild;
			
			// Vérifier si un rôle muet existe
			let muteRole = null;
			
			// Option 1: Vérifier si un rôle "Muted" existe
			muteRole = guild.roles.cache.find(role => 
				role.name.toLowerCase() === 'muted' || 
				role.name.toLowerCase() === 'muet'
			);
			
			// Option 2: Vérifier les timeouts (Discord's built-in timeout system)
			const allMembers = await guild.members.fetch();
			const timedOutMembers = allMembers.filter(member => member.communicationDisabledUntilTimestamp > Date.now());
			
			// Créer l'embed
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('🔇 Liste des utilisateurs muets')
				.setTimestamp();
			
			// Ajouter les utilisateurs avec timeout
			if (timedOutMembers.size > 0) {
				const timeoutList = timedOutMembers.map(member => {
					const timeLeft = Math.floor(member.communicationDisabledUntilTimestamp / 1000);
					return `<@${member.id}> (${member.user.tag}) - Expire: <t:${timeLeft}:R>`;
				}).join('\n');
				
				embed.addFields({ 
					name: `⏱️ Utilisateurs en timeout (${timedOutMembers.size})`, 
					value: timeoutList || 'Aucun' 
				});
			}
			
			// Ajouter les utilisateurs avec le rôle muet
			if (muteRole) {
				const mutedMembers = muteRole.members;
				
				if (mutedMembers.size > 0) {
					const muteList = mutedMembers.map(member => 
						`<@${member.id}> (${member.user.tag})`
					).join('\n');
					
					embed.addFields({ 
						name: `🔇 Utilisateurs avec le rôle muet (${mutedMembers.size})`, 
						value: muteList || 'Aucun' 
					});
				}
			}
			
			// Si aucun utilisateur muet n'est trouvé
			if ((timedOutMembers.size === 0 || !timedOutMembers) && 
				(!muteRole || muteRole.members.size === 0)) {
				embed.setDescription('Aucun utilisateur muet trouvé sur ce serveur.');
			} else {
				embed.setDescription(`**Total:** ${
					(timedOutMembers ? timedOutMembers.size : 0) + 
					(muteRole ? muteRole.members.size : 0)
				} utilisateur(s) muet(s)`);
			}
			
			await interaction.followUp({ embeds: [embed] });
			
		} catch (error) {
			console.error('Erreur lors de la récupération des utilisateurs muets:', error);
			await interaction.followUp({
				embeds: [
					new EmbedBuilder()
						.setColor('#FF0000')
						.setTitle('❌ Erreur')
						.setDescription('Une erreur est survenue lors de la récupération des utilisateurs muets.')
						.setTimestamp()
				],
				ephemeral: true
			});
		}
	}
};
