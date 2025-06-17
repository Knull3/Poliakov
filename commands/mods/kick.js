import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Expulser un utilisateur')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Utilisateur à expulser')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('reason')
				.setDescription('Raison de l\'expulsion')
				.setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

	async execute(interaction, client) {
		const user = interaction.options.getUser('user');
		const reason = interaction.options.getString('reason') || 'Aucune raison spécifiée';

		const member = interaction.guild.members.cache.get(user.id);

		if (!member) {
			return interaction.reply({ content: '❌ Cet utilisateur n\'est pas sur ce serveur.', ephemeral: true });
		}

		if (!member.kickable) {
			return interaction.reply({ content: '❌ Je ne peux pas expulser cet utilisateur.', ephemeral: true });
		}

		if (member.roles.highest.position >= interaction.member.roles.highest.position) {
			return interaction.reply({ content: '❌ Vous ne pouvez pas expulser quelqu\'un avec un rôle supérieur ou égal au vôtre.', ephemeral: true });
		}

		try {
			await member.kick(`${reason} - Expulsé par ${interaction.user.tag}`);

			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('👢 Utilisateur expulsé')
				.setThumbnail(user.displayAvatarURL())
				.addFields(
					{ name: '👤 Utilisateur', value: `${user.tag} (${user.id})`, inline: true },
					{ name: '🛡️ Modérateur', value: `${interaction.user.tag}`, inline: true },
					{ name: '📅 Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
					{ name: '📝 Raison', value: reason, inline: false }
				)
				.setFooter({ text: client.config.name })
				.setTimestamp();

			return interaction.reply({ embeds: [embed] });
		} catch (error) {
			const errorEmbed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('❌ Erreur')
				.setDescription(`Impossible d'expulser l'utilisateur : ${error.message}`)
				.setTimestamp();

			return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
		}
	}
};
