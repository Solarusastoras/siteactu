const axios = require('axios');

async function testLigue1Dates() {
  const url = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/scoreboard';
  const today = new Date();
  
  console.log('Test récupération matchs Ligue 1 sur plusieurs jours:\n');
  
  for (let i = -2; i <= 4; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    
    try {
      const response = await axios.get(`${url}?dates=${dateStr}`, { timeout: 10000 });
      const events = response.data?.events || [];
      console.log(`${date.toLocaleDateString('fr-FR')}: ${events.length} matchs`);
      
      if (events.length > 0) {
        events.forEach(e => {
          const comp = e.competitions?.[0];
          const home = comp?.competitors?.find(c => c.homeAway === 'home')?.team?.displayName;
          const away = comp?.competitors?.find(c => c.homeAway === 'away')?.team?.displayName;
          console.log(`  - ${home} vs ${away} (${e.status?.type?.detail || 'Scheduled'})`);
        });
      }
    } catch (err) {
      console.log(`${date.toLocaleDateString('fr-FR')}: Erreur - ${err.message}`);
    }
  }
}

testLigue1Dates();
