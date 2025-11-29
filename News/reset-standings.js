// reset-standings.js
// Script pour réinitialiser les standings aux valeurs initiales

const fs = require('fs').promises;
const path = require('path');

const nhlInitial = require('./nhl-initial-standings');
const nbaInitial = require('./nba-initial-standings');
const nflInitial = require('./nfl-initial-standings');

const FILES_TO_DELETE = [
  'output/nhl-live-standings.json',
  'output/nba-live-standings.json',
  'output/nfl-live-standings.json',
  'output/nhl-processed-matches.json',
  'output/nba-processed-matches.json',
  'output/nfl-processed-matches.json'
];

async function resetStandings() {
  console.log('🔄 Réinitialisation des standings...\n');
  
  // Supprimer les fichiers existants
  for (const file of FILES_TO_DELETE) {
    const filePath = path.join(__dirname, file);
    try {
      await fs.unlink(filePath);
      console.log(`✓ Supprimé: ${file}`);
    } catch (error) {
      console.log(`  ${file} n'existe pas (OK)`);
    }
  }
  
  // Créer les standings initiaux
  const standingsPath = {
    nhl: path.join(__dirname, 'output', 'nhl-live-standings.json'),
    nba: path.join(__dirname, 'output', 'nba-live-standings.json'),
    nfl: path.join(__dirname, 'output', 'nfl-live-standings.json')
  };
  
  await fs.writeFile(standingsPath.nhl, JSON.stringify(nhlInitial, null, 2));
  console.log('\n✓ NHL réinitialisé');
  
  await fs.writeFile(standingsPath.nba, JSON.stringify(nbaInitial, null, 2));
  console.log('✓ NBA réinitialisé');
  
  await fs.writeFile(standingsPath.nfl, JSON.stringify(nflInitial, null, 2));
  console.log('✓ NFL réinitialisé');
  
  // Créer les fichiers de matchs traités vides
  const processedPath = {
    nhl: path.join(__dirname, 'output', 'nhl-processed-matches.json'),
    nba: path.join(__dirname, 'output', 'nba-processed-matches.json'),
    nfl: path.join(__dirname, 'output', 'nfl-processed-matches.json')
  };
  
  await fs.writeFile(processedPath.nhl, JSON.stringify([], null, 2));
  await fs.writeFile(processedPath.nba, JSON.stringify([], null, 2));
  await fs.writeFile(processedPath.nfl, JSON.stringify([], null, 2));
  console.log('✓ Fichiers de tracking créés');
  
  console.log('\n✅ Réinitialisation terminée !');
  console.log('Les standings repartiront des valeurs du 27 novembre 2025');
  console.log('Vous pouvez maintenant redémarrer le processus (pm2 restart sports-updater)');
}

resetStandings().catch(console.error);
