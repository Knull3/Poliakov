import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import fs from 'fs';
import path from 'path';

// Fonction pour gérer les backups d'emojis en JSON
const BACKUP_PATH = './data/emoji_backups.json';

function getEmojiBackups() {
	if (!fs.existsSync(BACKUP_PATH)) {
		fs.writeFileSync(BACKUP_PATH, JSON.stringify({}, null, 2));
	}
	return JSON.parse(fs.readFileSync(BACKUP_PATH, 'utf-8'));
}

function saveEmojiBackup(userId, code, serverName, emojis, size) {
	const backups = getEmojiBackups();
	if (!backups[userId]) backups[userId] = [];
	
	backups[userId].push({
		code,
		server: serverName,
		emojis,
		size,
		timestamp: Date.now()
	});
	
	fs.writeFileSync(BACKUP_PATH, JSON.stringify(backups, null, 2));
}

function deleteEmojiBackup(userId, code) {
	const backups = getEmojiBackups();
	if (backups[userId]) {
		backups[userId] = backups[userId].filter(b => b.code !== code);
		fs.writeFileSync(BACKUP_PATH, JSON.stringify(backups, null, 2));
	}
}

function clearEmojiBackups(userId) {
	const backups = getEmojiBackups();
	delete backups[userId];
	fs.writeFileSync(BACKUP_PATH, JSON.stringify(backups, null, 2));
}

function getEmojiBackup(userId, code) {
	const backups = getEmojiBackups();
	if (backups[userId]) {
		return backups[userId].find(b => b.code === code);
	}
	return null;
}

function duration(mss) {
	const sec = Math.floor((mss / 1000) % 60).toString();
	const min = Math.floor((mss / (1000 * 60)) % 60).toString();
	const hrs = Math.floor((mss / (1000 * 60 * 60)) % 60).toString();
	const days = Math.floor(mss / (1000 * 60 * 60 * 24)).toString();
	return `${days.padStart(2, '') == "0" ? "" : `${days.padStart(2, '')} jours, `}${hrs.padStart(2, '') == "0" ? "" : `${hrs.padStart(2, '')} heures, `}${min.padStart(2, '') == "0" ? "" : `${min.padStart(2, '')} minutes et `}${sec.padStart(2, '')} secondes`;
}

export default {
	data: new SlashCommandBuilder()
		.setName('backup')
		.setDescription('Gestion des backups d\'emojis')
		.addSubcommand(subcommand =>
			subcommand
				.setName('emoji')
				.setDescription('Gestion des backups d\'emojis')
				.addStringOption(option =>
					option.setName('action')
						.setDescription('Action à effectuer')
						.setRequired(true)
						.addChoices(
							{ name: 'Créer', value: 'create' },
							{ name: 'Supprimer', value: 'delete' },
							{ name: 'Vider', value: 'clear' },
							{ name: 'Charger', value: 'load' },
							{ name: 'Liste', value: 'list' }
						))
				.addStringOption(option =>
					option.setName('code')
						.setDescription('Code de la backup')
						.setRequired(false))),

	async execute(interaction, client) {
		// Vérifier si l'utilisateur est owner
		if (!client.config.owner.includes(interaction.user.id)) {
			const errorEmbed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('❌ Permission refusée')
				.setDescription('Seuls les propriétaires du bot peuvent utiliser cette commande.')
				.setTimestamp();
			
			return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
		}

		const action = interaction.options.getString('action');
		const code = interaction.options.getString('code');

		if (action === 'create') {
			if (!code) {
				return interaction.reply({ content: '❌ Merci d\'entrer un nom de backup !', ephemeral: true });
			}

			await interaction.deferReply();
			
			const emojis = interaction.guild.emojis.cache;
			const emojiArray = emojis.map(e => e.toString());
			
			saveEmojiBackup(client.user.id, code, interaction.guild.name, emojiArray, emojis.size);
			
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('✅ Backup créée')
				.setDescription(`${emojis.size} ${emojis.size > 1 ? 'émojis ont été sauvegardés' : 'émoji a été sauvegardé'} sous le code \`${code}\``)
				.setTimestamp();
			
			return interaction.editReply({ embeds: [embed] });

		} else if (action === 'delete') {
			if (!code) {
				return interaction.reply({ content: '❌ Merci d\'entrer un code de backup !', ephemeral: true });
			}

			const backup = getEmojiBackup(client.user.id, code);
			if (!backup) {
				return interaction.reply({ content: '❌ Backup introuvable !', ephemeral: true });
			}

			deleteEmojiBackup(client.user.id, code);
			
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('✅ Backup supprimée')
				.setDescription(`La backup \`${code}\` a été supprimée.`)
				.setTimestamp();
			
			return interaction.reply({ embeds: [embed] });

		} else if (action === 'clear') {
			clearEmojiBackups(client.user.id);
			
			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('✅ Backups supprimées')
				.setDescription('Toutes les backups d\'émojis ont été supprimées.')
				.setTimestamp();
			
			return interaction.reply({ embeds: [embed] });

		} else if (action === 'load') {
			if (!code) {
				return interaction.reply({ content: '❌ Merci d\'entrer un code de backup !', ephemeral: true });
			}

			const backup = getEmojiBackup(client.user.id, code);
			if (!backup) {
				return interaction.reply({ content: '❌ Backup introuvable !', ephemeral: true });
			}

			await interaction.deferReply();
			
			let successCount = 0;
			let errorCount = 0;

			for (const emote of backup.emojis) {
				try {
					const emoji = client.util.parseEmoji(emote);
								if (emoji.id) {
						const link = `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'png'}`;
						await interaction.guild.emojis.create(link, emoji.name);
						successCount++;
						}
				} catch (error) {
					errorCount++;
				}
			}

			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('✅ Backup chargée')
				.setDescription(`Backup d'émoji chargée : ${successCount}/${backup.size} émojis créés${errorCount > 0 ? ` (${errorCount} erreurs)` : ''}`)
				.setTimestamp();
			
			return interaction.editReply({ embeds: [embed] });

		} else if (action === 'list') {
			const backups = getEmojiBackups()[client.user.id] || [];
			
			if (backups.length === 0) {
				return interaction.reply({ content: '❌ Aucune backup d\'émoji trouvée.', ephemeral: true });
			}

			const embed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('📋 Liste des backups d\'émojis')
				.setDescription(backups.map(b => `\`${b.code}\` - ${b.server} (${b.size} émojis)`).join('\n'))
				.setFooter({ text: `${client.config.name} • ${backups.length} backup(s)` })
				.setTimestamp();
			
			return interaction.reply({ embeds: [embed] });
								}
	}
};
