const axios = require('axios');

async function testNFLStandings() {
  try {
    console.log('Test API ESPN NFL Standings...\n');
    
    const response = await axios.get('https://site.api.espn.com/apis/v2/sports/football/nfl/standings');
    
    console.log('Structure de la réponse:');
    console.log('Keys:', Object.keys(response.data));
    console.log('\n');
    
    if (response.data.children) {
      console.log('children:', response.data.children.length, 'éléments');
      console.log(JSON.stringify(response.data.children[0], null, 2).substring(0, 2000));
    }
    
    if (response.data.standings) {
      console.log('\nstandings:', response.data.standings.length, 'éléments');
      console.log(JSON.stringify(response.data.standings[0], null, 2).substring(0, 1500));
    }
    
    if (Array.isArray(response.data)) {
      console.log('\nLa réponse est un array de', response.data.length, 'éléments');
      console.log(JSON.stringify(response.data[0], null, 2).substring(0, 1500));
    }
    
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

testNFLStandings();
