const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require("discord.js");
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('muterole')
		.setDescription('Définir le rôle muet du serveur')
		.addRoleOption(option =>
			option.setName('role')
				.setDescription('Rôle muet à définir')
				.setRequired(true))
		.addBooleanOption(option =>
			option.setName('setup')
				.setDescription('Configurer automatiquement les permissions du rôle dans tous les salons')
				.setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

	async execute(interaction) {
		await interaction.deferReply();
		
		try {
			const role = interaction.options.getRole('role');
			const setupPermissions = interaction.options.getBoolean('setup') || false;
			const guild = interaction.guild;
			
			// Vérifier si le bot a la permission de gérer les rôles
			if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
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
			
			// Vérifier si le rôle est gérable par le bot
			if (role.position >= guild.members.me.roles.highest.position) {
				return interaction.followUp({
					embeds: [
						new EmbedBuilder()
							.setColor('#FF0000')
							.setTitle('❌ Erreur')
							.setDescription('Je ne peux pas gérer ce rôle car il est plus haut que mon rôle le plus élevé.')
							.setTimestamp()
					]
				});
			}
			
			// Sauvegarder le rôle muet dans la base de données
			await db.set(`muterole_${guild.id}`, role.id);
			
			// Configurer les permissions du rôle si demandé
			if (setupPermissions) {
				await interaction.followUp({
					embeds: [
						new EmbedBuilder()
							.setColor('#FFA500')
							.setTitle('⚙️ Configuration en cours')
							.setDescription(`Configuration des permissions pour le rôle ${role} dans tous les salons. Cela peut prendre un moment...`)
							.setTimestamp()
					]
				});
				
				// Récupérer tous les salons
				const channels = await guild.channels.fetch();
				
				// Configurer les permissions pour chaque salon
				let successCount = 0;
				let errorCount = 0;
				
				for (const [channelId, channel] of channels) {
					try {
						// Ignorer les catégories et les threads
						if (channel.type === ChannelType.GuildCategory || 
							channel.type === ChannelType.PublicThread || 
							channel.type === ChannelType.PrivateThread || 
							channel.type === ChannelType.AnnouncementThread) {
							continue;
						}
						
						// Définir les permissions selon le type de salon
						if (channel.type === ChannelType.GuildText || 
							channel.type === ChannelType.GuildAnnouncement || 
							channel.type === ChannelType.GuildForum) {
							// Salons textuels
							await channel.permissionOverwrites.edit(role, {
								SendMessages: false,
								AddReactions: false,
								CreatePublicThreads: false,
								CreatePrivateThreads: false,
								SendMessagesInThreads: false
							});
						} else if (channel.type === ChannelType.GuildVoice || 
								   channel.type === ChannelType.GuildStageVoice) {
							// Salons vocaux
							await channel.permissionOverwrites.edit(role, {
								Speak: false,
								Stream: false
							});
						}
						
						successCount++;
					} catch (error) {
						console.error(`Erreur lors de la configuration des permissions pour le salon ${channel.name}:`, error);
						errorCount++;
					}
				}
				
				// Créer un embed pour le résultat
				const resultEmbed = new EmbedBuilder()
					.setColor('#8B0000')
					.setTitle('🔇 Rôle muet défini')
					.setDescription(`Le rôle muet du serveur est maintenant ${role}.`)
					.addFields(
						{ name: 'Configuration des permissions', value: `✅ Succès: ${successCount} salons\n❌ Échecs: ${errorCount} salons` }
					)
					.setTimestamp();
				
				await interaction.followUp({ embeds: [resultEmbed] });
			} else {
				// Répondre sans configurer les permissions
				const embed = new EmbedBuilder()
					.setColor('#8B0000')
					.setTitle('🔇 Rôle muet défini')
					.setDescription(`Le rôle muet du serveur est maintenant ${role}.`)
					.addFields(
						{ name: 'Configuration des permissions', value: 'Les permissions n\'ont pas été configurées automatiquement. Utilisez `/muterole role:@role setup:true` pour configurer les permissions.' }
					)
					.setTimestamp();
				
				await interaction.followUp({ embeds: [embed] });
			}
		} catch (error) {
			console.error('Erreur lors de la définition du rôle muet:', error);
			await interaction.followUp({
				embeds: [
					new EmbedBuilder()
						.setColor('#FF0000')
						.setTitle('❌ Erreur')
						.setDescription('Une erreur est survenue lors de la définition du rôle muet.')
						.setTimestamp()
				],
				ephemeral: true
			});
		}
	}
};
