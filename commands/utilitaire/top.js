const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('top')
		.setDescription('Afficher le classement du serveur')
		.addStringOption(option =>
			option.setName('type')
				.setDescription('Type de classement à afficher')
				.setRequired(true)
				.addChoices(
					{ name: 'Niveaux', value: 'levels' },
					{ name: 'Invitations', value: 'invites' },
					{ name: 'Messages', value: 'messages' },
					{ name: 'Vocal', value: 'voice' }
				)),
	
	async execute(interaction) {
		await interaction.deferReply();
		
		try {
			const type = interaction.options.getString('type');
			const guild = interaction.guild;
			
			switch (type) {
				case 'levels':
					await showLevelsLeaderboard(interaction);
					break;
				case 'invites':
					await showInvitesLeaderboard(interaction);
					break;
				case 'messages':
					await showMessagesLeaderboard(interaction);
					break;
				case 'voice':
					await showVoiceLeaderboard(interaction);
					break;
				default:
					await interaction.followUp({
						embeds: [
							new EmbedBuilder()
								.setColor('#FF0000')
								.setTitle('❌ Erreur')
								.setDescription('Type de classement invalide.')
								.setTimestamp()
						]
					});
			}
		} catch (error) {
			console.error('Erreur lors de l\'affichage du classement:', error);
			await interaction.followUp({
				embeds: [
					new EmbedBuilder()
						.setColor('#FF0000')
						.setTitle('❌ Erreur')
						.setDescription('Une erreur est survenue lors de l\'affichage du classement.')
						.setTimestamp()
				],
				ephemeral: true
			});
		}
	}
};

// Fonction pour afficher le classement des niveaux
async function showLevelsLeaderboard(interaction) {
	const guild = interaction.guild;
	
	// Récupérer les données de niveau de tous les membres
	const levelsData = await db.all().filter(entry => entry.id.startsWith(`level_${guild.id}_`));
	
	if (levelsData.length === 0) {
		return interaction.followUp({
			embeds: [
				new EmbedBuilder()
					.setColor('#8B0000')
					.setTitle('🏆 Classement des niveaux')
					.setDescription('Aucune donnée de niveau trouvée.')
					.setTimestamp()
			]
		});
	}
	
	// Trier les données par niveau et XP
	levelsData.sort((a, b) => {
		if (b.value.level !== a.value.level) {
			return b.value.level - a.value.level;
		}
		return b.value.xp - a.value.xp;
	});
	
	// Limiter à 10 membres
	const topMembers = levelsData.slice(0, 10);
	
	// Créer la liste des membres
	let description = '';
	
	for (let i = 0; i < topMembers.length; i++) {
		const data = topMembers[i];
		const userId = data.id.split('_')[2];
		
		try {
			const user = await interaction.client.users.fetch(userId);
			description += `**${i + 1}.** ${user} - Niveau ${data.value.level} (${data.value.xp} XP)\n`;
		} catch (error) {
			description += `**${i + 1}.** ID: ${userId} - Niveau ${data.value.level} (${data.value.xp} XP)\n`;
		}
	}
	
	// Trouver la position de l'utilisateur qui a fait la commande
	const userEntry = levelsData.find(entry => entry.id === `level_${guild.id}_${interaction.user.id}`);
	let userPosition = '';
	
	if (userEntry) {
		const position = levelsData.findIndex(entry => entry.id === `level_${guild.id}_${interaction.user.id}`) + 1;
		userPosition = `\n**Votre position:** #${position} - Niveau ${userEntry.value.level} (${userEntry.value.xp} XP)`;
	} else {
		userPosition = '\n**Votre position:** Non classé';
	}
	
	// Créer et envoyer l'embed
	const embed = new EmbedBuilder()
		.setColor('#8B0000')
		.setTitle('🏆 Classement des niveaux')
		.setDescription(description + userPosition)
		.setFooter({ text: `Total: ${levelsData.length} membres classés` })
		.setTimestamp();
	
	await interaction.followUp({ embeds: [embed] });
}

// Fonction pour afficher le classement des invitations
async function showInvitesLeaderboard(interaction) {
	const guild = interaction.guild;
	
	// Récupérer les données d'invitation de tous les membres
	const invitesData = await db.all().filter(entry => entry.id.startsWith(`invites_${guild.id}_`));
	
	if (invitesData.length === 0) {
		return interaction.followUp({
			embeds: [
				new EmbedBuilder()
					.setColor('#8B0000')
					.setTitle('🏆 Classement des invitations')
					.setDescription('Aucune donnée d\'invitation trouvée.')
					.setTimestamp()
			]
		});
	}
	
	// Trier les données par nombre d'invitations
	invitesData.sort((a, b) => b.value - a.value);
	
	// Limiter à 10 membres
	const topMembers = invitesData.slice(0, 10);
	
	// Créer la liste des membres
	let description = '';
	
	for (let i = 0; i < topMembers.length; i++) {
		const data = topMembers[i];
		const userId = data.id.split('_')[2];
		
		try {
			const user = await interaction.client.users.fetch(userId);
			description += `**${i + 1}.** ${user} - ${data.value} invitation${data.value > 1 ? 's' : ''}\n`;
		} catch (error) {
			description += `**${i + 1}.** ID: ${userId} - ${data.value} invitation${data.value > 1 ? 's' : ''}\n`;
		}
	}
	
	// Trouver la position de l'utilisateur qui a fait la commande
	const userEntry = invitesData.find(entry => entry.id === `invites_${guild.id}_${interaction.user.id}`);
	let userPosition = '';
	
	if (userEntry) {
		const position = invitesData.findIndex(entry => entry.id === `invites_${guild.id}_${interaction.user.id}`) + 1;
		userPosition = `\n**Votre position:** #${position} - ${userEntry.value} invitation${userEntry.value > 1 ? 's' : ''}`;
	} else {
		userPosition = '\n**Votre position:** Non classé';
	}
	
	// Créer et envoyer l'embed
	const embed = new EmbedBuilder()
		.setColor('#8B0000')
		.setTitle('🏆 Classement des invitations')
		.setDescription(description + userPosition)
		.setFooter({ text: `Total: ${invitesData.length} membres classés` })
		.setTimestamp();
	
	await interaction.followUp({ embeds: [embed] });
}

