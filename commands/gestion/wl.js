const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("../../util/db.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wl')
		.setDescription('Gestion de la whitelist')
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('Ajouter un utilisateur à la whitelist')
				.addUserOption(option =>
					option.setName('user')
						.setDescription('Utilisateur à ajouter')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('remove')
				.setDescription('Retirer un utilisateur de la whitelist')
				.addUserOption(option =>
					option.setName('user')
						.setDescription('Utilisateur à retirer')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('Lister la whitelist'))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	async execute(interaction, client) {
		const subcommand = interaction.options.getSubcommand();
		
		if (subcommand === 'add') {
			const user = interaction.options.getUser('user');
			const isAlreadyWhitelisted = await db.get(`wlmd_${interaction.guild.id}_${user.id}`);
			
			if (isAlreadyWhitelisted) {
				const errorEmbed = new EmbedBuilder()
					.setColor('#8B0000')
					.setTitle('❌ Erreur')
					.setDescription(`L'utilisateur ${user} est déjà dans la whitelist.`)
					.setFooter({ text: client.config.name })
					.setTimestamp();
				
				return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
			}
			
			// Ajouter à la whitelist
			await db.set(`wlmd_${interaction.guild.id}_${user.id}`, true);
			
			// Ajouter l'ID de l'utilisateur à la liste des membres whitelist
			let wlList = await db.get(`wllist_${interaction.guild.id}`) || [];
			if (!wlList.includes(user.id)) {
				wlList.push(user.id);
				await db.set(`wllist_${interaction.guild.id}`, wlList);
			}
			
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('✅ Whitelist')
				.setDescription(`L'utilisateur ${user} a été ajouté à la whitelist.`)
				.setFooter({ text: client.config.name })
				.setTimestamp();
			
			return interaction.reply({ embeds: [embed] });
		}
		
		if (subcommand === 'remove') {
			const user = interaction.options.getUser('user');
			const isWhitelisted = await db.get(`wlmd_${interaction.guild.id}_${user.id}`);
			
			if (!isWhitelisted) {
				const errorEmbed = new EmbedBuilder()
					.setColor('#8B0000')
					.setTitle('❌ Erreur')
					.setDescription(`L'utilisateur ${user} n'est pas dans la whitelist.`)
					.setFooter({ text: client.config.name })
					.setTimestamp();
				
				return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
			}
			
			// Retirer de la whitelist
			await db.delete(`wlmd_${interaction.guild.id}_${user.id}`);
			
			// Retirer l'ID de l'utilisateur de la liste des membres whitelist
			let wlList = await db.get(`wllist_${interaction.guild.id}`) || [];
			wlList = wlList.filter(id => id !== user.id);
			await db.set(`wllist_${interaction.guild.id}`, wlList);
			
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('❌ Whitelist')
				.setDescription(`L'utilisateur ${user} a été retiré de la whitelist.`)
				.setFooter({ text: client.config.name })
				.setTimestamp();
			
			return interaction.reply({ embeds: [embed] });
		}
		
		if (subcommand === 'list') {
			const wlList = await db.get(`wllist_${interaction.guild.id}`) || [];
			
			let description = '';
			if (wlList.length === 0) {
				description = 'Aucun utilisateur dans la whitelist.';
			} else {
				description = '**Utilisateurs whitelist:**\n\n';
				for (let i = 0; i < wlList.length; i++) {
					const userId = wlList[i];
					try {
						const user = await client.users.fetch(userId);
						description += `${i+1}. ${user.tag} (${user.id})\n`;
					} catch (error) {
						description += `${i+1}. Utilisateur inconnu (${userId})\n`;
					}
				}
			}
			
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('📋 Whitelist')
				.setDescription(description)
				.setFooter({ text: client.config.name })
				.setTimestamp();
			
			return interaction.reply({ embeds: [embed] });
		}
	}
};
