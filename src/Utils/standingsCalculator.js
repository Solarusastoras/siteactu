// standingsCalculator.js
// Calcul des standings dynamiques pour NHL, NBA, NFL côté frontend

import nhlInitial from '../Common/data/nhl-initial-standings';
import nbaInitial from '../Common/data/nba-initial-standings';
import nflInitial from '../Common/data/nfl-initial-standings';
import { NHL_LOGOS, NBA_LOGOS, NFL_LOGOS } from './teamLogos';

// Extraire le surnom d'une équipe (dernier mot du nom)
function getTeamNickname(fullName) {
  const words = fullName.trim().split(' ');
  return words[words.length - 1];
}

// Calculer les standings NHL à partir du scoreboard
export function calculateNHLStandings(matches) {
  // Les données initiales servent de baseline (27 novembre 2025)
  // On part de ces données et on n'ajoute que les matchs APRÈS cette date
  const standings = {
    eastern: JSON.parse(JSON.stringify(nhlInitial.eastern)),
    western: JSON.parse(JSON.stringify(nhlInitial.western))
  };

  // Date des données initiales
  const baselineDate = new Date('2025-11-27T00:00:00Z');

  // Extraire seulement les matchs terminés APRÈS le 27 novembre
  const completedMatches = (matches?.completed || []).filter(match => {
    const matchDate = new Date(match.date);
    return matchDate > baselineDate;
  });
  
  // Pour chaque match terminé après baseline, mettre à jour les stats
  completedMatches.forEach(match => {
    // Format ESPN : match.competitions[0].competitors[]
    const competition = match.competitions?.[0];
    if (!competition) return;
    
    const homeComp = competition.competitors?.find(c => c.homeAway === 'home');
    const awayComp = competition.competitors?.find(c => c.homeAway === 'away');
    if (!homeComp || !awayComp) return;
    
    const homeScore = parseInt(homeComp.score) || 0;
    const awayScore = parseInt(awayComp.score) || 0;
    const homeWin = homeScore > awayScore;
    const overtime = match.status?.type?.detail?.includes('OT') || match.status?.type?.detail?.includes('SO');
    
    const homeTeamName = homeComp.team?.displayName || homeComp.team?.name || '';
    const awayTeamName = awayComp.team?.displayName || awayComp.team?.name || '';

    ['eastern', 'western'].forEach(conf => {
      standings[conf].forEach(team => {
        // Trouver l'équipe par nom
        const isHomeTeam = team.team === homeTeamName || team.abbr === homeComp.team?.abbreviation;
        const isAwayTeam = team.team === awayTeamName || team.abbr === awayComp.team?.abbreviation;

        if (isHomeTeam) {
          // Utiliser le logo local si disponible, sinon ESPN
          if (!team.logo) {
            team.logo = NHL_LOGOS[team.team] || homeComp.team?.logo || '';
          }
          team.wins += homeWin ? 1 : 0;
          team.losses += homeWin ? 0 : (overtime ? 0 : 1);
          team.otLosses += homeWin ? 0 : (overtime ? 1 : 0);
          team.points = team.wins * 2 + team.otLosses;
          team.goalsFor += homeScore;
          team.goalsAgainst += awayScore;
        } else if (isAwayTeam) {
          // Utiliser le logo local si disponible, sinon ESPN
          if (!team.logo) {
            team.logo = NHL_LOGOS[team.team] || awayComp.team?.logo || '';
          }
          team.wins += homeWin ? 0 : 1;
          team.losses += homeWin ? (overtime ? 0 : 1) : 0;
          team.otLosses += homeWin ? (overtime ? 1 : 0) : 0;
          team.points = team.wins * 2 + team.otLosses;
          team.goalsFor += awayScore;
          team.goalsAgainst += homeScore;
        }
      });
    });
  });

  // Trier par points
  ['eastern', 'western'].forEach(conf => {
    standings[conf].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst);
    });
  });

  return formatNHLForDisplay(standings);
}

