const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Afficher la liste des commandes')
		.addStringOption(option =>
			option.setName('catégorie')
				.setDescription('Catégorie de commandes spécifique')
				.setRequired(false)
				.addChoices(
					{ name: 'Bot', value: 'bot' },
					{ name: 'Gestion', value: 'gestion' },
					{ name: 'Modération', value: 'mods' },
					{ name: 'Musique', value: 'musique' },
					{ name: 'Utilitaire', value: 'utilitaire' }
				)),

	async execute(interaction, client) {
		const category = interaction.options.getString('catégorie');
		
		// Récupérer toutes les commandes
		const commands = Array.from(client.slashCommands.values());
		
		if (category) {
			// Afficher les commandes d'une catégorie spécifique
			const categoryCommands = commands.filter(cmd => {
				// Déterminer la catégorie de la commande à partir de son nom
				const cmdData = cmd.data.toJSON();
				
				// Vérifier si la commande appartient à la catégorie spécifiée
				return cmdData.name.toLowerCase().includes(category) || 
					   (cmdData.description && cmdData.description.toLowerCase().includes(category));
			});
			
			if (categoryCommands.length === 0) {
				return interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setColor('#8B0000')
							.setTitle('❌ Erreur')
							.setDescription(`Aucune commande trouvée dans la catégorie "${category}".`)
							.setTimestamp()
					],
					ephemeral: true
				});
			}
			
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle(`📖 Aide - ${category.charAt(0).toUpperCase() + category.slice(1)}`)
				.setDescription(`Liste des commandes de la catégorie ${category}:`)
				.setTimestamp();
			
			// Ajouter les commandes à l'embed
			categoryCommands.forEach(cmd => {
				const cmdData = cmd.data.toJSON();
				embed.addFields({
					name: `/${cmdData.name}`,
					value: cmdData.description || 'Aucune description disponible'
				});
			});
			
			return interaction.reply({ embeds: [embed] });
		} else {
			// Afficher toutes les catégories
			const categories = {
				bot: [],
				gestion: [],
				mods: [],
				musique: [],
				utilitaire: []
			};
			
			// Trier les commandes par catégorie
			commands.forEach(cmd => {
				const cmdData = cmd.data.toJSON();
				
				// Déterminer la catégorie
				let category = 'utilitaire'; // Par défaut
				
				if (cmdData.name.includes('ban') || cmdData.name.includes('kick') || 
					cmdData.name.includes('mute') || cmdData.name.includes('warn')) {
					category = 'mods';
				} else if (cmdData.name.includes('play') || cmdData.name.includes('queue') || 
						   cmdData.name.includes('skip') || cmdData.name.includes('stop')) {
					category = 'musique';
				} else if (cmdData.name.includes('config') || cmdData.name.includes('owner') || 
						   cmdData.name.includes('bot')) {
					category = 'bot';
				} else if (cmdData.name.includes('role') || cmdData.name.includes('welcome') || 
						   cmdData.name.includes('leave') || cmdData.name.includes('logs')) {
					category = 'gestion';
				}
				
				// Ajouter à la catégorie appropriée
				if (categories[category]) {
					categories[category].push(cmdData);
				}
			});
			
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('📖 Aide - Catégories')
				.setDescription('Utilisez `/help catégorie:<nom>` pour voir les commandes d\'une catégorie spécifique.')
				.setTimestamp();
			
			// Ajouter les catégories à l'embed
			Object.entries(categories).forEach(([category, cmds]) => {
				if (cmds.length > 0) {
					embed.addFields({
						name: `${category.charAt(0).toUpperCase() + category.slice(1)} (${cmds.length})`,
						value: cmds.map(cmd => `\`/${cmd.name}\``).join(', ')
					});
				}
			});
			
			return interaction.reply({ embeds: [embed] });
		}
	}
};
