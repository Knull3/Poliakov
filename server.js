const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Gestion des serveurs')
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('Liste tous les serveurs où le bot est présent'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('leave')
				.setDescription('Quitter un serveur')
				.addStringOption(option =>
					option.setName('server_id')
						.setDescription('ID du serveur à quitter')
						.setRequired(true))),

	async execute(interaction, client) {
		if (!client.config.owner.includes(interaction.user.id)) {
			const errorEmbed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('❌ Permission refusée')
				.setDescription('Seuls les propriétaires du bot peuvent utiliser cette commande.')
				.setTimestamp();
			
			return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
		}

		const subcommand = interaction.options.getSubcommand();

		if (subcommand === 'list') {
			const guilds = client.guilds.cache.map(guild => ({
				name: guild.name,
				id: guild.id,
				memberCount: guild.memberCount,
				owner: guild.ownerId
			}));

			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('🏠 Serveurs du Bot')
				.setDescription(guilds.map((guild, index) => 
					`${index + 1}. **${guild.name}**\n   ID: \`${guild.id}\`\n   Membres: ${guild.memberCount}\n   Owner: <@${guild.owner}>`
				).join('\n\n'))
				.setFooter({ text: `${client.config.name} • ${guilds.length} serveur(s)` })
				.setTimestamp();

			return interaction.reply({ embeds: [embed] });

		} else if (subcommand === 'leave') {
			const serverId = interaction.options.getString('server_id');
			const guild = client.guilds.cache.get(serverId);

			if (!guild) {
				return interaction.reply({ content: '❌ Serveur introuvable.', ephemeral: true });
			}

			try {
				await guild.leave();
				const embed = new EmbedBuilder()
					.setColor('#8B0000')
					.setTitle('✅ Serveur quitté')
					.setDescription(`J'ai quitté le serveur **${guild.name}** (\`${guild.id}\`)`)
					.setTimestamp();

				return interaction.reply({ embeds: [embed] });
			} catch (error) {
				const errorEmbed = new EmbedBuilder()
					.setColor('#8B0000')
					.setTitle('❌ Erreur')
					.setDescription(`Impossible de quitter le serveur : ${error.message}`)
					.setTimestamp();

				return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
			}
		}
	}
};
