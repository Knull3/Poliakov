const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("../../util/db");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('giveaway')
		.setDescription('Gestion des giveaways')
		.addSubcommand(subcommand =>
			subcommand
				.setName('create')
				.setDescription('Créer un giveaway')
				.addStringOption(option =>
					option.setName('prize')
						.setDescription('Prix à gagner')
						.setRequired(true))
				.addIntegerOption(option =>
					option.setName('winners')
						.setDescription('Nombre de gagnants')
						.setRequired(true)
						.setMinValue(1)
						.setMaxValue(10))
				.addStringOption(option =>
					option.setName('duration')
						.setDescription('Durée (ex: 1h, 1d, 1w)')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('Lister les giveaways actifs'))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

	async execute(interaction, client) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === 'create') {
			const prize = interaction.options.getString('prize');
			const winners = interaction.options.getInteger('winners');
			const duration = interaction.options.getString('duration');

			// Convertir la durée en millisecondes
			const ms = require('ms');
			const durationMs = ms(duration);
			
			if (!durationMs) {
				return interaction.reply({ 
					content: '❌ Format de durée invalide. Utilisez : 1s, 1m, 1h, 1d, 1w', 
					ephemeral: true 
				});
			}

			const endTime = Date.now() + durationMs;
			
			const embed = new EmbedBuilder()
				.setColor('#FF6B6B')
				.setTitle('🎉 GIVEAWAY')
				.setDescription(`**Prix :** ${prize}\n\n**Gagnants :** ${winners}\n**Fin :** <t:${Math.floor(endTime / 1000)}:R>\n\nRéagissez avec 🎉 pour participer !`)
				.setFooter({ text: `Organisé par ${interaction.user.tag}` })
				.setTimestamp();

			const message = await interaction.channel.send({ embeds: [embed] });
			await message.react('🎉');

			// Sauvegarder le giveaway dans la base de données
			await db.set(`giveaway_${message.id}`, {
				prize: prize,
				winners: winners,
				endTime: endTime,
				host: interaction.user.id,
				guild: interaction.guild.id,
				channel: interaction.channel.id,
				participants: []
			});

			// Programmer la fin du giveaway
			setTimeout(async () => {
				const giveawayData = await db.get(`giveaway_${message.id}`);
				if (!giveawayData) return;

				const channel = await interaction.guild.channels.fetch(giveawayData.channel).catch(() => null);
				if (!channel) return;

				const message = await channel.messages.fetch(message.id).catch(() => null);
				if (!message) return;

				const reaction = message.reactions.cache.get('🎉');
				if (!reaction) return;

				const participants = (await reaction.users.fetch()).filter(user => !user.bot).map(user => user.id);
				
				if (participants.length === 0) {
					const noWinnerEmbed = new EmbedBuilder()
						.setColor('#FF6B6B')
						.setTitle('🎉 GIVEAWAY TERMINÉ')
						.setDescription(`**Prix :** ${giveawayData.prize}\n\n❌ Personne n'a participé !`)
						.setFooter({ text: `Organisé par ${interaction.user.tag}` })
						.setTimestamp();
					
					message.edit({ embeds: [noWinnerEmbed] });
					await db.delete(`giveaway_${message.id}`);
					return;
				}

				const winners = [];
				for (let i = 0; i < Math.min(giveawayData.winners, participants.length); i++) {
					const winnerIndex = Math.floor(Math.random() * participants.length);
					winners.push(participants[winnerIndex]);
					participants.splice(winnerIndex, 1);
				}

				const winnerEmbed = new EmbedBuilder()
					.setColor('#FF6B6B')
					.setTitle('🎉 GIVEAWAY TERMINÉ')
					.setDescription(`**Prix :** ${giveawayData.prize}\n\n🏆 **Gagnants :** ${winners.map(id => `<@${id}>`).join(', ')}`)
					.setFooter({ text: `Organisé par ${interaction.user.tag}` })
					.setTimestamp();

				message.edit({ embeds: [winnerEmbed] });
				channel.send(`🎉 Félicitations ${winners.map(id => `<@${id}>`).join(', ')} ! Vous avez gagné **${giveawayData.prize}** !`);
				
				await db.delete(`giveaway_${message.id}`);
			}, durationMs);

			const confirmEmbed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('🎉 Giveaway Créé !')
				.setDescription(`**Prix :** ${prize}\n**Gagnants :** ${winners}\n**Durée :** ${duration}\n\n✅ **Giveaway créé avec succès !**`)
				.setFooter({ text: client.config.name })
				.setTimestamp();

			return interaction.reply({ embeds: [confirmEmbed] });
		}

		if (subcommand === 'list') {
			const giveaways = await db.all();
			const activeGiveaways = giveaways.filter(data => data.ID.startsWith('giveaway_'));
			
			if (activeGiveaways.length === 0) {
				const embed = new EmbedBuilder()
					.setColor('#8B0000')
					.setTitle('🎁 Giveaways Actifs')
					.setDescription('Aucun giveaway actif pour le moment.')
					.setFooter({ text: client.config.name })
					.setTimestamp();

				return interaction.reply({ embeds: [embed] });
			}

			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('🎁 Giveaways Actifs')
				.setDescription(activeGiveaways.map(gw => {
					const data = gw.data;
					return `**${data.prize}** - ${data.winners} gagnant(s) - Fin <t:${Math.floor(data.endTime / 1000)}:R>`;
				}).join('\n'))
				.setFooter({ text: client.config.name })
				.setTimestamp();

			return interaction.reply({ embeds: [embed] });
		}
	}
};
