const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('Supprimer un nombre de messages')
		.addIntegerOption(option =>
			option.setName('amount')
				.setDescription('Nombre de messages à supprimer')
				.setRequired(true)
				.setMinValue(1)
				.setMaxValue(100))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
	
	async execute(interaction) {
		const amount = interaction.options.getInteger('amount')
		await interaction.reply({ content: `${amount} messages supprimés (stub).`, ephemeral: true })
	}
}
