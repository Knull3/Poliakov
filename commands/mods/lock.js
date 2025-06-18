const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lock')
		.setDescription('Verrouiller le salon actuel')
		.addChannelOption(option =>
			option.setName('channel')
				.setDescription('Salon à verrouiller (par défaut: salon actuel)')
				.setRequired(false))
		.addStringOption(option =>
			option.setName('reason')
				.setDescription('Raison du verrouillage')
				.setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

	async execute(interaction) {
		await interaction.deferReply();
		
		try {
			// Récupérer le salon et la raison
			const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
			const reason = interaction.options.getString('reason') || 'Aucune raison fournie';
			
			// Vérifier si le salon est un salon textuel
			if (targetChannel.type !== ChannelType.GuildText && 
				targetChannel.type !== ChannelType.GuildAnnouncement &&
				targetChannel.type !== ChannelType.GuildForum) {
				return interaction.followUp({
					embeds: [
						new EmbedBuilder()
							.setColor('#FF0000')
							.setTitle('❌ Erreur')
							.setDescription('Vous ne pouvez verrouiller que des salons textuels.')
							.setTimestamp()
					]
				});
			}
			
			// Vérifier si le bot a la permission de gérer les salons
			if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
				return interaction.followUp({
					embeds: [
						new EmbedBuilder()
							.setColor('#FF0000')
							.setTitle('❌ Erreur')
							.setDescription('Je n\'ai pas la permission de gérer les salons.')
							.setTimestamp()
					]
				});
			}
			
			// Vérifier si le salon est déjà verrouillé
			const everyoneRole = interaction.guild.roles.everyone;
			const currentPermissions = targetChannel.permissionsFor(everyoneRole);
			
			if (!currentPermissions.has(PermissionFlagsBits.SendMessages)) {
				return interaction.followUp({
					embeds: [
						new EmbedBuilder()
							.setColor('#FF0000')
							.setTitle('❌ Erreur')
							.setDescription(`Le salon ${targetChannel} est déjà verrouillé.`)
							.setTimestamp()
					]
				});
			}
			
			// Verrouiller le salon en retirant la permission d'envoyer des messages
			await targetChannel.permissionOverwrites.edit(everyoneRole, {
				SendMessages: false
			}, { reason: `Verrouillé par ${interaction.user.tag} - ${reason}` });
			
			// Créer un embed pour le message de confirmation
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('🔒 Salon verrouillé')
				.setDescription(`Le salon ${targetChannel} a été verrouillé.`)
				.addFields(
					{ name: 'Modérateur', value: `${interaction.user}`, inline: true },
					{ name: 'Raison', value: reason }
				)
				.setTimestamp();
			
			await interaction.followUp({ embeds: [embed] });
			
			// Envoyer un message dans le salon verrouillé si ce n'est pas le salon actuel
			if (targetChannel.id !== interaction.channel.id) {
				await targetChannel.send({
					embeds: [
						new EmbedBuilder()
							.setColor('#8B0000')
							.setTitle('🔒 Salon verrouillé')
							.setDescription(`Ce salon a été verrouillé par ${interaction.user}.`)
							.addFields(
								{ name: 'Raison', value: reason }
							)
							.setTimestamp()
					]
				});
			}
		} catch (error) {
			console.error('Erreur lors du verrouillage du salon:', error);
			await interaction.followUp({
				embeds: [
					new EmbedBuilder()
						.setColor('#FF0000')
						.setTitle('❌ Erreur')
						.setDescription('Une erreur est survenue lors du verrouillage du salon.')
						.setTimestamp()
				],
				ephemeral: true
			});
		}
	}
};
