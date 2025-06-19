// Polyfill for ReadableStream
require('web-streams-polyfill/dist/polyfill');

const { Client, GatewayIntentBits, Collection, ActivityType, EmbedBuilder, Partials } = require('discord.js');
const { readdirSync, readFileSync } = require('fs');
const path = require('path');
const { hasPermission } = require('./util/permissions.js');

// Liste des fichiers à ignorer
const IGNORED_FILES = [
	'util/embedButton/start.js',
	'commands/music/play.js',
	'commands/music/queue.js',
	'commands/music/skip.js',
	'commands/music/stop.js'
];

// Configuration
const config = JSON.parse(readFileSync('./config.json', 'utf-8'));

// Client setup
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.MessageContent,
		// Intents privilégiés - Nécessitent une activation dans le portail développeur Discord
		// GatewayIntentBits.GuildPresences, // Intent privilégié
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
	],
	partials: [
		Partials.Message,
		Partials.Channel,
		Partials.Reaction,
		Partials.User,
		Partials.GuildMember
	]
});

// Collections
client.slashCommands = new Collection();
client.config = config;
client.guildInvites = new Map(); // Ajout pour éviter les erreurs de référence
client.snipes = new Map(); // Collection pour stocker les messages supprimés
client.buttonHandlers = new Collection(); // Collection pour les gestionnaires de boutons

// Error handling
process.on('unhandledRejection', err => {
	console.error('Uncaught Promise Error:', err);
});

// Helper function to check if a file should be ignored
function shouldIgnoreFile(filePath) {
	return IGNORED_FILES.some(ignoredPath => filePath.includes(ignoredPath));
}