// Calculer les standings NBA
export function calculateNBAStandings(matches) {
  const standings = {
    eastern: JSON.parse(JSON.stringify(nbaInitial.eastern)),
    western: JSON.parse(JSON.stringify(nbaInitial.western))
  };

  // Date des données initiales (27 novembre 2025)
  const baselineDate = new Date('2025-11-27T00:00:00Z');

  // Extraire seulement les matchs terminés APRÈS le 27 novembre
  const completedMatches = (matches?.completed || []).filter(match => {
    const matchDate = new Date(match.date);
    return matchDate > baselineDate;
  });
  
  completedMatches.forEach(match => {
    // Format ESPN : match.competitions[0].competitors[]
    const competition = match.competitions?.[0];
    if (!competition) return;
    
    const homeComp = competition.competitors?.find(c => c.homeAway === 'home');
    const awayComp = competition.competitors?.find(c => c.homeAway === 'away');
    if (!homeComp || !awayComp) return;
    
    const homeScore = parseInt(homeComp.score) || 0;
    const awayScore = parseInt(awayComp.score) || 0;
    const homeWin = homeScore > awayScore;
    
    const homeTeamName = homeComp.team?.displayName || homeComp.team?.name || '';
    const awayTeamName = awayComp.team?.displayName || awayComp.team?.name || '';

    ['eastern', 'western'].forEach(conf => {
      standings[conf].forEach(team => {
        const isHomeTeam = team.team === homeTeamName || team.abbr === homeComp.team?.abbreviation;
        const isAwayTeam = team.team === awayTeamName || team.abbr === awayComp.team?.abbreviation;

        if (isHomeTeam) {
          if (!team.logo) team.logo = NBA_LOGOS[team.team] || homeComp.team?.logo || '';
          team.wins += homeWin ? 1 : 0;
          team.losses += homeWin ? 0 : 1;
          team.pointsFor += homeScore;
          team.pointsAgainst += awayScore;
        } else if (isAwayTeam) {
          if (!team.logo) team.logo = NBA_LOGOS[team.team] || awayComp.team?.logo || '';
          team.wins += homeWin ? 0 : 1;
          team.losses += homeWin ? 1 : 0;
          team.pointsFor += awayScore;
          team.pointsAgainst += homeScore;
        }
      });
    });
  });

  // Trier par wins
  ['eastern', 'western'].forEach(conf => {
    standings[conf].sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      const pctA = a.wins / (a.wins + a.losses);
      const pctB = b.wins / (b.wins + b.losses);
      return pctB - pctA;
    });
  });

  return formatNBAForDisplay(standings);
}

// Calculer les standings NFL
export function calculateNFLStandings(matches) {
  const standings = {
    nfc: JSON.parse(JSON.stringify(nflInitial.nfc)),
    afc: JSON.parse(JSON.stringify(nflInitial.afc))
  };

  // Date des données initiales (27 novembre 2025 - Week 12)
  const baselineDate = new Date('2025-11-27T00:00:00Z');

  // Extraire seulement les matchs terminés APRÈS le 27 novembre
  const completedMatches = (matches?.completed || []).filter(match => {
    const matchDate = new Date(match.date);
    return matchDate > baselineDate;
  });
  
  completedMatches.forEach(match => {
    // Format ESPN : match.competitions[0].competitors[]
    const competition = match.competitions?.[0];
    if (!competition) return;
    
    const homeComp = competition.competitors?.find(c => c.homeAway === 'home');
    const awayComp = competition.competitors?.find(c => c.homeAway === 'away');
    if (!homeComp || !awayComp) return;
    
    const homeScore = parseInt(homeComp.score) || 0;
    const awayScore = parseInt(awayComp.score) || 0;
    
    const homeTeamName = homeComp.team?.displayName || homeComp.team?.name || '';
    const awayTeamName = awayComp.team?.displayName || awayComp.team?.name || '';

    ['nfc', 'afc'].forEach(conf => {
      standings[conf].forEach(team => {
        const isHomeTeam = team.team === homeTeamName || team.abbr === homeComp.team?.abbreviation;
        const isAwayTeam = team.team === awayTeamName || team.abbr === awayComp.team?.abbreviation;

        if (homeScore === awayScore) {
          if (isHomeTeam || isAwayTeam) {
            if (isHomeTeam && !team.logo) team.logo = NFL_LOGOS[team.team] || homeComp.team?.logo || '';
            if (isAwayTeam && !team.logo) team.logo = NFL_LOGOS[team.team] || awayComp.team?.logo || '';
            team.ties += 1;
            team.pointsFor += homeScore;
            team.pointsAgainst += awayScore;
          }
        } else {
          const homeWin = homeScore > awayScore;
          if (isHomeTeam) {
            if (!team.logo) team.logo = NFL_LOGOS[team.team] || homeComp.team?.logo || '';
            team.wins += homeWin ? 1 : 0;
            team.losses += homeWin ? 0 : 1;
            team.pointsFor += homeScore;
            team.pointsAgainst += awayScore;
          } else if (isAwayTeam) {
            if (!team.logo) team.logo = NFL_LOGOS[team.team] || awayComp.team?.logo || '';
            team.wins += homeWin ? 0 : 1;
            team.losses += homeWin ? 1 : 0;
            team.pointsFor += awayScore;
            team.pointsAgainst += homeScore;
          }
        }
      });
    });
  });

  // Trier par wins
  ['nfc', 'afc'].forEach(conf => {
    standings[conf].sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return (b.pointsFor - b.pointsAgainst) - (a.pointsFor - a.pointsAgainst);
    });
  });

  return formatNFLForDisplay(standings);
}

