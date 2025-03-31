const Discord = require('discord.js');
const keep_alive = require('./keep_alive.js');
const { readdirSync } = require('fs');
const db = require('quick.db');
const ms = require('ms');
const { MessageEmbed } = require('discord.js');
const { login } = require('./util/login.js');

const client = new Discord.Client({
    fetchAllMembers: true,
    partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_PRESENCES', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES'],
    intents: [
        Discord.Intents.FLAGS.DIRECT_MESSAGES,
        Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Discord.Intents.FLAGS.DIRECT_MESSAGE_TYPING,
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_BANS,
        Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Discord.Intents.FLAGS.GUILD_INTEGRATIONS,
        Discord.Intents.FLAGS.GUILD_INVITES,
        Discord.Intents.FLAGS.GUILD_MEMBERS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING,
        Discord.Intents.FLAGS.GUILD_PRESENCES,
        Discord.Intents.FLAGS.GUILD_VOICE_STATES,
        Discord.Intents.FLAGS.GUILD_WEBHOOKS,
    ]
});

client.commands = new Discord.Collection();
client.slashCommands = new Discord.Collection();

login(client);

process.on('unhandledRejection', err => {
    if (err.message) return;
    console.error('Uncaught Promise Error: ', err);
});

const loadCommands = (dir = './commands/') => {
    readdirSync(dir).forEach(dirs => {
        const commands = readdirSync(`${dir}/${dirs}/`).filter(files => files.endsWith('.js'));
        for (const file of commands) {
            const getFileName = require(`${dir}/${dirs}/${file}`);
            client.commands.set(getFileName.name, getFileName);
            
            if (getFileName.data) {
                client.slashCommands.set(getFileName.data.name, getFileName);
            }
            console.log(`> Commande Chargée ${getFileName.name} [${dirs}]`);
        }
    });
};

const loadEvents = (dir = './events/') => {
    readdirSync(dir).forEach(dirs => {
        const events = readdirSync(`${dir}/${dirs}/`).filter(files => files.endsWith('.js'));
        for (const event of events) {
            const evt = require(`${dir}/${dirs}/${event}`);
            const evtName = event.split('.')[0];
            client.on(evtName, evt.bind(null, client));
            console.log(`> Event Chargé ${evtName}`);
        }
    });
};

client.on('ready', async () => {
    const guilds = client.guilds.cache.map(guild => guild.id);
    for (const guildId of guilds) {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) continue;
        await guild.commands.set([...client.slashCommands.values()].map(cmd => cmd.data));
    }
    console.log('> Commandes en slash enregistrées !');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Une erreur est survenue.', ephemeral: true });
    }
});

loadEvents();
loadCommands();
