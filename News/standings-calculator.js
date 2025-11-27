// standings-calculator.js
// Système de calcul dynamique des standings pour NHL, NBA, NFL

const fs = require('fs').promises;
const path = require('path');

// Import des standings initiaux
const nhlInitial = require('./nhl-initial-standings');
const nbaInitial = require('./nba-initial-standings');
const nflInitial = require('./nfl-initial-standings');

// Fichiers de sauvegarde des standings courants
const STANDINGS_FILES = {
  nhl: path.join(__dirname, 'output', 'nhl-live-standings.json'),
  nba: path.join(__dirname, 'output', 'nba-live-standings.json'),
  nfl: path.join(__dirname, 'output', 'nfl-live-standings.json')
};

// Charger les standings sauvegardés ou utiliser les initiaux
async function loadStandings(sport) {
  try {
    const data = await fs.readFile(STANDINGS_FILES[sport], 'utf8');
    const parsed = JSON.parse(data);
    console.log(`✓ Standings ${sport.toUpperCase()} chargés depuis cache`);
    return parsed;
  } catch (error) {
    console.log(`→ Initialisation des standings ${sport.toUpperCase()}`);
    const initial = sport === 'nhl' ? nhlInitial : sport === 'nba' ? nbaInitial : nflInitial;
    await saveStandings(sport, initial);
    return initial;
  }
}

// Sauvegarder les standings
async function saveStandings(sport, standings) {
  try {
    await fs.writeFile(STANDINGS_FILES[sport], JSON.stringify(standings, null, 2));
    console.log(`✓ Standings ${sport.toUpperCase()} sauvegardés`);
  } catch (error) {
    console.error(`✗ Erreur sauvegarde standings ${sport.toUpperCase()}:`, error.message);
  }
}

// Mettre à jour les standings NHL avec résultats des matchs
function updateNHLStandings(standings, scoreboard) {
  if (!scoreboard?.events) return standings;
  
  const updated = JSON.parse(JSON.stringify(standings)); // Deep copy
  
  for (const event of scoreboard.events) {
    // Seulement les matchs terminés
    if (event.status?.type?.state !== 'post') continue;
    
    const competition = event.competitions?.[0];
    if (!competition) continue;
    
    const homeTeam = competition.competitors?.find(c => c.homeAway === 'home');
    const awayTeam = competition.competitors?.find(c => c.homeAway === 'away');
    
    if (!homeTeam || !awayTeam) continue;
    
    const homeScore = parseInt(homeTeam.score) || 0;
    const awayScore = parseInt(awayTeam.score) || 0;
    const homeWin = homeScore > awayScore;
    const overtime = event.status?.type?.detail?.includes('OT') || event.status?.type?.detail?.includes('SO');
    
    // Mettre à jour les stats
    ['eastern', 'western'].forEach(conf => {
      updated[conf].forEach(team => {
        if (team.abbr === homeTeam.team.abbreviation) {
          if (homeWin) {
            team.wins++;
            team.points += 2;
          } else {
            if (overtime) {
              team.otLosses++;
              team.points += 1;
            } else {
              team.losses++;
            }
          }
          team.goalsFor += homeScore;
          team.goalsAgainst += awayScore;
        } else if (team.abbr === awayTeam.team.abbreviation) {
          if (!homeWin) {
            team.wins++;
            team.points += 2;
          } else {
            if (overtime) {
              team.otLosses++;
              team.points += 1;
            } else {
              team.losses++;
            }
          }
          team.goalsFor += awayScore;
          team.goalsAgainst += homeScore;
        }
      });
    });
  }
  
  // Trier par points (puis par différence de buts)
  ['eastern', 'western'].forEach(conf => {
    updated[conf].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const diffA = a.goalsFor - a.goalsAgainst;
      const diffB = b.goalsFor - b.goalsAgainst;
      return diffB - diffA;
    });
  });
  
  return updated;
}

