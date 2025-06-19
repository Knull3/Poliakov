const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require("../../util/db.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('levels')
		.setDescription('Gestion du système de niveaux')
		.addSubcommand(subcommand =>
			subcommand
				.setName('setup')
				.setDescription('Configurer le système de niveaux')
				.addChannelOption(option =>
					option.setName('channel')
						.setDescription('Canal pour les notifications de niveau')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('top')
				.setDescription('Voir le classement des niveaux'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('rank')
				.setDescription('Voir votre niveau')
				.addUserOption(option =>
					option.setName('user')
						.setDescription('Utilisateur à vérifier')
						.setRequired(false)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('reset')
				.setDescription('Réinitialiser les niveaux d\'un utilisateur ou du serveur')
				.addUserOption(option =>
					option.setName('user')
						.setDescription('Utilisateur à réinitialiser (laisser vide pour réinitialiser tout le serveur)')
						.setRequired(false)))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

	async execute(interaction, client) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === 'setup') {
			const channel = interaction.options.getChannel('channel');
			
			// Enregistrer le canal de notification
			await db.set(`levelchannel_${interaction.guild.id}`, channel.id);
			
			// Activer le système de niveaux
			await db.set(`levelssystem_${interaction.guild.id}`, true);
			
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('📊 Configuration Système de Niveaux')
				.setDescription(`Le système de niveaux a été configuré avec succès!\n\n**Canal de notifications:** ${channel}`)
				.addFields(
					{ name: '🔧 Statut', value: 'Activé', inline: true },
					{ name: '📢 Notifications', value: 'Activées', inline: true }
				)
				.setFooter({ text: client.config.name })
				.setTimestamp();

			return interaction.reply({ embeds: [embed] });
		}

		if (subcommand === 'top') {
			// Récupérer tous les membres avec des niveaux
			const members = await db.all();
			const levelMembers = members
				.filter(m => m.ID.startsWith(`guild_${interaction.guild.id}_level_`))
				.sort((a, b) => b.data - a.data)
				.slice(0, 10);
			
			let description = '';
			
			if (levelMembers.length === 0) {
				description = 'Aucun membre n\'a encore gagné de niveaux.';
			} else {
				// Pour chaque membre, récupérer son niveau et XP
				for (let i = 0; i < levelMembers.length; i++) {
					const memberId = levelMembers[i].ID.split('_')[3];
					const level = levelMembers[i].data;
					const xp = await db.get(`guild_${interaction.guild.id}_xp_${memberId}`) || 0;
					const xpNeeded = level * 500;
					const member = await interaction.guild.members.fetch(memberId).catch(() => null);
					
					if (member) {
						description += `${i + 1}. **${member.user.username}** - Niveau ${level} (${xp}/${xpNeeded} XP)\n`;
					} else {
						description += `${i + 1}. **Utilisateur inconnu** - Niveau ${level} (${xp}/${xpNeeded} XP)\n`;
					}
				}
			}
			
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('🏆 Classement des Niveaux')
				.setDescription(description)
				.setFooter({ text: client.config.name })
				.setTimestamp();

			return interaction.reply({ embeds: [embed] });
		}

		if (subcommand === 'rank') {
			const user = interaction.options.getUser('user') || interaction.user;
			
			// Récupérer le niveau et XP de l'utilisateur
			const level = await db.get(`guild_${interaction.guild.id}_level_${user.id}`) || 1;
			const xp = await db.get(`guild_${interaction.guild.id}_xp_${user.id}`) || 0;
			const xpNeeded = level * 500;
			const progress = Math.floor((xp / xpNeeded) * 100);
			
			// Temps vocal total
			const totalVocalTime = await db.get(`totalVocalTime_${interaction.guild.id}_${user.id}`) || 0;
			const hours = Math.floor(totalVocalTime / 3600000);
			const minutes = Math.floor((totalVocalTime % 3600000) / 60000);
			
			// Nombre de messages
			const messages = await db.get(`msg_${interaction.guild.id}_${user.id}`) || 0;
			
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle(`📈 Niveau de ${user.username}`)
				.setDescription(`**Niveau:** ${level}\n**XP:** ${xp}/${xpNeeded}\n**Progression:** ${progress}%`)
				.addFields(
					{ name: '💬 Messages', value: `${messages} messages`, inline: true },
					{ name: '🎙️ Temps vocal', value: `${hours}h ${minutes}m`, inline: true }
				)
				.setThumbnail(user.displayAvatarURL({ dynamic: true }))
				.setFooter({ text: client.config.name })
				.setTimestamp();

			// Créer une barre de progression
			let progressBar = '';
			const barLength = 20;
			const filledBars = Math.floor((progress / 100) * barLength);
			
			for (let i = 0; i < barLength; i++) {
				if (i < filledBars) {
					progressBar += '█';
				} else {
					progressBar += '░';
				}
			}
			
			embed.addFields({ name: 'Progression', value: `\`${progressBar}\` ${progress}%` });

			return interaction.reply({ embeds: [embed] });
		}
		
		if (subcommand === 'reset') {
			const user = interaction.options.getUser('user');
			
			if (user) {
				// Réinitialiser les niveaux d'un utilisateur spécifique
				await db.delete(`guild_${interaction.guild.id}_level_${user.id}`);
				await db.delete(`guild_${interaction.guild.id}_xp_${user.id}`);
				await db.delete(`msg_${interaction.guild.id}_${user.id}`);
				await db.delete(`totalVocalTime_${interaction.guild.id}_${user.id}`);
				
				const embed = new EmbedBuilder()
					.setColor('#8B0000')
					.setTitle('🔄 Réinitialisation des Niveaux')
					.setDescription(`Les niveaux de ${user} ont été réinitialisés avec succès.`)
					.setFooter({ text: client.config.name })
					.setTimestamp();
				
				return interaction.reply({ embeds: [embed] });
			} else {
				// Confirmation pour réinitialiser tous les niveaux du serveur
				const embed = new EmbedBuilder()
					.setColor('#8B0000')
					.setTitle('⚠️ Confirmation')
					.setDescription('Êtes-vous sûr de vouloir réinitialiser tous les niveaux du serveur? Cette action est irréversible.')
					.setFooter({ text: client.config.name })
					.setTimestamp();
				
				const row = new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder()
							.setCustomId('confirm_reset_levels')
							.setLabel('Oui, réinitialiser tout')
							.setStyle(ButtonStyle.Danger),
						new ButtonBuilder()
							.setCustomId('cancel_reset_levels')
							.setLabel('Annuler')
							.setStyle(ButtonStyle.Secondary)
					);
				
				const response = await interaction.reply({ embeds: [embed], components: [row] });
				
				// Collecter la réponse
				const filter = i => i.user.id === interaction.user.id;
				try {
					const confirmation = await response.awaitMessageComponent({ filter, time: 30000 });
					
					if (confirmation.customId === 'confirm_reset_levels') {
						// Récupérer tous les membres avec des niveaux
						const members = await db.all();
						const levelMembers = members.filter(m => m.ID.startsWith(`guild_${interaction.guild.id}_level_`));
						
						// Réinitialiser les niveaux pour chaque membre
						for (const member of levelMembers) {
							const memberId = member.ID.split('_')[3];
							await db.delete(`guild_${interaction.guild.id}_level_${memberId}`);
							await db.delete(`guild_${interaction.guild.id}_xp_${memberId}`);
							await db.delete(`msg_${interaction.guild.id}_${memberId}`);
							await db.delete(`totalVocalTime_${interaction.guild.id}_${memberId}`);
						}
						
						// Réinitialiser le total XP du serveur
						await db.delete(`guild_${interaction.guild.id}_xptotal_${interaction.guild.id}`);
						
						const successEmbed = new EmbedBuilder()
							.setColor('#8B0000')
							.setTitle('✅ Réinitialisation Terminée')
							.setDescription(`Tous les niveaux du serveur ont été réinitialisés.`)
							.setFooter({ text: client.config.name })
							.setTimestamp();
						
						await confirmation.update({ embeds: [successEmbed], components: [] });
					} else {
						const cancelEmbed = new EmbedBuilder()
							.setColor('#8B0000')
							.setTitle('❌ Réinitialisation Annulée')
							.setDescription('L\'opération a été annulée.')
							.setFooter({ text: client.config.name })
							.setTimestamp();
						
						await confirmation.update({ embeds: [cancelEmbed], components: [] });
					}
				} catch (error) {
					const timeoutEmbed = new EmbedBuilder()
						.setColor('#8B0000')
						.setTitle('⏱️ Délai expiré')
						.setDescription('Vous n\'avez pas répondu à temps. L\'opération a été annulée.')
						.setFooter({ text: client.config.name })
						.setTimestamp();
					
					await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
				}
			}
		}
	}
};
