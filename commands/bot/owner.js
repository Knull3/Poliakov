const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('owner')
		.setDescription('Commandes réservées aux propriétaires du bot')
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('Afficher la liste des propriétaires du bot'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('Ajouter un propriétaire au bot')
				.addUserOption(option =>
					option.setName('user')
						.setDescription('L\'utilisateur à ajouter comme propriétaire')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('remove')
				.setDescription('Retirer un propriétaire du bot')
				.addUserOption(option =>
					option.setName('user')
						.setDescription('L\'utilisateur à retirer des propriétaires')
						.setRequired(true))),

	async execute(interaction, client) {
		// Vérifier si l'utilisateur est le propriétaire principal
		if (!client.config.owner[0] === interaction.user.id) {
			const errorEmbed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('❌ Permission refusée')
				.setDescription('Seul le propriétaire principal du bot peut utiliser cette commande.')
				.setTimestamp();
			
			return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
		}

		const subcommand = interaction.options.getSubcommand();
		
		if (subcommand === 'list') {
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('👑 Commandes Owner')
				.setDescription(`
**Commandes disponibles :**
• \`/owner list\` - Afficher la liste des propriétaires
• \`/owner add\` - Ajouter un propriétaire
• \`/owner remove\` - Retirer un propriétaire
• \`/backup\` - Gestion des backups d'emojis
• \`/blacklist\` - Gestion de la blacklist
• \`/blacklistrank\` - Gestion de la blacklist rank
• \`/botconfig\` - Configuration du bot
• \`/botinfo\` - Informations du bot
• \`/server\` - Gestion des serveurs
• \`/theme\` - Configuration du thème

**Propriétaires actuels :**
${client.config.owner.filter(id => id !== '').map(id => `<@${id}>`).join('\n')}
				`)
				.setFooter({ text: client.config.name })
				.setTimestamp();

			return interaction.reply({ embeds: [embed] });
		}
		
		else if (subcommand === 'add') {
			const user = interaction.options.getUser('user');
			
			// Vérifier si l'utilisateur est déjà propriétaire
			if (client.config.owner.includes(user.id)) {
				const errorEmbed = new EmbedBuilder()
					.setColor('#8B0000')
					.setTitle('❌ Erreur')
					.setDescription(`${user} est déjà un propriétaire du bot.`)
					.setTimestamp();
				
				return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
			}
			
			// Ajouter l'utilisateur à la liste des propriétaires
			const configPath = path.join(process.cwd(), 'config.json');
			const config = require(configPath);
			
			// Trouver un emplacement vide ou ajouter à la fin
			let added = false;
			for (let i = 0; i < config.owner.length; i++) {
				if (config.owner[i] === '') {
					config.owner[i] = user.id;
					added = true;
					break;
				}
			}
			
			if (!added) {
				config.owner.push(user.id);
			}
			
			// Sauvegarder le fichier de configuration
			fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
			
			// Mettre à jour la configuration du client
			client.config = config;
			
			const successEmbed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('✅ Propriétaire ajouté')
				.setDescription(`${user} a été ajouté à la liste des propriétaires du bot.`)
				.setTimestamp();
			
			return interaction.reply({ embeds: [successEmbed] });
		}
		
		else if (subcommand === 'remove') {
			const user = interaction.options.getUser('user');
			
			// Vérifier si l'utilisateur est propriétaire
			if (!client.config.owner.includes(user.id)) {
				const errorEmbed = new EmbedBuilder()
					.setColor('#8B0000')
					.setTitle('❌ Erreur')
					.setDescription(`${user} n'est pas un propriétaire du bot.`)
					.setTimestamp();
				
				return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
			}
			
			// Vérifier si c'est le propriétaire principal
			if (user.id === client.config.owner[0]) {
				const errorEmbed = new EmbedBuilder()
					.setColor('#8B0000')
					.setTitle('❌ Erreur')
					.setDescription(`Vous ne pouvez pas retirer le propriétaire principal du bot.`)
					.setTimestamp();
				
				return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
			}
			
			// Retirer l'utilisateur de la liste des propriétaires
			const configPath = path.join(process.cwd(), 'config.json');
			const config = require(configPath);
			
			// Trouver l'index de l'utilisateur et le remplacer par une chaîne vide
			const index = config.owner.indexOf(user.id);
			if (index > 0) { // Ignorer le propriétaire principal (index 0)
				config.owner[index] = '';
			}
			
			// Sauvegarder le fichier de configuration
			fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
			
			// Mettre à jour la configuration du client
			client.config = config;
			
			const successEmbed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('✅ Propriétaire retiré')
				.setDescription(`${user} a été retiré de la liste des propriétaires du bot.`)
				.setTimestamp();
			
			return interaction.reply({ embeds: [successEmbed] });
		}
	}
};
