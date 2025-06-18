const { QuickDB } = require("quick.db");
const db = new QuickDB();

// Wrapper pour la compatibilité avec l'ancienne API de quick.db
module.exports = {
    // Méthodes de base
    get: async (key) => {
        return await db.get(key);
    },
    
    set: async (key, value) => {
        return await db.set(key, value);
    },
    
    add: async (key, value) => {
        const currentValue = await db.get(key) || 0;
        return await db.set(key, currentValue + value);
    },
    
    subtract: async (key, value) => {
        const currentValue = await db.get(key) || 0;
        return await db.set(key, currentValue - value);
    },
    
    push: async (key, value) => {
        const array = await db.get(key) || [];
        array.push(value);
        return await db.set(key, array);
    },
    
    delete: async (key) => {
        return await db.delete(key);
    },
    
    has: async (key) => {
        return await db.has(key);
    },
    
    all: async () => {
        const data = await db.all();
        // Convertir au format de l'ancienne API
        return data.map(entry => ({
            ID: entry.id,
            data: entry.value
        }));
    },
    
    fetch: async (key) => {
        return await db.get(key);
    }
}; 