// Fonction pour afficher le classement des messages
async function showMessagesLeaderboard(interaction) {
	const guild = interaction.guild;
	
	// Récupérer les données de messages de tous les membres
	const messagesData = await db.all().filter(entry => entry.id.startsWith(`messages_${guild.id}_`));
	
	if (messagesData.length === 0) {
		return interaction.followUp({
			embeds: [
				new EmbedBuilder()
					.setColor('#8B0000')
					.setTitle('🏆 Classement des messages')
					.setDescription('Aucune donnée de messages trouvée.')
					.setTimestamp()
			]
		});
	}
	
	// Trier les données par nombre de messages
	messagesData.sort((a, b) => b.value - a.value);
	
	// Limiter à 10 membres
	const topMembers = messagesData.slice(0, 10);
	
	// Créer la liste des membres
	let description = '';
	
	for (let i = 0; i < topMembers.length; i++) {
		const data = topMembers[i];
		const userId = data.id.split('_')[2];
		
		try {
			const user = await interaction.client.users.fetch(userId);
			description += `**${i + 1}.** ${user} - ${data.value} message${data.value > 1 ? 's' : ''}\n`;
		} catch (error) {
			description += `**${i + 1}.** ID: ${userId} - ${data.value} message${data.value > 1 ? 's' : ''}\n`;
		}
	}
	
	// Trouver la position de l'utilisateur qui a fait la commande
	const userEntry = messagesData.find(entry => entry.id === `messages_${guild.id}_${interaction.user.id}`);
	let userPosition = '';
	
	if (userEntry) {
		const position = messagesData.findIndex(entry => entry.id === `messages_${guild.id}_${interaction.user.id}`) + 1;
		userPosition = `\n**Votre position:** #${position} - ${userEntry.value} message${userEntry.value > 1 ? 's' : ''}`;
	} else {
		userPosition = '\n**Votre position:** Non classé';
	}
	
	// Créer et envoyer l'embed
	const embed = new EmbedBuilder()
		.setColor('#8B0000')
		.setTitle('🏆 Classement des messages')
		.setDescription(description + userPosition)
		.setFooter({ text: `Total: ${messagesData.length} membres classés` })
		.setTimestamp();
	
	await interaction.followUp({ embeds: [embed] });
}

// Fonction pour afficher le classement du temps vocal
async function showVoiceLeaderboard(interaction) {
	const guild = interaction.guild;
	
	// Récupérer les données vocales de tous les membres
	const voiceData = await db.all().filter(entry => entry.id.startsWith(`voice_${guild.id}_`));
	
	if (voiceData.length === 0) {
		return interaction.followUp({
			embeds: [
				new EmbedBuilder()
					.setColor('#8B0000')
					.setTitle('🏆 Classement du temps vocal')
					.setDescription('Aucune donnée vocale trouvée.')
					.setTimestamp()
			]
		});
	}
	
	// Trier les données par temps vocal
	voiceData.sort((a, b) => b.value - a.value);
	
	// Limiter à 10 membres
	const topMembers = voiceData.slice(0, 10);
	
	// Créer la liste des membres
	let description = '';
	
	for (let i = 0; i < topMembers.length; i++) {
		const data = topMembers[i];
		const userId = data.id.split('_')[2];
		const hours = Math.floor(data.value / 3600000);
		const minutes = Math.floor((data.value % 3600000) / 60000);
		
		try {
			const user = await interaction.client.users.fetch(userId);
			description += `**${i + 1}.** ${user} - ${hours}h ${minutes}min\n`;
		} catch (error) {
			description += `**${i + 1}.** ID: ${userId} - ${hours}h ${minutes}min\n`;
		}
	}
	
	// Trouver la position de l'utilisateur qui a fait la commande
	const userEntry = voiceData.find(entry => entry.id === `voice_${guild.id}_${interaction.user.id}`);
	let userPosition = '';
	
	if (userEntry) {
		const position = voiceData.findIndex(entry => entry.id === `voice_${guild.id}_${interaction.user.id}`) + 1;
		const hours = Math.floor(userEntry.value / 3600000);
		const minutes = Math.floor((userEntry.value % 3600000) / 60000);
		userPosition = `\n**Votre position:** #${position} - ${hours}h ${minutes}min`;
	} else {
		userPosition = '\n**Votre position:** Non classé';
	}
	
	// Créer et envoyer l'embed
	const embed = new EmbedBuilder()
		.setColor('#8B0000')
		.setTitle('🏆 Classement du temps vocal')
		.setDescription(description + userPosition)
		.setFooter({ text: `Total: ${voiceData.length} membres classés` })
		.setTimestamp();
	
	await interaction.followUp({ embeds: [embed] });
}