// Mettre à jour les standings NBA avec résultats des matchs
function updateNBAStandings(standings, scoreboard) {
  if (!scoreboard?.events) return standings;
  
  const updated = JSON.parse(JSON.stringify(standings));
  
  for (const event of scoreboard.events) {
    if (event.status?.type?.state !== 'post') continue;
    
    const competition = event.competitions?.[0];
    if (!competition) continue;
    
    const homeTeam = competition.competitors?.find(c => c.homeAway === 'home');
    const awayTeam = competition.competitors?.find(c => c.homeAway === 'away');
    
    if (!homeTeam || !awayTeam) continue;
    
    const homeScore = parseInt(homeTeam.score) || 0;
    const awayScore = parseInt(awayTeam.score) || 0;
    const homeWin = homeScore > awayScore;
    
    ['eastern', 'western'].forEach(conf => {
      updated[conf].forEach(team => {
        if (team.abbr === homeTeam.team.abbreviation) {
          if (homeWin) team.wins++;
          else team.losses++;
          team.pointsFor += homeScore;
          team.pointsAgainst += awayScore;
        } else if (team.abbr === awayTeam.team.abbreviation) {
          if (!homeWin) team.wins++;
          else team.losses++;
          team.pointsFor += awayScore;
          team.pointsAgainst += homeScore;
        }
      });
    });
  }
  
  // Trier par wins (puis par pourcentage)
  ['eastern', 'western'].forEach(conf => {
    updated[conf].sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      const winPctA = a.wins / (a.wins + a.losses);
      const winPctB = b.wins / (b.wins + b.losses);
      return winPctB - winPctA;
    });
  });
  
  return updated;
}

// Mettre à jour les standings NFL avec résultats des matchs
function updateNFLStandings(standings, scoreboard) {
  if (!scoreboard?.events) return standings;
  
  const updated = JSON.parse(JSON.stringify(standings));
  
  for (const event of scoreboard.events) {
    if (event.status?.type?.state !== 'post') continue;
    
    const competition = event.competitions?.[0];
    if (!competition) continue;
    
    const homeTeam = competition.competitors?.find(c => c.homeAway === 'home');
    const awayTeam = competition.competitors?.find(c => c.homeAway === 'away');
    
    if (!homeTeam || !awayTeam) continue;
    
    const homeScore = parseInt(homeTeam.score) || 0;
    const awayScore = parseInt(awayTeam.score) || 0;
    
    if (homeScore === awayScore) {
      // Tie (rare en NFL moderne)
      ['nfc', 'afc'].forEach(conf => {
        updated[conf].forEach(team => {
          if (team.abbr === homeTeam.team.abbreviation || team.abbr === awayTeam.team.abbreviation) {
            team.ties++;
            team.pointsFor += (team.abbr === homeTeam.team.abbreviation) ? homeScore : awayScore;
            team.pointsAgainst += (team.abbr === homeTeam.team.abbreviation) ? awayScore : homeScore;
          }
        });
      });
    } else {
      const homeWin = homeScore > awayScore;
      
      ['nfc', 'afc'].forEach(conf => {
        updated[conf].forEach(team => {
          if (team.abbr === homeTeam.team.abbreviation) {
            if (homeWin) team.wins++;
            else team.losses++;
            team.pointsFor += homeScore;
            team.pointsAgainst += awayScore;
          } else if (team.abbr === awayTeam.team.abbreviation) {
            if (!homeWin) team.wins++;
            else team.losses++;
            team.pointsFor += awayScore;
            team.pointsAgainst += homeScore;
          }
        });
      });
    }
  }
  
  // Trier par wins (puis différence de points)
  ['nfc', 'afc'].forEach(conf => {
    updated[conf].sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      const diffA = a.pointsFor - a.pointsAgainst;
      const diffB = b.pointsFor - b.pointsAgainst;
      return diffB - diffA;
    });
  });
  
  return updated;
}

