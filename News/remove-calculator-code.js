// Script pour simplifier index.js en retirant le code standings-calculator
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.js');
const content = fs.readFileSync(indexPath, 'utf8');
const lines = content.split('\n');

// Trouver les lignes à supprimer (de "// ==================== STANDINGS CALCULATOR" jusqu'à "// ==================== FIN STANDINGS CALCULATOR")
let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('// ==================== STANDINGS CALCULATOR (intégré) ====================')) {
    startIdx = i;
  }
  if (lines[i].includes('// ==================== FIN STANDINGS CALCULATOR ====================')) {
    endIdx = i;
    break;
  }
}

if (startIdx !== -1 && endIdx !== -1) {
  console.log(`✓ Trouvé bloc standings-calculator: lignes ${startIdx + 1} à ${endIdx + 1}`);
  
  // Supprimer les lignes
  lines.splice(startIdx, endIdx - startIdx + 1);
  
  // Écrire le fichier modifié
  fs.writeFileSync(indexPath, lines.join('\n'));
  console.log(`✅ Code standings-calculator supprimé (${endIdx - startIdx + 1} lignes)`);
  console.log(`📝 Nouveau fichier: ${lines.length} lignes`);
} else {
  console.error('❌ Impossible de trouver les marqueurs du bloc');
}