// Formater NHL pour l'affichage
function formatNHLForDisplay(standings) {
  return [
    {
      name: 'Eastern Conference',
      standings: standings.eastern.map((team, idx) => ({
        position: idx + 1,
        team: team.team, // Garder le nom complet pour l'affichage
        fullName: team.team,
        abbr: team.abbr,
        teamId: 0,
        logo: team.logo || '',
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
    },
    {
      name: 'Western Conference',
      standings: standings.western.map((team, idx) => ({
        position: idx + 1,
        team: team.team, // Garder le nom complet pour l'affichage
        fullName: team.team,
        abbr: team.abbr,
        teamId: 0,
        logo: team.logo || '',
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
    }
  ];
}

// Formater NBA pour l'affichage
function formatNBAForDisplay(standings) {
  return [
    {
      name: 'Eastern Conference',
      standings: standings.eastern.map((team, idx) => ({
        position: idx + 1,
        team: team.team, // Garder le nom complet pour l'affichage
        fullName: team.team,
        abbr: team.abbr,
        teamId: 0,
        logo: team.logo || '',
        played: team.wins + team.losses,
        wins: team.wins,
        draws: 0,
        losses: team.losses,
        points: team.wins,
        goalsFor: team.pointsFor,
        goalsAgainst: team.pointsAgainst,
        goalDifference: team.pointsFor - team.pointsAgainst
      }))
    },
    {
      name: 'Western Conference',
      standings: standings.western.map((team, idx) => ({
        position: idx + 1,
        team: team.team, // Garder le nom complet pour l'affichage
        fullName: team.team,
        abbr: team.abbr,
        teamId: 0,
        logo: team.logo || '',
        played: team.wins + team.losses,
        wins: team.wins,
        draws: 0,
        losses: team.losses,
        points: team.wins,
        goalsFor: team.pointsFor,
        goalsAgainst: team.pointsAgainst,
        goalDifference: team.pointsFor - team.pointsAgainst
      }))
    }
  ];
}

// Formater NFL pour l'affichage
function formatNFLForDisplay(standings) {
  return [
    {
      name: 'NFC',
      standings: standings.nfc.map((team, idx) => ({
        position: idx + 1,
        team: team.team, // Nom complet comme NHL
        fullName: team.team,
        abbr: team.abbr,
        teamId: 0,
        logo: team.logo || '',
        played: team.wins + team.losses + team.ties,
        wins: team.wins,
        draws: team.ties,
        losses: team.losses,
        points: team.wins,
        goalsFor: team.pointsFor,
        goalsAgainst: team.pointsAgainst,
        goalDifference: team.pointsFor - team.pointsAgainst,
        division: team.division
      }))
    },
    {
      name: 'AFC',
      standings: standings.afc.map((team, idx) => ({
        position: idx + 1,
        team: team.team, // Nom complet comme NHL
        fullName: team.team,
        abbr: team.abbr,
        teamId: 0,
        logo: team.logo || '',
        played: team.wins + team.losses + team.ties,
        wins: team.wins,
        draws: team.ties,
        losses: team.losses,
        points: team.wins,
        goalsFor: team.pointsFor,
        goalsAgainst: team.pointsAgainst,
        goalDifference: team.pointsFor - team.pointsAgainst,
        division: team.division
      }))
    }
  ];
}
