const axios = require('axios');
const db = require("../../util/db.js");
const { EmbedBuilder } = require("discord.js");
const ms = require("ms");

module.exports = async (client, channel) => {
	const guild = channel.guild;
	if (!guild) return;

	try {
		const color = await db.get(`color_${guild.id}`) || client.config.color;

		// -- Audit Logs
		const response = await axios.get(`https://discord.com/api/v9/guilds/${guild.id}/audit-logs?ilimit=1&action_type=12`, {
			headers: {
				Authorization: `Bot ${process.env.token}`
			}
		});

		if (response.data && response.data.audit_log_entries[0].user_id) {
			let perm = false;
			const userId = response.data.audit_log_entries[0].user_id;

			// Vérification des permissions
			const channelsDeleteWl = await db.get(`channelsdeletewl_${guild.id}`);
			const isOwnerMd = await db.get(`ownermd_${client.user.id}_${userId}`);
			const isWlMd = await db.get(`wlmd_${guild.id}_${userId}`);

			if (channelsDeleteWl === null) {
				perm = client.user.id === userId || 
				       guild.ownerId === userId || 
				       client.config.owner.includes(userId) || 
				       isOwnerMd === true || 
				       isWlMd === true;
			}
			
			if (channelsDeleteWl === true) {
				perm = client.user.id === userId || 
				       guild.ownerId === userId || 
				       client.config.owner.includes(userId) || 
				       isOwnerMd === true;
			}

			const channelsDelete = await db.get(`channelsdelete_${guild.id}`);
			if (channelsDelete === true && !perm) {
				const raidlogId = await db.get(`${guild.id}.raidlog`);
				const raidlog = raidlogId ? guild.channels.cache.get(raidlogId) : null;
				const channelsDeleteSanction = await db.get(`channelsdeletesanction_${guild.id}`);

				if (channelsDeleteSanction === "ban") {
					try {
						await axios({
							url: `https://discord.com/api/v9/guilds/${guild.id}/bans/${userId}`,
							method: 'PUT',
							headers: {
								Authorization: `Bot ${process.env.token}`
							},
							data: {
								delete_message_days: '1',
								reason: 'Antichannel'
							}
						});

						if (raidlog) {
							await raidlog.send({ 
								embeds: [new EmbedBuilder()
									.setColor(color)
									.setDescription(`<@${userId}> a supprimé le salon \`${channel.name}\`, il a été **ban** !`)] 
							});
						}
					} catch (error) {
						if (raidlog) {
							await raidlog.send({
								embeds: [new EmbedBuilder()
									.setColor(color)
									.setDescription(`<@${userId}> a supprimé le salon \`${channel.name}\`, mais il n'a pas pu être **ban** !`)]
							});
						}
					}
				} else if (channelsDeleteSanction === "kick") {
					try {
						const member = guild.members.cache.get(userId);
						if (member) await member.kick();

						if (raidlog) {
							await raidlog.send({
								embeds: [new EmbedBuilder()
									.setColor(color)
									.setDescription(`<@${userId}> a supprimé le salon \`${channel.name}\`, il a été **kick** !`)]
							});
						}
					} catch (error) {
						if (raidlog) {
							await raidlog.send({
								embeds: [new EmbedBuilder()
									.setColor(color)
									.setDescription(`<@${userId}> a supprimé le salon \`${channel.name}\`, mais il n'a pas pu être **kick** !`)]
							});
						}
					}
				} else if (channelsDeleteSanction === "derank") {
					try {
						const member = guild.members.cache.get(userId);
						if (member) await member.roles.set([]);

						if (raidlog) {
							await raidlog.send({
								embeds: [new EmbedBuilder()
									.setColor(color)
									.setDescription(`<@${userId}> a supprimé le salon \`${channel.name}\`, il a été **derank** !`)]
							});
						}
					} catch (error) {
						if (raidlog) {
							await raidlog.send({
								embeds: [new EmbedBuilder()
									.setColor(color)
									.setDescription(`<@${userId}> a supprimé le salon \`${channel.name}\`, mais il n'a pas pu être **derank** !`)]
							});
						}
					}
				}
			}
		}
	} catch (error) {
		console.error("Erreur dans l'événement channelDelete:", error);
	}
};
