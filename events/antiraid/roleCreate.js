const axios = require('axios');
const db = require("../../util/db.js");
const { EmbedBuilder } = require("discord.js");
const ms = require("ms");

module.exports = async (client, role) => {
	const guild = role.guild;
	if (!guild) return;

	try {
		const color = await db.get(`color_${guild.id}`) || client.config.color;
		
		// Audit logs
		const response = await axios.get(`https://discord.com/api/v9/guilds/${guild.id}/audit-logs?ilimit=1&action_type=30`, {
			headers: {
				Authorization: `Bot ${process.env.token}`
			}
		});

		if (response.data && response.data.audit_log_entries[0].user_id) {
			const userId = response.data.audit_log_entries[0].user_id;
			const raidlogId = await db.get(`${guild.id}.raidlog`);
			const raidlog = raidlogId ? guild.channels.cache.get(raidlogId) : null;
			
			// Vérification des permissions
			let perm = false;
			const rolesCreateWl = await db.get(`rolescreatewl_${guild.id}`);
			const isOwnerMd = await db.get(`ownermd_${client.user.id}_${userId}`);
			const isWlMd = await db.get(`wlmd_${guild.id}_${userId}`);
			
			if (rolesCreateWl === null) {
				perm = client.user.id === userId || 
				       guild.ownerId === userId || 
				       client.config.owner.includes(userId) || 
				       isOwnerMd === true || 
				       isWlMd === true;
			}
			
			if (rolesCreateWl === true) {
				perm = client.user.id === userId || 
				       guild.ownerId === userId || 
				       client.config.owner.includes(userId) || 
				       isOwnerMd === true;
			}
			
			const rolesCreate = await db.get(`rolescreate_${guild.id}`);
			if (rolesCreate === true && !perm) {
				const rolesCreateSanction = await db.get(`rolescreatesanction_${guild.id}`);
				
				if (rolesCreateSanction === "ban") {
					try {
						await axios({
							url: `https://discord.com/api/v9/guilds/${guild.id}/bans/${userId}`,
							method: 'PUT',
							headers: {
								Authorization: `Bot ${process.env.token}`
							},
							data: {
								delete_message_days: '1',
								reason: 'Antirole'
							}
						});
						
						await axios({
							url: `https://discord.com/api/v9/guilds/${guild.id}/roles/${role.id}`,
							method: "DELETE",
							headers: {
								Authorization: `Bot ${process.env.token}`
							}
						});
						
						if (raidlog) {
							await raidlog.send({
								embeds: [
									new EmbedBuilder()
										.setColor(color)
										.setDescription(`<@${userId}> a crée le rôle \`${role.name}\`, il a été **ban** !`)
								]
							});
						}
					} catch (error) {
						try {
							await axios({
								url: `https://discord.com/api/v9/guilds/${guild.id}/roles/${role.id}`,
								method: "DELETE",
								headers: {
									Authorization: `Bot ${process.env.token}`
								}
							});
							
							if (raidlog) {
								await raidlog.send({
									embeds: [
										new EmbedBuilder()
											.setColor(color)
											.setDescription(`<@${userId}> a crée le rôle \`${role.name}\`, mais il n'a pas pu être **ban** !`)
									]
								});
							}
						} catch (err) {
							console.error("Erreur lors de la suppression du rôle:", err);
						}
					}
				} else if (rolesCreateSanction === "kick") {
					try {
						const member = guild.members.cache.get(userId);
						if (member) await member.kick();
						
						await axios({
							url: `https://discord.com/api/v9/guilds/${guild.id}/roles/${role.id}`,
							method: "DELETE",
							headers: {
								Authorization: `Bot ${process.env.token}`
							}
						});
						
						if (raidlog) {
							await raidlog.send({
								embeds: [
									new EmbedBuilder()
										.setColor(color)
										.setDescription(`<@${userId}> a crée le rôle \`${role.name}\`, il a été **kick** !`)
								]
							});
						}
					} catch (error) {
						try {
							await axios({
								url: `https://discord.com/api/v9/guilds/${guild.id}/roles/${role.id}`,
								method: "DELETE",
								headers: {
									Authorization: `Bot ${process.env.token}`
								}
							});
							
							if (raidlog) {
								await raidlog.send({
									embeds: [
										new EmbedBuilder()
											.setColor(color)
											.setDescription(`<@${userId}> a crée le rôle \`${role.name}\`, mais il n'a pas pu être **kick** !`)
									]
								});
							}
						} catch (err) {
							console.error("Erreur lors de la suppression du rôle:", err);
						}
					}
				} else if (rolesCreateSanction === "derank") {
					try {
						const member = guild.members.cache.get(userId);
						if (member) await member.roles.set([]);
						
						await axios({
							url: `https://discord.com/api/v9/guilds/${guild.id}/roles/${role.id}`,
							method: "DELETE",
							headers: {
								Authorization: `Bot ${process.env.token}`
							}
						});
						
						if (raidlog) {
							await raidlog.send({
								embeds: [
									new EmbedBuilder()
										.setColor(color)
										.setDescription(`<@${userId}> a crée le rôle \`${role.name}\`, il a été **derank** !`)
								]
							});
						}
					} catch (error) {
						try {
							await axios({
								url: `https://discord.com/api/v9/guilds/${guild.id}/roles/${role.id}`,
								method: "DELETE",
								headers: {
									Authorization: `Bot ${process.env.token}`
								}
							});
							
							if (raidlog) {
								await raidlog.send({
									embeds: [
										new EmbedBuilder()
											.setColor(color)
											.setDescription(`<@${userId}> a crée le rôle \`${role.name}\`, mais il n'a pas pu être **derank** !`)
									]
								});
							}
						} catch (err) {
							console.error("Erreur lors de la suppression du rôle:", err);
						}
					}
				}
			}
		}
	} catch (error) {
		console.error("Erreur dans l'événement roleCreate:", error);
	}
};
