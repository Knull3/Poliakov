const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('derank')
		.setDescription('Retirer tous les rôles d\'un utilisateur')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Utilisateur à derank')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('reason')
				.setDescription('Raison du derank')
				.setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

	async execute(interaction) {
		await interaction.deferReply();
		
		try {
			const user = interaction.options.getUser('user');
			const reason = interaction.options.getString('reason') || 'Aucune raison fournie';
			
			// Récupérer le membre
			const member = await interaction.guild.members.fetch(user.id).catch(() => null);
			
			if (!member) {
				return interaction.followUp({
					embeds: [
						new EmbedBuilder()
							.setColor('#FF0000')
							.setTitle('❌ Erreur')
							.setDescription('Cet utilisateur n\'est pas sur le serveur.')
							.setTimestamp()
					]
				});
			}
			
			// Vérifier si l'utilisateur a des rôles
			if (member.roles.cache.size <= 1) { // Le rôle @everyone est toujours présent
				return interaction.followUp({
					embeds: [
						new EmbedBuilder()
							.setColor('#FF0000')
							.setTitle('❌ Erreur')
							.setDescription(`${user} n'a aucun rôle à retirer.`)
							.setTimestamp()
					]
				});
			}
			
			// Vérifier si le bot a la permission de gérer les rôles
			if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
				return interaction.followUp({
					embeds: [
						new EmbedBuilder()
							.setColor('#FF0000')
							.setTitle('❌ Erreur')
							.setDescription('Je n\'ai pas la permission de gérer les rôles.')
							.setTimestamp()
					]
				});
			}
			
			// Vérifier si le membre ciblé est plus haut dans la hiérarchie
			if (member.roles.highest.position >= interaction.member.roles.highest.position && 
				interaction.guild.ownerId !== interaction.user.id) {
				return interaction.followUp({
					embeds: [
						new EmbedBuilder()
							.setColor('#FF0000')
							.setTitle('❌ Erreur')
							.setDescription('Vous ne pouvez pas derank un membre avec un rôle supérieur ou égal au vôtre.')
							.setTimestamp()
					]
				});
			}
			
			// Vérifier si le bot peut gérer tous les rôles de l'utilisateur
			const botMember = interaction.guild.members.me;
			const unmanageableRoles = member.roles.cache.filter(role => 
				role.id !== interaction.guild.id && // Ignorer le rôle @everyone
				role.position >= botMember.roles.highest.position
			);
			
			if (unmanageableRoles.size > 0) {
				return interaction.followUp({
					embeds: [
						new EmbedBuilder()
							.setColor('#FF0000')
							.setTitle('❌ Erreur')
							.setDescription(`Je ne peux pas retirer certains rôles de ${user} car ils sont plus hauts que mon rôle le plus élevé.`)
							.setTimestamp()
					]
				});
			}
			
			// Sauvegarder les rôles avant de les retirer
			const roles = member.roles.cache.filter(role => role.id !== interaction.guild.id);
			const roleNames = roles.map(role => role.name).join(', ');
			
			// Retirer tous les rôles
			await member.roles.remove(roles, `Derank par ${interaction.user.tag} - Raison: ${reason}`);
			
			// Envoyer un message de confirmation
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('⏬ Derank')
				.setDescription(`Tous les rôles de ${user} ont été retirés.`)
				.addFields(
					{ name: 'Utilisateur', value: `${user} (${user.tag})`, inline: true },
					{ name: 'Modérateur', value: `${interaction.user}`, inline: true },
					{ name: 'Raison', value: reason },
					{ name: 'Rôles retirés', value: roleNames || 'Aucun' }
				)
				.setTimestamp();
			
			await interaction.followUp({ embeds: [embed] });
			
		} catch (error) {
			console.error('Erreur lors du derank:', error);
			await interaction.followUp({
				embeds: [
					new EmbedBuilder()
						.setColor('#FF0000')
						.setTitle('❌ Erreur')
						.setDescription('Une erreur est survenue lors du retrait des rôles.')
						.setTimestamp()
				],
				ephemeral: true
			});
		}
	}
};
