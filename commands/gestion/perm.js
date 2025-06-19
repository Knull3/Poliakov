const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType, RoleSelectMenuBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require("discord.js");
const db = require("../../util/db.js");
const fs = require('fs');
const path = require('path');

// Liste des commandes par catégorie
const getCommandCategories = () => {
	const categories = {};
	const commandsDir = path.join(__dirname, '..');

	// Lire tous les dossiers de commandes
	fs.readdirSync(commandsDir).forEach(category => {
		const categoryPath = path.join(commandsDir, category);
		
		// Vérifier si c'est un dossier
		if (fs.statSync(categoryPath).isDirectory()) {
			categories[category] = [];
			
			// Lire toutes les commandes dans ce dossier
			fs.readdirSync(categoryPath)
				.filter(file => file.endsWith('.js'))
				.forEach(file => {
					const commandName = file.replace('.js', '');
					categories[category].push(commandName);
				});
		}
	});
	
	return categories;
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('perm')
		.setDescription('Gestion des permissions')
		.addSubcommand(subcommand =>
			subcommand
				.setName('setup')
				.setDescription('Configurer les permissions')
				.addRoleOption(option =>
					option
						.setName('role')
						.setDescription('Rôle à configurer')
						.setRequired(true))
				.addStringOption(option =>
					option
						.setName('type')
						.setDescription('Type de permission')
						.setRequired(true)
						.addChoices(
							{ name: 'Admin', value: 'admin' },
							{ name: 'Modérateur', value: 'mod' },
							{ name: 'DJ', value: 'dj' },
							{ name: 'Utilisateur', value: 'user' }
						)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('Lister les permissions'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('remove')
				.setDescription('Supprimer une permission')
				.addRoleOption(option =>
					option
						.setName('role')
						.setDescription('Rôle dont les permissions seront supprimées')
						.setRequired(true)))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	async execute(interaction, client) {
		const subcommand = interaction.options.getSubcommand();
		const guildId = interaction.guild.id;

		if (subcommand === 'setup') {
			const role = interaction.options.getRole('role');
			const permType = interaction.options.getString('type');
			
			// Enregistrer la permission
			await db.set(`perm_${guildId}_${role.id}`, permType);
			
			// Mettre à jour la liste des rôles pour ce type de permission
			let rolesWithPerm = await db.get(`permroles_${guildId}_${permType}`) || [];
			if (!rolesWithPerm.includes(role.id)) {
				rolesWithPerm.push(role.id);
				await db.set(`permroles_${guildId}_${permType}`, rolesWithPerm);
			}
			
			// Confirmer la configuration
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('✅ Configuration des Permissions')
				.setDescription(`Le rôle ${role} a désormais les permissions de **${permType}**.`)
				.addFields(
					{ name: '🔰 Type', value: permType, inline: true },
					{ name: '🛡️ Rôle', value: role.name, inline: true }
				)
				.setFooter({ text: client.config.name })
				.setTimestamp();
			
			return interaction.reply({ embeds: [embed] });
		}
		
		if (subcommand === 'list') {
			// Récupérer tous les types de permissions
			const permTypes = ['admin', 'mod', 'dj', 'user'];
			const permData = {};
			
			// Pour chaque type, récupérer les rôles associés
			for (const type of permTypes) {
				const roleIds = await db.get(`permroles_${guildId}_${type}`) || [];
				permData[type] = roleIds.map(id => {
					const role = interaction.guild.roles.cache.get(id);
					return role ? role.name : `Rôle inconnu (${id})`;
				});
			}
			
			// Créer la description avec toutes les permissions
			let description = '**Permissions actuellement configurées :**\n\n';
			
			if (permData.admin.length > 0) {
				description += '**🔰 Admin**\n';
				permData.admin.forEach(role => description += `• ${role}\n`);
				description += '\n';
			}
			
			if (permData.mod.length > 0) {
				description += '**🔰 Modérateur**\n';
				permData.mod.forEach(role => description += `• ${role}\n`);
				description += '\n';
			}
			
			if (permData.dj.length > 0) {
				description += '**🔰 DJ**\n';
				permData.dj.forEach(role => description += `• ${role}\n`);
				description += '\n';
			}
			
			if (permData.user.length > 0) {
				description += '**🔰 Utilisateur**\n';
				permData.user.forEach(role => description += `• ${role}\n`);
				description += '\n';
			}
			
			if (permData.admin.length === 0 && permData.mod.length === 0 && 
				permData.dj.length === 0 && permData.user.length === 0) {
				description = '**Aucune permission configurée.**\n\nUtilisez `/perm setup` pour configurer des permissions.';
			}
			
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('📋 Liste des Permissions')
				.setDescription(description)
				.setFooter({ text: client.config.name })
				.setTimestamp();
			
			return interaction.reply({ embeds: [embed] });
		}
		
		if (subcommand === 'remove') {
			const role = interaction.options.getRole('role');
			
			// Vérifier si ce rôle a des permissions
			const permType = await db.get(`perm_${guildId}_${role.id}`);
			
			if (!permType) {
				return interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setColor('#8B0000')
							.setTitle('❌ Erreur')
							.setDescription(`Le rôle ${role} n'a aucune permission configurée.`)
							.setFooter({ text: client.config.name })
							.setTimestamp()
					],
					ephemeral: true
				});
			}
			
			// Supprimer la permission
			await db.delete(`perm_${guildId}_${role.id}`);
			
			// Mettre à jour la liste des rôles pour ce type de permission
			let rolesWithPerm = await db.get(`permroles_${guildId}_${permType}`) || [];
			rolesWithPerm = rolesWithPerm.filter(id => id !== role.id);
			await db.set(`permroles_${guildId}_${permType}`, rolesWithPerm);
			
			// Confirmer la suppression
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('🗑️ Suppression de Permissions')
				.setDescription(`Les permissions du rôle ${role} ont été supprimées.`)
				.setFooter({ text: client.config.name })
				.setTimestamp();
			
			return interaction.reply({ embeds: [embed] });
		}
	}
};
