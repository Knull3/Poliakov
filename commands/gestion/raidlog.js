const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const db = require("../../util/db.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('raidlog')
		.setDescription('Gestion des logs de raid')
		.addSubcommand(subcommand =>
			subcommand
				.setName('setup')
				.setDescription('Configurer le salon des logs de raid')
				.addChannelOption(option =>
					option
						.setName('salon')
						.setDescription('Salon où envoyer les logs de raid')
						.setRequired(true)
						.addChannelTypes(ChannelType.GuildText)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('view')
				.setDescription('Voir la configuration actuelle des logs de raid'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('disable')
				.setDescription('Désactiver les logs de raid'))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	async execute(interaction, client) {
		const subcommand = interaction.options.getSubcommand();
		const guildId = interaction.guild.id;

		if (subcommand === 'setup') {
			const channel = interaction.options.getChannel('salon');
			
			// Vérifier si le bot a la permission d'envoyer des messages dans ce salon
			const permissions = channel.permissionsFor(client.user);
			if (!permissions.has(PermissionFlagsBits.SendMessages) || !permissions.has(PermissionFlagsBits.ViewChannel)) {
				return interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setColor('#8B0000')
							.setTitle('❌ Erreur')
							.setDescription('Je n\'ai pas les permissions nécessaires pour envoyer des messages dans ce salon.')
							.setFooter({ text: client.config.name })
							.setTimestamp()
					],
					ephemeral: true
				});
			}
			
			// Enregistrer le salon de logs
			await db.set(`${guildId}.raidlog`, channel.id);
			
			// Confirmer la configuration
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('✅ Configuration des Logs de Raid')
				.setDescription(`Les logs de raid seront désormais envoyés dans ${channel}.`)
				.setFooter({ text: client.config.name })
				.setTimestamp();
			
			return interaction.reply({ embeds: [embed] });
		}
		
		if (subcommand === 'view') {
			const raidlogId = await db.get(`${guildId}.raidlog`);
			
			if (!raidlogId) {
				return interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setColor('#8B0000')
							.setTitle('🛡️ Logs de Raid')
							.setDescription('Aucun salon de logs de raid n\'est configuré.')
							.setFooter({ text: client.config.name })
							.setTimestamp()
					]
				});
			}
			
			const raidlogChannel = interaction.guild.channels.cache.get(raidlogId);
			
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('🛡️ Logs de Raid')
				.setDescription(raidlogChannel 
					? `Les logs de raid sont actuellement envoyés dans ${raidlogChannel}.`
					: 'Le salon de logs configuré n\'existe plus. Veuillez reconfigurer les logs de raid.')
				.setFooter({ text: client.config.name })
				.setTimestamp();
			
			return interaction.reply({ embeds: [embed] });
		}
		
		if (subcommand === 'disable') {
			await db.delete(`${guildId}.raidlog`);
			
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('🛡️ Logs de Raid')
				.setDescription('Les logs de raid ont été désactivés.')
				.setFooter({ text: client.config.name })
				.setTimestamp();
			
			return interaction.reply({ embeds: [embed] });
		}
	}
};
