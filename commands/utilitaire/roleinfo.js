const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roleinfo')
		.setDescription('Afficher les informations d\'un rôle')
		.addRoleOption(option =>
			option.setName('role')
				.setDescription('Rôle à afficher')
				.setRequired(true)),
	async execute(interaction) {
		const role = interaction.options.getRole('role');
		
		// Formatage des permissions
		const permissions = new PermissionsBitField(role.permissions.bitfield).toArray();
		const formattedPermissions = permissions.length > 0 
			? permissions.map(perm => `\`${perm}\``).join(', ') 
			: 'Aucune permission';
		
		// Formatage de la date de création
		const createdAt = Math.floor(role.createdTimestamp / 1000);
		
		// Nombre de membres avec ce rôle
		const memberCount = role.members.size;
		
		// Création de l'embed
		const embed = new EmbedBuilder()
			.setColor(role.hexColor)
			.setTitle(`Informations sur ${role.name}`)
			.addFields(
				{ name: 'ID', value: role.id, inline: true },
				{ name: 'Nom', value: role.name, inline: true },
				{ name: 'Couleur', value: role.hexColor, inline: true },
				{ name: 'Position', value: `${role.position}`, inline: true },
				{ name: 'Mentionnable', value: role.mentionable ? 'Oui' : 'Non', inline: true },
				{ name: 'Affiché séparément', value: role.hoist ? 'Oui' : 'Non', inline: true },
				{ name: 'Membres', value: `${memberCount}`, inline: true },
				{ name: 'Créé le', value: `<t:${createdAt}:F> (<t:${createdAt}:R>)`, inline: true },
				{ name: 'Permissions', value: formattedPermissions }
			)
			.setTimestamp();
		
		await interaction.reply({ embeds: [embed] });
	}
};
