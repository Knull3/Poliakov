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
		const response = await axios.get(`https://discord.com/api/v9/guilds/${guild.id}/audit-logs?ilimit=1&action_type=10`, {
			headers: {
				Authorization: `Bot ${process.env.token}`
			}
		});

		if (response.data && response.data.audit_log_entries[0].user_id) {
			let perm = false;
			const userId = response.data.audit_log_entries[0].user_id;

			// Vérification des permissions
			const channelsCreateWl = await db.get(`channelscreatewl_${guild.id}`);
			const isOwnerMd = await db.get(`ownermd_${client.user.id}_${userId}`);
			const isWlMd = await db.get(`wlmd_${guild.id}_${userId}`);

			if (channelsCreateWl === null) {
				perm = client.user.id === userId || 
				       guild.ownerId === userId || 
				       client.config.owner.includes(userId) || 
				       isOwnerMd === true || 
				       isWlMd === true;
			}
			
			if (channelsCreateWl === true) {
				perm = client.user.id === userId || 
				       guild.ownerId === userId || 
				       client.config.owner.includes(userId) || 
				       isOwnerMd === true;
			}

			const channelsCreate = await db.get(`channelscreate_${guild.id}`);
			if (channelsCreate === true && !perm) {
				const raidlogId = await db.get(`${guild.id}.raidlog`);
				const raidlog = raidlogId ? guild.channels.cache.get(raidlogId) : null;
				const channelsCreateSanction = await db.get(`channelscreatesanction_${guild.id}`);

				if (channelsCreateSanction === "ban") {
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

						await axios({
							url: `https://discord.com/api/v9/channels/${channel.id}`,
							method: `DELETE`,
							headers: {
								Authorization: `Bot ${process.env.token}`
							}
						});

						if (raidlog) {
							await raidlog.send({ 
								embeds: [new EmbedBuilder()
									.setColor(color)
									.setDescription(`<@${userId}> a crée le salon \`${channel.name}\`, il a été **ban** !`)] 
							});
						}
					} catch (error) {
						await axios({
							url: `https://discord.com/api/v9/channels/${channel.id}`,
							method: `DELETE`,
							headers: {
								Authorization: `Bot ${process.env.token}`
							}
						});

						if (raidlog) {
							await raidlog.send({
								embeds: [new EmbedBuilder()
									.setColor(color)
									.setDescription(`<@${userId}> a crée le salon \`${channel.name}\`, mais il n'a pas pu être **ban** !`)]
							});
						}
					}
				} else if (channelsCreateSanction === "kick") {
					try {
						const member = guild.members.cache.get(userId);
						if (member) await member.kick();

						await axios({
							url: `https://discord.com/api/v9/channels/${channel.id}`,
							method: `DELETE`,
							headers: {
								Authorization: `Bot ${process.env.token}`
							}
						});

						if (raidlog) {
							await raidlog.send({
								embeds: [new EmbedBuilder()
									.setColor(color)
									.setDescription(`<@${userId}> a crée le salon \`${channel.name}\`, il a été **kick** !`)]
							});
						}
					} catch (error) {
						await axios({
							url: `https://discord.com/api/v9/channels/${channel.id}`,
							method: `DELETE`,
							headers: {
								Authorization: `Bot ${process.env.token}`
							}
						});

						if (raidlog) {
							await raidlog.send({
								embeds: [new EmbedBuilder()
									.setColor(color)
									.setDescription(`<@${userId}> a crée le salon \`${channel.name}\`, mais il n'a pas pu être **kick** !`)]
							});
						}
					}
				} else if (channelsCreateSanction === "derank") {
					try {
						const member = guild.members.cache.get(userId);
						if (member) await member.roles.set([]);

						await axios({
							url: `https://discord.com/api/v9/channels/${channel.id}`,
							method: `DELETE`,
							headers: {
								Authorization: `Bot ${process.env.token}`
							}
						});

						if (raidlog) {
							await raidlog.send({
								embeds: [new EmbedBuilder()
									.setColor(color)
									.setDescription(`<@${userId}> a crée le salon \`${channel.name}\`, il a été **derank** !`)]
							});
						}
					} catch (error) {
						await axios({
							url: `https://discord.com/api/v9/channels/${channel.id}`,
							method: `DELETE`,
							headers: {
								Authorization: `Bot ${process.env.token}`
							}
						});

						if (raidlog) {
							await raidlog.send({
								embeds: [new EmbedBuilder()
									.setColor(color)
									.setDescription(`<@${userId}> a crée le salon \`${channel.name}\`, mais il n'a pas pu être **derank** !`)]
							});
						}
					}
				}
			}
		}
	} catch (error) {
		console.error("Erreur dans l'événement channelCreate:", error);
	}
};
