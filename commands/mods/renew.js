const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('renew')
		.setDescription('Renouveler le salon actuel')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

	async execute(interaction) {
		await interaction.deferReply();
		
		try {
			const channel = interaction.channel;
			
			// Récupérer les informations du salon avant de le supprimer
			const channelName = channel.name;
			const channelType = channel.type;
			const channelTopic = channel.topic;
			const channelParent = channel.parent;
			const channelPosition = channel.position;
			const channelPermissions = channel.permissionOverwrites.cache;
			const isNsfw = channel.nsfw;
			const rateLimitPerUser = channel.rateLimitPerUser;
			
			// Créer un nouveau salon avec les mêmes paramètres
			const newChannel = await interaction.guild.channels.create({
				name: channelName,
				type: channelType,
				topic: channelTopic,
				parent: channelParent,
				position: channelPosition,
				nsfw: isNsfw,
				rateLimitPerUser: rateLimitPerUser
			});
			
			// Copier les permissions
			channelPermissions.forEach(perm => {
				newChannel.permissionOverwrites.create(perm.id, perm.allow.toJSON(), perm.deny.toJSON());
			});
			
			// Supprimer l'ancien salon
			await channel.delete(`Renouvelé par ${interaction.user.tag}`);
			
			// Envoyer un message dans le nouveau salon
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('🔄 Salon renouvelé')
				.setDescription(`Le salon a été renouvelé par ${interaction.user}.`)
				.setTimestamp();
			
			await newChannel.send({ embeds: [embed] });
		} catch (error) {
			console.error('Erreur lors du renouvellement du salon:', error);
			
			// Répondre avec une erreur si quelque chose s'est mal passé
			const errorEmbed = new EmbedBuilder()
				.setColor('#FF0000')
				.setTitle('❌ Erreur')
				.setDescription('Une erreur est survenue lors du renouvellement du salon.')
				.setTimestamp();
			
			// Si la réponse n'a pas encore été envoyée
			if (interaction.deferred && !interaction.replied) {
				await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
			}
		}
	}
};
