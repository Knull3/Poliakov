const axios = require('axios');
const db = require("../../util/db")
const {
	MessageEmbed
} = require("discord.js");
const ms = require("ms")

module.exports = async (client, role) => {
	const guild = role.guild
	const color = await db.get(`color_${guild.id}`) === null ? client.config.color : await db.get(`color_${guild.id}`)

	// -- Audit Logs
	axios.get(`https://discord.com/api/v9/guilds/${guild.id}/audit-logs?ilimit=1&action_type=32`, {
		headers: {
			Authorization: `Bot ${process.env.token}`
		}
	}).then(async response => {
		const raidlog = guild.channels.cache.get(await db.get(`${guild.id}.raidlog`))
		if (response.data && response.data.audit_log_entries[0].user_id) {
			let perm = ""
			if (client.user.id === response.data.audit_log_entries[0].user_id) return undefined
			if (await db.get(`rolesdelwl_${guild.id}`) === null) perm = client.user.id === response.data.audit_log_entries[0].user_id || guild.owner.id === response.data.audit_log_entries[0].user_id || client.config.owner.includes(response.data.audit_log_entries[0].user_id) || await db.get(`ownermd_${client.user.id}_${response.data.audit_log_entries[0].user_id}`) === true || await db.get(`wlmd_${guild.id}_${response.data.audit_log_entries[0].user_id}`) === true
			if (await db.get(`rolesdelwl_${guild.id}`) === true) perm = client.user.id === response.data.audit_log_entries[0].user_id || guild.owner.id === response.data.audit_log_entries[0].user_id || client.config.owner.includes(response.data.audit_log_entries[0].user_id) || await db.get(`ownermd_${client.user.id}_${response.data.audit_log_entries[0].user_id}`) === true
			if (await db.get(`rolesdel_${guild.id}`) === true && !perm) {
				if (await db.get(`rolesdelsanction_${guild.id}`) === "ban") {


					axios({
						url: `https://discord.com/api/v9/guilds/${guild.id}/bans/${response.data.audit_log_entries[0].user_id}`,
						method: 'PUT',
						headers: {
							Authorization: `bot ${process.env.token}`
						},
						data: {
							delete_message_days: '1',
							reason: 'AntiRoleDelete'
						}
					}).then(() => {
						role.guild.roles.create({
							data: {
								name: role.name,
								color: role.hexColor,
								permissions: role.permissions,
								hoist: role.hoist,
								mentionable: role.mentionable,
								position: role.rawPosition,
								highest: role.highest,
								reason: `AntiRoleDelete`
							}

						})
						if (raidlog) return raidlog.send(new MessageEmbed().setColor(color).setDescription(`<@${response.data.audit_log_entries[0].user_id}> a supprimé le rôle \`${role.name}\`, il a été **ban** !`))
					}).catch(() => {
						role.guild.roles.create({
							data: {
								name: role.name,
								color: role.hexColor,
								permissions: role.permissions,
								hoist: role.hoist,
								mentionable: role.mentionable,
								position: role.rawPosition,
								highest: role.highest,
								reason: `AntiRoleDelete`
							}

						})
						if (raidlog) return raidlog.send(new MessageEmbed().setColor(color).setDescription(`<@${response.data.audit_log_entries[0].user_id}> a supprimé le rôle \`${role.name}\`, mais il n'a pas pu être **ban** !`))

					})
				} else if (await db.get(`rolesdelsanction_${guild.id}`) === "kick") {
					guild.members.cache.get(response.data.audit_log_entries[0].user_id).kick().then(() => {
						role.guild.roles.create({
							data: {
								name: role.name,
								color: role.hexColor,
								permissions: role.permissions,
								hoist: role.hoist,
								mentionable: role.mentionable,
								position: role.rawPosition,
								highest: role.highest,
								reason: `AntiRoleDelete`
							}

						})
						if (raidlog) return raidlog.send(new MessageEmbed().setColor(color).setDescription(`<@${response.data.audit_log_entries[0].user_id}> a supprimé le rôle \`${role.name}\`, il a été **kick** !`))
					}).catch(() => {
						role.guild.roles.create({
							data: {
								name: role.name,
								color: role.hexColor,
								permissions: role.permissions,
								hoist: role.hoist,
								mentionable: role.mentionable,
								position: role.rawPosition,
								highest: role.highest,
								reason: `AntiRoleDelete`
							}

						})
						if (raidlog) return raidlog.send(new MessageEmbed().setColor(color).setDescription(`<@${response.data.audit_log_entries[0].user_id}> a supprimé le rôle \`${role.name}\`, mais il n'a pas pu être **kick** !`))
					})
				} else if (await db.get(`rolesdelsanction_${guild.id}`) === "derank") {

					guild.members.cache.get(response.data.audit_log_entries[0].user_id).roles.set([]).then(() => {

						role.guild.roles.create({
							data: {
								name: role.name,
								color: role.hexColor,
								permissions: role.permissions,
								hoist: role.hoist,
								mentionable: role.mentionable,
								position: role.rawPosition,
								highest: role.highest,
								reason: `AntiRoleDelete`
							}

						})
						if (raidlog) return raidlog.send(new MessageEmbed().setColor(color).setDescription(`<@${response.data.audit_log_entries[0].user_id}> a supprimé le rôle \`${role.name}\`, il a été **derank** !`))
					}).catch(() => {
						role.guild.roles.create({
							data: {
								name: role.name,
								color: role.hexColor,
								permissions: role.permissions,
								hoist: role.hoist,
								mentionable: role.mentionable,
								position: role.rawPosition,
								highest: role.highest,
								reason: `AntiRoleDelete`
							}

						})
						if (raidlog) return raidlog.send(new MessageEmbed().setColor(color).setDescription(`<@${response.data.audit_log_entries[0].user_id}> a supprimé le rôle \`${role.name}\`, mais il n'a pas pu être **derank** !`))
					})
				}


			}

		}

	});


}
