// Script pour créer les fichiers JSON de standings statiques
const fs = require('fs');
const path = require('path');

const nhlData = require('./nhl-initial-standings');
const nbaData = require('./nba-initial-standings');
const nflData = require('./nfl-initial-standings');

function formatStandings(data, sport) {
  const conferences = [];
  
  if (sport === 'nhl') {
    conferences.push({
      name: 'Eastern Conference',
      standings: data.eastern.map((t, i) => ({
        position: i + 1,
        team: t.team,
        teamId: 0,
        logo: '',
        played: t.wins + t.losses + t.otLosses,
        wins: t.wins,
        draws: 0,
        losses: t.losses + t.otLosses,
        points: t.points,
        goalsFor: t.goalsFor,
        goalsAgainst: t.goalsAgainst,
        goalDifference: t.goalsFor - t.goalsAgainst,
        otLosses: t.otLosses
      }))
    });
    
    conferences.push({
      name: 'Western Conference',
      standings: data.western.map((t, i) => ({
        position: i + 1,
        team: t.team,
        teamId: 0,
        logo: '',
        played: t.wins + t.losses + t.otLosses,
        wins: t.wins,
        draws: 0,
        losses: t.losses + t.otLosses,
        points: t.points,
        goalsFor: t.goalsFor,
        goalsAgainst: t.goalsAgainst,
        goalDifference: t.goalsFor - t.goalsAgainst,
        otLosses: t.otLosses
      }))
    });
  } else if (sport === 'nba') {
    conferences.push({
      name: 'Eastern Conference',
      standings: data.eastern.map((t, i) => ({
        position: i + 1,
        team: t.team,
        teamId: 0,
        logo: '',
        played: t.wins + t.losses,
        wins: t.wins,
        draws: 0,
        losses: t.losses,
        points: t.wins,
        goalsFor: t.pointsFor,
        goalsAgainst: t.pointsAgainst,
        goalDifference: t.pointsFor - t.pointsAgainst
      }))
    });
    
    conferences.push({
      name: 'Western Conference',
      standings: data.western.map((t, i) => ({
        position: i + 1,
        team: t.team,
        teamId: 0,
        logo: '',
        played: t.wins + t.losses,
        wins: t.wins,
        draws: 0,
        losses: t.losses,
        points: t.wins,
        goalsFor: t.pointsFor,
        goalsAgainst: t.pointsAgainst,
        goalDifference: t.pointsFor - t.pointsAgainst
      }))
    });
  } else if (sport === 'nfl') {
    conferences.push({
      name: 'NFC',
      standings: data.nfc.map((t, i) => ({
        position: i + 1,
        team: t.team,
        teamId: 0,
        logo: '',
        played: t.wins + t.losses + t.ties,
        wins: t.wins,
        draws: t.ties,
        losses: t.losses,
        points: t.wins,
        goalsFor: t.pointsFor,
        goalsAgainst: t.pointsAgainst,
        goalDifference: t.pointsFor - t.pointsAgainst,
        division: t.division
      }))
    });
    
    conferences.push({
      name: 'AFC',
      standings: data.afc.map((t, i) => ({
        position: i + 1,
        team: t.team,
        teamId: 0,
        logo: '',
        played: t.wins + t.losses + t.ties,
        wins: t.wins,
        draws: t.ties,
        losses: t.losses,
        points: t.wins,
        goalsFor: t.pointsFor,
        goalsAgainst: t.pointsAgainst,
        goalDifference: t.pointsFor - t.pointsAgainst,
        division: t.division
      }))
    });
  }
  
  return conferences;
}

// Créer les fichiers JSON
const outputDir = path.join(__dirname, 'output');
fs.writeFileSync(path.join(outputDir, 'nhl.json'), JSON.stringify(formatStandings(nhlData, 'nhl'), null, 2));
fs.writeFileSync(path.join(outputDir, 'nba.json'), JSON.stringify(formatStandings(nbaData, 'nba'), null, 2));
fs.writeFileSync(path.join(outputDir, 'nfl.json'), JSON.stringify(formatStandings(nflData, 'nfl'), null, 2));

console.log('✅ Fichiers JSON de standings créés:');
console.log('   - output/nhl.json');
console.log('   - output/nba.json');
console.log('   - output/nfl.json');
