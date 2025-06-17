import { readdirSync } from 'fs';
import Discord from 'discord.js';
import logs from 'discord-logs';
import disbut from 'discord-buttons';
import tempo from './gestion/tempo.js';
import config from '../config.json' assert { type: 'json' };

const login = (client) => {
    logs(client);
    disbut(client);
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

export { login };
