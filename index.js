// Polyfill for ReadableStream
import 'web-streams-polyfill/dist/polyfill.mjs';

import { Client, GatewayIntentBits, Collection, ActivityType, EmbedBuilder } from 'discord.js';
import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { hasPermission } from './util/permissions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const config = JSON.parse(readdirSync('./config.json', 'utf-8'));

// Client setup
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildBans,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildIntegrations,
		GatewayIntentBits.GuildInvites,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessageTyping,
		GatewayIntentBits.GuildWebhooks,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.DirectMessageTyping,
	]
});

// Collections
client.slashCommands = new Collection();
client.config = config;

// Error handling
process.on('unhandledRejection', err => {
	console.error('Uncaught Promise Error:', err);
});

// Load slash commands
const loadSlashCommands = async (dir = './commands/') => {
	const commandDirs = readdirSync(dir);
	
	for (const commandDir of commandDirs) {
		const commandPath = join(dir, commandDir);
		const commandFiles = readdirSync(commandPath).filter(file => file.endsWith('.js'));

		for (const file of commandFiles) {
			const filePath = join(commandPath, file);
			const command = await import(filePath);
			
			if (command.default?.data) {
				client.slashCommands.set(command.default.data.name, command.default);
				console.log(`✅ Commande slash chargée: ${command.default.data.name} [${commandDir}]`);
			}
		}
	}
};

// Load events
const loadEvents = async (dir = './events/') => {
	if (!readdirSync(dir, { withFileTypes: true }).some(dirent => dirent.isDirectory())) {
		return;
	}
	
	const eventDirs = readdirSync(dir);
	
	for (const eventDir of eventDirs) {
		const eventPath = join(dir, eventDir);
		const eventFiles = readdirSync(eventPath).filter(file => file.endsWith('.js'));

		for (const file of eventFiles) {
			const filePath = join(eventPath, file);
			const event = await import(filePath);
			const eventName = file.split('.')[0];
			
			if (event.default) {
				client.on(eventName, event.default.bind(null, client));
				console.log(`✅ Event chargé: ${eventName}`);
			}
		}
	}
};

// Ready event
client.once('ready', () => {
	console.log(`🤖 Bot connecté en tant que ${client.user.tag}`);
	
	// Set presence
	client.user.setPresence({
		activities: [{ name: 'VScode', type: ActivityType.Streaming }],
		status: 'dnd'
	});
	
	// Register slash commands
	const commands = Array.from(client.slashCommands.values()).map(cmd => cmd.data);
	
	client.application.commands.set(commands)
		.then(() => console.log('✅ Commandes slash enregistrées'))
		.catch(console.error);
});

// Interaction handler
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.slashCommands.get(interaction.commandName);
	if (!command) return;

	try {
		// Check permissions
		const member = interaction.member;
		const roleIds = member.roles.cache.map(role => role.id);
		const userId = member.id;
		
		// Check if user has permission
		const hasAccess = 
			config.owner.includes(userId) ||
			hasPermission(userId, roleIds, 'admin') ||
			hasPermission(userId, roleIds, 'mod') ||
			hasPermission(userId, roleIds, 'owner') ||
			hasPermission(interaction.channelId, [], 'public');
		
		if (!hasAccess) {
			const errorEmbed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('❌ Permission refusée')
				.setDescription('Vous n\'avez pas la permission d\'utiliser cette commande.')
				.setTimestamp();
			
			return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
		}
		
		await command.execute(interaction, client);
	} catch (error) {
		console.error(`Erreur dans la commande ${interaction.commandName}:`, error);
		
		const errorEmbed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle('❌ Erreur')
			.setDescription('Une erreur est survenue lors de l\'exécution de cette commande.')
			.setTimestamp();
		
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
		} else {
			await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
		}
	}
});

// Load everything and start
const startBot = async () => {
	try {
		await loadSlashCommands();
		await loadEvents();
		
		// Login
		const token = process.env.TOKEN || config.token;
		if (!token) {
			console.error('❌ Token manquant. Ajoutez votre token dans config.json ou dans les variables d\'environnement.');
			return;
		}
		
		await client.login(token);
	} catch (error) {
		console.error('❌ Erreur au démarrage:', error);
	}
};

startBot();
