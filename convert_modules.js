const fs = require('fs');
const path = require('path');

// Fonction pour parcourir récursivement les répertoires
function walkSync(dir, callback) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filepath = path.join(dir, file);
    const stats = fs.statSync(filepath);
    if (stats.isDirectory()) {
      walkSync(filepath, callback);
    } else if (stats.isFile()) {
      callback(filepath);
    }
  });
}

// Fonction pour convertir un fichier de ES modules à CommonJS
function convertFile(filePath) {
  if (!filePath.endsWith('.js')) return;
  
  console.log(`Conversion de ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Vérifier si le fichier utilise ES modules
  if (content.includes('export default') || content.includes('import ')) {
    // Convertir import ... from ... en const ... = require(...)
    content = content.replace(/import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g, 'const {$1} = require("$2")');
    content = content.replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g, 'const $1 = require("$2")');
    
    // Convertir export default en module.exports =
    content = content.replace(/export\s+default/, 'module.exports =');
    
    // Convertir les autres exports
    content = content.replace(/export\s+const\s+(\w+)/g, 'const $1');
    content = content.replace(/export\s+function/g, 'function');
    content = content.replace(/export\s+{([^}]+)}/g, 'module.exports = {$1}');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fichier converti: ${filePath}`);
  }
}

// Parcourir tous les fichiers dans le répertoire des commandes
console.log('Début de la conversion des fichiers...');
walkSync('./commands', convertFile);
console.log('Conversion terminée!'); 