const db = require('quick.db')

function checkPermissions(member, client) {
    let perm = 0
    
    // Vérification des rôles
    member.roles.cache.forEach(role => {
        if (db.get(`modsp_${member.guild.id}_${role.id}`)) perm = Math.max(perm, 1)
        if (db.get(`admin_${member.guild.id}_${role.id}`)) perm = Math.max(perm, 2)
        if (db.get(`ownerp_${member.guild.id}_${role.id}`)) perm = Math.max(perm, 3)
    })
    
    // Vérification des permissions spéciales
    if (db.get(`ownermd_${client.user.id}_${member.id}`) === true) perm = Math.max(perm, 4)
    if (client.config.owner.includes(member.id)) perm = Math.max(perm, 5)
    
    return perm
}

function hasPermission(member, client, requiredLevel) {
    const perm = checkPermissions(member, client)
    return perm >= requiredLevel
}

function isPublicChannel(channelId, guildId) {
    return db.get(`channelpublic_${guildId}_${channelId}`) === true
}

module.exports = {
    checkPermissions,
    hasPermission,
    isPublicChannel
} 