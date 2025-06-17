import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('public')
		.setDescription('Activer ou désactiver le mode public du bot')
		.addBooleanOption(option =>
			option.setName('enable')
				.setDescription('Activer le mode public ?')
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	async execute(interaction, client) {
		const enable = interaction.options.getBoolean('enable');
		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle('🌐 Mode Public')
			.setDescription(`Le mode public est maintenant **${enable ? 'activé' : 'désactivé'}**.`)
			.setFooter({ text: client.config.name })
			.setTimestamp();
		return interaction.reply({ embeds: [embed] });
	}
};
