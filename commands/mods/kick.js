const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Expulser un utilisateur du serveur')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Utilisateur à expulser')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('reason')
				.setDescription('Raison de l\'expulsion')
				.setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

	async execute(interaction) {
		const user = interaction.options.getUser('user');
		const reason = interaction.options.getString('reason') || 'Aucune raison fournie';
		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle('👢 Expulsion')
			.setDescription(`L'utilisateur ${user} a été expulsé.\nRaison : ${reason}`)
			.setTimestamp();
		await interaction.reply({ embeds: [embed] });
	}
};
