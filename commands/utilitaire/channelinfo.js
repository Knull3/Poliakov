const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('channelinfo')
		.setDescription('Afficher les informations d\'un salon')
		.addChannelOption(option =>
			option.setName('channel')
				.setDescription('Salon à afficher')
				.setRequired(false)),
	async execute(interaction) {
		const channel = interaction.options.getChannel('channel') || interaction.channel;
		
		// Formatage de la date de création
		const createdAt = Math.floor(channel.createdTimestamp / 1000);
		
		// Obtenir le type de salon en français
		let channelType = "Inconnu";
		switch (channel.type) {
			case ChannelType.GuildText:
				channelType = "Salon textuel";
				break;
			case ChannelType.GuildVoice:
				channelType = "Salon vocal";
				break;
			case ChannelType.GuildCategory:
				channelType = "Catégorie";
				break;
			case ChannelType.GuildAnnouncement:
				channelType = "Salon d'annonces";
				break;
			case ChannelType.GuildStageVoice:
				channelType = "Salon de conférence";
				break;
			case ChannelType.GuildForum:
				channelType = "Forum";
				break;
			case ChannelType.PublicThread:
				channelType = "Fil public";
				break;
			case ChannelType.PrivateThread:
				channelType = "Fil privé";
				break;
			case ChannelType.AnnouncementThread:
				channelType = "Fil d'annonce";
				break;
			default:
				channelType = `Type ${channel.type}`;
		}
		
		// Informations spécifiques au type de salon
		const fields = [
			{ name: 'ID', value: channel.id, inline: true },
			{ name: 'Nom', value: channel.name, inline: true },
			{ name: 'Type', value: channelType, inline: true },
			{ name: 'Créé le', value: `<t:${createdAt}:F> (<t:${createdAt}:R>)`, inline: true }
		];
		
		// Ajouter des informations spécifiques selon le type de salon
		if (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement) {
			fields.push(
				{ name: 'Sujet', value: channel.topic || 'Aucun sujet', inline: true },
				{ name: 'NSFW', value: channel.nsfw ? 'Oui' : 'Non', inline: true },
				{ name: 'Mode lent', value: channel.rateLimitPerUser ? `${channel.rateLimitPerUser} secondes` : 'Désactivé', inline: true }
			);
		} else if (channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice) {
			fields.push(
				{ name: 'Bitrate', value: `${channel.bitrate / 1000} kbps`, inline: true },
				{ name: 'Limite d\'utilisateurs', value: channel.userLimit ? `${channel.userLimit} utilisateurs` : 'Illimité', inline: true }
			);
		}
		
		// Ajouter la catégorie parent si elle existe
		if (channel.parent) {
			fields.push({ name: 'Catégorie', value: channel.parent.name, inline: true });
		}
		
		// Création de l'embed
		const embed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle(`Informations sur #${channel.name}`)
			.addFields(fields)
			.setTimestamp();
		
		await interaction.reply({ embeds: [embed] });
	}
};