// Formater pour le format SofaScore (compatible avec le frontend)
function formatForSofaScore(standings, sport) {
  const conferences = [];
  
  if (sport === 'nhl') {
    conferences.push({
      name: 'Eastern Conference',
      standings: standings.eastern.map((team, idx) => ({
        position: idx + 1,
        team: team.team,
        teamId: 0, // Pas d'ID SofaScore
        logo: '', // Logo à récupérer si besoin
        played: team.wins + team.losses + team.otLosses,
        wins: team.wins,
        draws: 0, // NHL n'a pas de draws
        losses: team.losses + team.otLosses,
        points: team.points,
        goalsFor: team.goalsFor,
        goalsAgainst: team.goalsAgainst,
        goalDifference: team.goalsFor - team.goalsAgainst,
        otLosses: team.otLosses
      }))
    });
    
    conferences.push({
      name: 'Western Conference',
      standings: standings.western.map((team, idx) => ({
        position: idx + 1,
        team: team.team,
        teamId: 0,
        logo: '',
        played: team.wins + team.losses + team.otLosses,
        wins: team.wins,
        draws: 0,
        losses: team.losses + team.otLosses,
        points: team.points,
        goalsFor: team.goalsFor,
        goalsAgainst: team.goalsAgainst,
        goalDifference: team.goalsFor - team.goalsAgainst,
        otLosses: team.otLosses
      }))
    });
  } else if (sport === 'nba') {
    conferences.push({
      name: 'Eastern Conference',
      standings: standings.eastern.map((team, idx) => ({
        position: idx + 1,
        team: team.team,
        teamId: 0,
        logo: '',
        played: team.wins + team.losses,
        wins: team.wins,
        losses: team.losses,
        winPercentage: (team.wins / (team.wins + team.losses)).toFixed(3),
        pointsFor: team.pointsFor,
        pointsAgainst: team.pointsAgainst
      }))
    });
    
    conferences.push({
      name: 'Western Conference',
      standings: standings.western.map((team, idx) => ({
        position: idx + 1,
        team: team.team,
        teamId: 0,
        logo: '',
        played: team.wins + team.losses,
        wins: team.wins,
        losses: team.losses,
        winPercentage: (team.wins / (team.wins + team.losses)).toFixed(3),
        pointsFor: team.pointsFor,
        pointsAgainst: team.pointsAgainst
      }))
    });
  } else if (sport === 'nfl') {
    conferences.push({
      name: 'NFC',
      standings: standings.nfc.map((team, idx) => ({
        position: idx + 1,
        team: team.team,
        teamId: 0,
        logo: '',
        played: team.wins + team.losses + team.ties,
        wins: team.wins,
        losses: team.losses,
        ties: team.ties,
        winPercentage: ((team.wins + team.ties * 0.5) / (team.wins + team.losses + team.ties)).toFixed(3),
        pointsFor: team.pointsFor,
        pointsAgainst: team.pointsAgainst,
        division: team.division
      }))
    });
    
    conferences.push({
      name: 'AFC',
      standings: standings.afc.map((team, idx) => ({
        position: idx + 1,
        team: team.team,
        teamId: 0,
        logo: '',
        played: team.wins + team.losses + team.ties,
        wins: team.wins,
        losses: team.losses,
        ties: team.ties,
        winPercentage: ((team.wins + team.ties * 0.5) / (team.wins + team.losses + team.ties)).toFixed(3),
        pointsFor: team.pointsFor,
        pointsAgainst: team.pointsAgainst,
        division: team.division
      }))
    });
  }
  
  return conferences;
}

// Fonction principale : calculer standings dynamiques
async function calculateLiveStandings(sport, scoreboard) {
  console.log(`\n→ Calcul standings ${sport.toUpperCase()}...`);
  
  // Charger standings actuels
  const currentStandings = await loadStandings(sport);
  
  // Mettre à jour avec résultats du scoreboard
  let updatedStandings;
  if (sport === 'nhl') {
    updatedStandings = updateNHLStandings(currentStandings, scoreboard);
  } else if (sport === 'nba') {
    updatedStandings = updateNBAStandings(currentStandings, scoreboard);
  } else if (sport === 'nfl') {
    updatedStandings = updateNFLStandings(currentStandings, scoreboard);
  }
  
  // Sauvegarder les standings mis à jour
  await saveStandings(sport, updatedStandings);
  
  // Formater pour le frontend
  const formatted = formatForSofaScore(updatedStandings, sport);
  
  console.log(`✓ Standings ${sport.toUpperCase()} calculés`);
  return formatted;
}

// Export
module.exports = {
  calculateLiveStandings,
  loadStandings,
  saveStandings
};
