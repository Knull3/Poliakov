import { SlashCommandBuilder } from 'discord.js'
const { hasPermission, isPublicChannel } = require('../../util/permissions.js')

export default {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Afficher la latence du bot'),
	
	async execute(interaction, client) {
		await interaction.reply({ content: `🏓 Pong ! Latence API : ${client.ws.ping}ms`, ephemeral: true });
	}
}
