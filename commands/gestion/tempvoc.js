const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const db = require("../../util/db");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tempvoc')
		.setDescription('Gestion des salons vocaux temporaires')
		.addSubcommand(subcommand =>
			subcommand
				.setName('setup')
				.setDescription('Configurer les salons vocaux temporaires'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('Lister les salons vocaux temporaires'))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

	async execute(interaction, client) {
		const subcommand = interaction.options.getSubcommand();
		
		if (subcommand === 'setup') {
			// Créer un salon vocal temporaire
			const channel = await interaction.guild.channels.create({
				name: `🔊 ${interaction.user.username}`,
				type: ChannelType.GuildVoice,
				parent: interaction.channel.parent,
				permissionOverwrites: [
					{
						id: interaction.guild.id,
						deny: [PermissionFlagsBits.ViewChannel],
					},
					{
						id: interaction.user.id,
						allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak, PermissionFlagsBits.ManageChannels],
					},
				],
			});

			// Sauvegarder le salon temporaire
			await db.set(`tempvoc_${channel.id}`, {
				owner: interaction.user.id,
				guild: interaction.guild.id,
				createdAt: Date.now()
			});

			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('🔊 Salon Vocal Temporaire Créé')
				.setDescription(`✅ Salon vocal temporaire créé avec succès !\n\n**Salon :** ${channel}\n**Propriétaire :** ${interaction.user}\n\nVous pouvez maintenant vous connecter et inviter d'autres personnes.`)
				.setFooter({ text: client.config.name })
				.setTimestamp();
			return interaction.reply({ embeds: [embed] });
		}
		
		if (subcommand === 'list') {
			const tempvocs = await db.all();
			const userTempvocs = tempvocs.filter(data => 
				data.ID.startsWith('tempvoc_') && 
				data.data.owner === interaction.user.id
			);
			
			if (userTempvocs.length === 0) {
				const embed = new EmbedBuilder()
					.setColor('#8B0000')
					.setTitle('📋 Salons Vocaux Temporaires')
					.setDescription('Aucun salon temporaire configuré.\n\nUtilisez `/tempvoc setup` pour créer un salon vocal temporaire.')
					.setFooter({ text: client.config.name })
					.setTimestamp();
				return interaction.reply({ embeds: [embed] });
			}

			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('📋 Vos Salons Vocaux Temporaires')
				.setDescription(userTempvocs.map(tv => {
					const channel = interaction.guild.channels.cache.get(tv.ID.replace('tempvoc_', ''));
					return channel ? `• ${channel} (créé <t:${Math.floor(tv.data.createdAt / 1000)}:R>)` : `• Salon supprimé`;
				}).join('\n'))
				.setFooter({ text: client.config.name })
				.setTimestamp();
			return interaction.reply({ embeds: [embed] });
		}
	}
};
