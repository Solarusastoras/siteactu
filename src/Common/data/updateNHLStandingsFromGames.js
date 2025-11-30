// Génère le classement NHL à partir d'une liste de matchs (scoreboard)
// Entrée :
//   games = [
//     { homeTeam: 'Team A', awayTeam: 'Team B', homeScore: 3, awayScore: 2, isOvertime: false },
//     ...
//   ]
// Retour : tableau d'équipes [{ team, wins, losses, otLosses, points, ... }]

function updateNHLStandingsFromGames(games) {
  const standings = {};

  // Helper pour initialiser une équipe
  function ensureTeam(team) {
    if (!standings[team]) {
      standings[team] = {
        team,
        wins: 0,
        losses: 0,
        otLosses: 0,
        points: 0,
        played: 0,
        goalsFor: 0,
        goalsAgainst: 0,
      };
    }
  }

  games.forEach(game => {
    const { homeTeam, awayTeam, homeScore, awayScore, isOvertime } = game;
    ensureTeam(homeTeam);
    ensureTeam(awayTeam);
    standings[homeTeam].played++;
    standings[awayTeam].played++;
    standings[homeTeam].goalsFor += homeScore;
    standings[homeTeam].goalsAgainst += awayScore;
    standings[awayTeam].goalsFor += awayScore;
    standings[awayTeam].goalsAgainst += homeScore;

    if (homeScore > awayScore) {
      // Victoire domicile
      if (isOvertime) {
        standings[homeTeam].wins++;
        standings[homeTeam].points += 2;
        standings[awayTeam].otLosses++;
        standings[awayTeam].points += 1;
      } else {
        standings[homeTeam].wins++;
        standings[homeTeam].points += 2;
        standings[awayTeam].losses++;
      }
    } else if (awayScore > homeScore) {
      // Victoire extérieur
      if (isOvertime) {
        standings[awayTeam].wins++;
        standings[awayTeam].points += 2;
        standings[homeTeam].otLosses++;
        standings[homeTeam].points += 1;
      } else {
        standings[awayTeam].wins++;
        standings[awayTeam].points += 2;
        standings[homeTeam].losses++;
      }
    }
    // Pas de match nul en NHL
  });

  // Ajoute le différentiel de buts
  Object.values(standings).forEach(team => {
    team.goalDifference = team.goalsFor - team.goalsAgainst;
  });

  // Retourne un tableau trié par points puis diff
  return Object.values(standings).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return (b.goalDifference || 0) - (a.goalDifference || 0);
  });
}

export default updateNHLStandingsFromGames;
