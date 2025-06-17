import fs from 'fs';

const PERM_PATH = './data/permissions.json';

function getPermissions() {
  if (!fs.existsSync(PERM_PATH)) {
    fs.writeFileSync(PERM_PATH, JSON.stringify({ admin: [], mod: [], owner: [], public: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(PERM_PATH, 'utf-8'));
}

function hasPermission(userId, roleIds, type) {
  const perms = getPermissions();
  return (
    perms[type]?.includes(userId) ||
    roleIds.some(rid => perms[type]?.includes(rid))
  );
}

export { getPermissions, hasPermission };

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

function isPublicChannel(channelId, guildId) {
    return db.get(`channelpublic_${guildId}_${channelId}`) === true
}

module.exports = {
    checkPermissions,
    isPublicChannel
} 