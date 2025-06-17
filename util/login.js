const { readdirSync } = require('fs');
const Discord = require('discord.js');
const logs = require('discord-logs');
// Désactivé car incompatible avec discord.js v14
// const disbut = require('discord-buttons');
const tempo = require('./gestion/tempo.js');
const config = require('../config.json');

const login = (client) => {
    logs(client);
    // Désactivé car incompatible avec discord.js v14
    // disbut(client);
    tempo(client);

    client.config = config;
    client.cooldown = new Array();
    client.interaction = {};
    client.guildInvites = new Map();
    client.queue = new Map();
    client.commands = new Discord.Collection();
    client.aliases = new Discord.Collection();
    client.snipes = new Map();
    client.inter = new Array();

    client.login(process.env.token);
};

module.exports = { login };
