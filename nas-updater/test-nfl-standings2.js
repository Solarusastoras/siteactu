const axios = require('axios');

async function testNFLStandings() {
  try {
    const response = await axios.get('https://site.api.espn.com/apis/v2/sports/football/nfl/standings');
    
    const afc = response.data.children[0];
    console.log('\n=== AFC ===');
    console.log('Divisions:', afc.standings.entries.length, 'équipes');
    
    // Première équipe en détail
    const firstTeam = afc.standings.entries[0];
    console.log('\nPremière équipe:');
    console.log('- Nom:', firstTeam.team.displayName);
    console.log('- Stats disponibles:', firstTeam.stats ? firstTeam.stats.length : 0);
    
    if (firstTeam.stats) {
      console.log('\nStats de la première équipe:');
      firstTeam.stats.forEach(stat => {
        console.log(`  ${stat.name} (${stat.abbreviation}): ${stat.displayValue || stat.value}`);
      });
    }
    
    console.log('\n\nToutes les équipes AFC:');
    afc.standings.entries.forEach(entry => {
      const wins = entry.stats?.find(s => s.name === 'wins')?.value || 0;
      const losses = entry.stats?.find(s => s.name === 'losses')?.value || 0;
      const ties = entry.stats?.find(s => s.name === 'ties')?.value || 0;
      console.log(`${entry.team.displayName}: ${wins}-${losses}-${ties}`);
    });
    
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

testNFLStandings();
