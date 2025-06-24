const { QuickDB } = require("quick.db");
const db = new QuickDB();

// Wrapper pour la compatibilité avec l'ancienne API de quick.db
module.exports = {
    // Méthodes de base
    get: async (key) => {
        try {
            return await db.get(key);
        } catch (error) {
            console.error(`Erreur lors de l'accès à la base de données (get): ${error.message}`);
            return null;
        }
    },
    
    set: async (key, value) => {
        try {
            return await db.set(key, value);
        } catch (error) {
            console.error(`Erreur lors de l'accès à la base de données (set): ${error.message}`);
            return null;
        }
    },
    
    add: async (key, value) => {
        try {
            const currentValue = await db.get(key) || 0;
            return await db.set(key, currentValue + value);
        } catch (error) {
            console.error(`Erreur lors de l'accès à la base de données (add): ${error.message}`);
            return null;
        }
    },
    
    subtract: async (key, value) => {
        try {
            const currentValue = await db.get(key) || 0;
            return await db.set(key, currentValue - value);
        } catch (error) {
            console.error(`Erreur lors de l'accès à la base de données (subtract): ${error.message}`);
            return null;
        }
    },
    
    push: async (key, value) => {
        try {
            const array = await db.get(key) || [];
            array.push(value);
            return await db.set(key, array);
        } catch (error) {
            console.error(`Erreur lors de l'accès à la base de données (push): ${error.message}`);
            return null;
        }
    },
    
    delete: async (key) => {
        try {
            return await db.delete(key);
        } catch (error) {
            console.error(`Erreur lors de l'accès à la base de données (delete): ${error.message}`);
            return null;
        }
    },
    
    has: async (key) => {
        try {
            return await db.has(key);
        } catch (error) {
            console.error(`Erreur lors de l'accès à la base de données (has): ${error.message}`);
            return false;
        }
    },
    
    all: async () => {
        try {
            const data = await db.all();
            // Convertir au format de l'ancienne API
            return data.map(entry => ({
                ID: entry.id,
                data: entry.value
            }));
        } catch (error) {
            console.error(`Erreur lors de l'accès à la base de données (all): ${error.message}`);
            return [];
        }
    },
    
    fetch: async (key) => {
        try {
            return await db.get(key);
        } catch (error) {
            console.error(`Erreur lors de l'accès à la base de données (fetch): ${error.message}`);
            return null;
        }
    }
}; 