// Load slash commands
const loadSlashCommands = async (dir = './commands/') => {
	const commandDirs = readdirSync(dir);
	
	for (const commandDir of commandDirs) {
		// Ignorer le dossier music et utiliser musique à la place
		if (commandDir === 'music') continue;
		
		const commandPath = path.join(dir, commandDir);
		const commandFiles = readdirSync(commandPath)
			.filter(file => file.endsWith('.js') && !file.startsWith('!'));

		for (const file of commandFiles) {
			// Construire le chemin complet pour require
			const filePath = `./${path.join(commandPath, file)}`.replace(/\\/g, '/');
            
            // Ignorer les fichiers problématiques
            if (shouldIgnoreFile(filePath)) {
                console.log(`⚠️ Fichier ignoré: ${filePath}`);
                continue;
            }

			// Utiliser require avec le chemin relatif
			try {
				const command = require(filePath);
				
				if (command.data) {
					client.slashCommands.set(command.data.name, command);
					console.log(`✅ Commande slash chargée: ${command.data.name} [${commandDir}]`);
					
					// Initialiser les fonctionnalités supplémentaires si nécessaire
					if (command.setup) {
						command.setup(client);
					}
				}
			} catch (error) {
				console.error(`Erreur lors du chargement de la commande ${filePath}:`, error);
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
		const eventPath = path.join(dir, eventDir);
		
		// Vérifier si c'est un dossier
		if (!readdirSync(eventPath, { withFileTypes: true }).some(dirent => dirent.isFile())) {
			continue;
		}
		
		const eventFiles = readdirSync(eventPath).filter(file => file.endsWith('.js') && !file.startsWith('!'));

		for (const file of eventFiles) {
			// Construire le chemin complet pour require
			const filePath = `./${path.join(eventPath, file)}`.replace(/\\/g, '/');

            // Ignorer les fichiers problématiques
            if (shouldIgnoreFile(filePath)) {
                console.log(`⚠️ Fichier ignoré: ${filePath}`);
                continue;
            }

			try {
				const event = require(filePath);
				const eventName = file.split('.')[0];
				
				if (typeof event === 'function') {
					if (eventName === 'ready') {
						client.once(eventName, event.bind(null, client));
					} else {
						client.on(eventName, event.bind(null, client));
					}
					console.log(`✅ Event chargé: ${eventName} [${eventDir}]`);
				} else {
					console.warn(`⚠️ Event non chargé: ${eventName} - Ce n'est pas une fonction.`);
				}
			} catch (error) {
				console.error(`Erreur lors du chargement de l'événement ${filePath}:`, error);
			}
		}
	}
};

// Charge le gestionnaire de boutons spécial
const loadButtonHandler = () => {
	try {
		const buttonHandler = require('./events/rolemenu/clickButton.js');
		client.buttonHandlers.set('clickButton', buttonHandler);
		console.log('✅ Gestionnaire de boutons chargé');
	} catch (error) {
		console.error('Erreur lors du chargement du gestionnaire de boutons:', error);
	}
};

// Gestionnaire de messages supprimés pour la commande snipe
client.on('messageDelete', message => {
	if (message.author && message.author.bot) return;
	if (!message.content && !message.attachments.size) return;
	
	// Stocker le message supprimé
	client.snipes.set(message.channel.id, {
		content: message.content || 'Aucun contenu',
		author: message.author,
		image: message.attachments.first() ? message.attachments.first().proxyURL : null,
		timestamp: Date.now()
	});
});

// Ready event
client.once('ready', () => {
	console.log(`🤖 Bot connecté en tant que ${client.user.tag}`);
	console.log(`✅ Bot prêt: ${client.user.username}`);
	
	// Set presence - Streaming "Saa Devv"
	client.user.setPresence({
		activities: [{ 
			name: 'Saa Devv', 
			type: ActivityType.Streaming,
			url: 'https://twitch.tv/saadevv'  // URL Twitch requise pour le streaming
		}],
		status: 'online'
	});
	
	// Register slash commands
	const commands = Array.from(client.slashCommands.values()).map(cmd => cmd.data);
	
	client.application.commands.set(commands)
		.then(() => console.log('✅ Commandes slash enregistrées'))
		.catch(console.error);
});

// Interaction handler
client.on('interactionCreate', async interaction => {
	try {
		// Gérer les boutons
		if (interaction.isButton()) {
			const buttonHandler = client.buttonHandlers.get('clickButton');
			if (buttonHandler) {
				try {
					await buttonHandler(client, interaction);
				} catch (buttonError) {
					console.error(`Erreur dans le gestionnaire de bouton:`, buttonError);
					
					// Répondre uniquement si l'interaction n'a pas encore été traitée
					if (!interaction.replied && !interaction.deferred) {
						await interaction.reply({
							content: 'Une erreur est survenue lors du traitement de ce bouton.',
							ephemeral: true
						}).catch(e => console.error('Impossible de répondre au bouton:', e));
					}
				}
			}
			return;
		}
		
		// Gérer les commandes slash
		if (!interaction.isCommand()) return;

		const command = client.slashCommands.get(interaction.commandName);
		if (!command) return;

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
			try {
				return await interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setColor('#8B0000')
							.setTitle('❌ Permission refusée')
							.setDescription('Vous n\'avez pas la permission d\'utiliser cette commande.')
							.setTimestamp()
					], 
					ephemeral: true
				});
			} catch (permError) {
				console.error('Erreur lors de la réponse de permission:', permError);
				return;
			}
		}
		
		// Exécuter la commande
		await command.execute(interaction, client);
	} catch (error) {
		console.error(`Erreur dans l'interaction:`, error);
		
		// Ne pas essayer de répondre si l'erreur est une interaction inconnue
		if (error.code === 10062) {
			console.log('Interaction expirée, impossible de répondre');
			return;
		}
		
		// Essayer de répondre avec une erreur
		try {
			const errorEmbed = new EmbedBuilder()
				.setColor('#8B0000')
				.setTitle('❌ Erreur')
				.setDescription('Une erreur est survenue lors de l\'exécution de cette commande.')
				.setTimestamp();
			
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					embeds: [errorEmbed],
					ephemeral: true
				}).catch(() => console.log('Impossible d\'envoyer followUp'));
			} else {
				await interaction.reply({
					embeds: [errorEmbed],
					ephemeral: true
				}).catch(() => console.log('Impossible de répondre'));
			}
		} catch (replyError) {
			console.error('Erreur lors de la réponse à l\'interaction:', replyError);
		}
	}
});

// Keep Alive pour les hébergeurs comme Replit
try {
	require('./keep_alive.js');
	console.log('✅ Keep Alive activé');
} catch (error) {
	console.log('ℹ️ Keep Alive non utilisé');
}

// Load everything and start
const startBot = async () => {
	try {
		await loadSlashCommands();
		await loadEvents();
		loadButtonHandler();
		
		// Login
		const token = process.env.token || process.env.TOKEN;
		if (!token) {
			console.error('❌ Token manquant. Ajoutez votre token dans les variables d\'environnement (process.env.token).');
			return;
		}
		
		await client.login(token);
	} catch (error) {
		console.error('❌ Erreur au démarrage:', error);
	}
};

startBot();
