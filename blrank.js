const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

// Fonction pour gérer la blacklist rank en JSON
const BLRANK_PATH = './data/blacklist_rank.json';

function getBlacklistRank() {
	if (!fs.existsSync(BLRANK_PATH)) {
		fs.writeFileSync(BLRANK_PATH, JSON.stringify({}, null, 2));
	}
	return JSON.parse(fs.readFileSync(BLRANK_PATH, 'utf-8'));
}

function saveBlacklistRank(userId, blacklistedId) {
	const blacklist = getBlacklistRank();
	if (!blacklist[userId]) blacklist[userId] = [];
	
	if (!blacklist[userId].includes(blacklistedId)) {
		blacklist[userId].push(blacklistedId);
	}
	
	fs.writeFileSync(BLRANK_PATH, JSON.stringify(blacklist, null, 2));
}

function removeFromBlacklistRank(userId, blacklistedId) {
	const blacklist = getBlacklistRank();
	if (blacklist[userId]) {
		blacklist[userId] = blacklist[userId].filter(id => id !== blacklistedId);
		fs.writeFileSync(BLRANK_PATH, JSON.stringify(blacklist, null, 2));
	}
}

function clearBlacklistRank(userId) {
	const blacklist = getBlacklistRank();
	const count = blacklist[userId] ? blacklist[userId].length : 0;
	blacklist[userId] = [];
	fs.writeFileSync(BLRANK_PATH, JSON.stringify(blacklist, null, 2));
	return count;
}

function isBlacklistedRank(botId, userId) {
	const blacklist = getBlacklistRank();
	return blacklist[botId] && blacklist[botId].includes(userId);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('blacklistrank')
		.setDescription('Gestion de la blacklist rank')
		.addSubcommandGroup(group =>
			group
				.setName('xp')
				.setDescription('Gestion de la blacklist XP')
				.addSubcommand(subcommand =>
					subcommand
						.setName('add')
						.setDescription('Ajouter un utilisateur à la blacklist rank')
						.addUserOption(option =>
							option.setName('user')
								.setDescription('Utilisateur à blacklist')
								.setRequired(true)))
				.addSubcommand(subcommand =>
					subcommand
						.setName('remove')
						.setDescription('Retirer un utilisateur de la blacklist rank')
						.addUserOption(option =>
							option.setName('user')
								.setDescription('Utilisateur à retirer')
								.setRequired(true)))
				.addSubcommand(subcommand =>
					subcommand
						.setName('clear')
						.setDescription('Vider la blacklist rank'))
				.addSubcommand(subcommand =>
					subcommand
						.setName('list')
						.setDescription('Voir la liste de la blacklist rank'))),

	async execute(interaction, client) {
		// Vérifier si l'utilisateur est owner
		if (!client.config.owner.includes(interaction.user.id)) {
			const errorEmbed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('❌ Permission refusée')
				.setDescription('Seuls les propriétaires du bot peuvent utiliser cette commande.')
				.setTimestamp();
			
			return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
		}

		const group = interaction.options.getSubcommandGroup();
		const subcommand = interaction.options.getSubcommand();

		if (group === 'xp') {
			if (subcommand === 'add') {
				const user = interaction.options.getUser('user');
				
				saveBlacklistRank(client.user.id, user.id);
				
				const embed = new EmbedBuilder()
					.setColor('#8B0000')
					.setTitle('✅ Utilisateur blacklisté')
					.setDescription(`<@${user.id}> a été ajouté à la blacklist rank.`)
					.setTimestamp();
				
				return interaction.reply({ embeds: [embed] });

			} else if (subcommand === 'remove') {
				const user = interaction.options.getUser('user');
				
				removeFromBlacklistRank(client.user.id, user.id);
				
				const embed = new EmbedBuilder()
					.setColor('#8B0000')
					.setTitle('✅ Utilisateur retiré')
					.setDescription(`<@${user.id}> a été retiré de la blacklist rank.`)
					.setTimestamp();
				
				return interaction.reply({ embeds: [embed] });

			} else if (subcommand === 'clear') {
				const count = clearBlacklistRank(client.user.id);
				
				const embed = new EmbedBuilder()
					.setColor('#8B0000')
					.setTitle('✅ Blacklist rank vidée')
					.setDescription(`${count} ${count > 1 ? 'personnes ont été supprimées' : 'personne a été supprimée'} de la blacklist rank.`)
					.setTimestamp();

				return interaction.reply({ embeds: [embed] });

			} else if (subcommand === 'list') {
				const blacklist = getBlacklistRank()[client.user.id] || [];
				
				if (blacklist.length === 0) {
					return interaction.reply({ content: '❌ Aucun utilisateur dans la blacklist rank.', ephemeral: true });
				}

				const embed = new EmbedBuilder()
					.setColor('#8B0000')
					.setTitle('📋 Liste de la blacklist rank')
					.setDescription(blacklist.map((userId, index) => {
						const user = client.users.cache.get(userId);
						return `${index + 1}) <@${userId}> (${user ? user.username : 'Utilisateur inconnu'})`;
					}).join('\n'))
					.setFooter({ text: `${client.config.name} • ${blacklist.length} utilisateur(s)` })
					.setTimestamp();

				return interaction.reply({ embeds: [embed] });
			}
		}
	}
};