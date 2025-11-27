// test-standings-calculator.js
// Test du système de calcul dynamique des standings

const { calculateLiveStandings } = require('./standings-calculator');

// Mock d'un scoreboard NHL avec quelques matchs terminés
const mockNHLScoreboard = {
  events: [
    {
      status: { type: { state: 'post', detail: 'Final' } },
      competitions: [{
        competitors: [
          { homeAway: 'home', team: { abbreviation: 'WSH' }, score: '3' },
          { homeAway: 'away', team: { abbreviation: 'NYR' }, score: '2' }
        ]
      }]
    },
    {
      status: { type: { state: 'post', detail: 'Final/OT' } },
      competitions: [{
        competitors: [
          { homeAway: 'home', team: { abbreviation: 'BOS' }, score: '4' },
          { homeAway: 'away', team: { abbreviation: 'TOR' }, score: '3' }
        ]
      }]
    }
  ]
};

// Mock d'un scoreboard NBA
const mockNBAScoreboard = {
  events: [
    {
      status: { type: { state: 'post' } },
      competitions: [{
        competitors: [
          { homeAway: 'home', team: { abbreviation: 'CLE' }, score: '115' },
          { homeAway: 'away', team: { abbreviation: 'BOS' }, score: '108' }
        ]
      }]
    }
  ]
};

// Mock d'un scoreboard NFL
const mockNFLScoreboard = {
  events: [
    {
      status: { type: { state: 'post' } },
      competitions: [{
        competitors: [
          { homeAway: 'home', team: { abbreviation: 'DET' }, score: '24' },
          { homeAway: 'away', team: { abbreviation: 'GB' }, score: '17' }
        ]
      }]
    }
  ]
};

async function testCalculator() {
  console.log('🧪 Test du calculateur de standings...\n');
  
  try {
    // Test NHL
    console.log('=== TEST NHL ===');
    const nhlStandings = await calculateLiveStandings('nhl', mockNHLScoreboard);
    console.log('Eastern Conference (top 3):');
    nhlStandings[0].standings.slice(0, 3).forEach(team => {
      console.log(`  ${team.position}. ${team.team} - ${team.wins}W ${team.losses}L ${team.otLosses}OTL (${team.points} pts)`);
    });
    console.log('Western Conference (top 3):');
    nhlStandings[1].standings.slice(0, 3).forEach(team => {
      console.log(`  ${team.position}. ${team.team} - ${team.wins}W ${team.losses}L ${team.otLosses}OTL (${team.points} pts)`);
    });
    
    // Test NBA
    console.log('\n=== TEST NBA ===');
    const nbaStandings = await calculateLiveStandings('nba', mockNBAScoreboard);
    console.log('Eastern Conference (top 3):');
    nbaStandings[0].standings.slice(0, 3).forEach(team => {
      console.log(`  ${team.position}. ${team.team} - ${team.wins}W ${team.losses}L (${team.winPercentage})`);
    });
    console.log('Western Conference (top 3):');
    nbaStandings[1].standings.slice(0, 3).forEach(team => {
      console.log(`  ${team.position}. ${team.team} - ${team.wins}W ${team.losses}L (${team.winPercentage})`);
    });
    
    // Test NFL
    console.log('\n=== TEST NFL ===');
    const nflStandings = await calculateLiveStandings('nfl', mockNFLScoreboard);
    console.log('NFC (top 3):');
    nflStandings[0].standings.slice(0, 3).forEach(team => {
      console.log(`  ${team.position}. ${team.team} - ${team.wins}W ${team.losses}L (${team.winPercentage})`);
    });
    console.log('AFC (top 3):');
    nflStandings[1].standings.slice(0, 3).forEach(team => {
      console.log(`  ${team.position}. ${team.team} - ${team.wins}W ${team.losses}L (${team.winPercentage})`);
    });
    
    console.log('\n✅ Tests réussis !');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error.stack);
  }
}

testCalculator();
