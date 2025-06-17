const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js')
const keep_alive = require('./keep_alive.js')
const { Player } = require('discord-player')
const { YouTubeExtractor } = require('@discord-player/extractor')
const { joinVoiceChannel } = require('@discordjs/voice')
const {
	readdirSync
} = require("fs")
const db = require('quick.db')
const ms = require("ms")
const { EmbedBuilder } = require('discord.js')
const {
	login
} = require("./util/login.js");

// Collections pour les commandes
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
})

// Configuration
client.config = require('./config.json')
client.db = db

// Player setup
const player = new Player(client, {
	ytdlOptions: {
		quality: "highestaudio",
		highWaterMark: 1 << 25
	}
})

client.player = player

// Extractor setup
player.extractors.register(YouTubeExtractor, {})

// Error handling
process.on("unhandledRejection", err => {
	if (err.message) return
	console.error("Uncaught Promise Error: ", err);
})

// Chargement des commandes slash
const loadSlashCommands = (dir = "./commands/") => {
	readdirSync(dir).forEach(dirs => {
		const commands = readdirSync(`${dir}/${dirs}/`).filter(files => files.endsWith(".js"));

		for (const file of commands) {
			const command = require(`${dir}/${dirs}/${file}`);
			if (command.data) {
				client.slashCommands.set(command.data.name, command);
				console.log(`> Commande Slash Charger ${command.data.name} [${dirs}]`)
			}
		};
	});
};

// Chargement des events
const loadEvents = (dir = "./events/") => {
	readdirSync(dir).forEach(dirs => {
		const events = readdirSync(`${dir}/${dirs}/`).filter(files => files.endsWith(".js"));

		for (const event of events) {
			const evt = require(`${dir}/${dirs}/${event}`);
			const evtName = event.split(".")[0];
			client.on(evtName, evt.bind(null, client));
			console.log(`> Event Charger ${evtName}`)
		};
	});
};

// Event ready avec statut
client.once('ready', () => {
	console.log(`Bot connecté en tant que ${client.user.tag}`)
	
	// Statut "stream VScode"
	client.user.setActivity('VScode', { type: ActivityType.Streaming })
	
	// Enregistrement des commandes slash
	const commands = Array.from(client.slashCommands.values()).map(cmd => cmd.data)
	
	client.application.commands.set(commands)
		.then(() => console.log('Commandes slash enregistrées'))
		.catch(console.error)
})

// Interaction handler
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return

	const command = client.slashCommands.get(interaction.commandName)
	if (!command) return

	try {
		await command.execute(interaction, client)
	} catch (error) {
		console.error(error)
		const errorEmbed = new EmbedBuilder()
			.setColor('#8B0000')
			.setTitle('Erreur')
			.setDescription('Une erreur est survenue lors de l\'exécution de cette commande.')
			.setTimestamp()
		
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ embeds: [errorEmbed], ephemeral: true })
		} else {
			await interaction.reply({ embeds: [errorEmbed], ephemeral: true })
		}
	}
})

loadEvents()
loadSlashCommands()

login(client)
