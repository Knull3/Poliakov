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