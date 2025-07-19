const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('massrole')
		.setDescription('Gestion des rôles en masse')
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('Ajouter un rôle à tous les membres')
				.addRoleOption(option =>
					option.setName('role')
						.setDescription('Rôle à ajouter')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('remove')
				.setDescription('Retirer un rôle de tous les membres')
				.addRoleOption(option =>
					option.setName('role')
						.setDescription('Rôle à retirer')
						.setRequired(true)))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

	async execute(interaction, client) {
		const subcommand = interaction.options.getSubcommand();
		const role = interaction.options.getRole('role');

		if (subcommand === 'add') {
			await interaction.deferReply();
			
			let successCount = 0;
			let errorCount = 0;
			
			for (const member of interaction.guild.members.cache.values()) {
				try {
					if (!member.roles.cache.has(role.id)) {
						await member.roles.add(role);
						successCount++;
					}
				} catch (error) {
					errorCount++;
				}
			}
			
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('✅ Rôle Ajouté en Masse')
				.setDescription(`**Rôle :** ${role}\n**Action :** Ajouté à tous les membres\n\n**📊 Résultats :**\n• ✅ Succès : ${successCount} membres\n• ❌ Erreurs : ${errorCount} membres`)
				.setFooter({ text: client.config.name })
				.setTimestamp();

			return interaction.editReply({ embeds: [embed] });
		}

		if (subcommand === 'remove') {
			await interaction.deferReply();
			
			let successCount = 0;
			let errorCount = 0;
			
			for (const member of interaction.guild.members.cache.values()) {
				try {
					if (member.roles.cache.has(role.id)) {
						await member.roles.remove(role);
						successCount++;
					}
				} catch (error) {
					errorCount++;
				}
			}
			
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('❌ Rôle Retiré en Masse')
				.setDescription(`**Rôle :** ${role}\n**Action :** Retiré de tous les membres\n\n**📊 Résultats :**\n• ✅ Succès : ${successCount} membres\n• ❌ Erreurs : ${errorCount} membres`)
				.setFooter({ text: client.config.name })
				.setTimestamp();

			return interaction.editReply({ embeds: [embed] });
		}
	}
};
