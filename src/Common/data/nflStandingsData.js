/**
 * Données de classement NFL - Saison 2024-2025
 * Format unifié pour StandingsTable
 */

export const currentNFLStandings = [
  {
    name: 'AFC',
    abbreviation: 'AFC',
    standings: [
      { team: 'Patriots', fullName: 'New England Patriots', abbr: 'NE', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/ne.png', gamesPlayed: 12, wins: 10, losses: 2, ties: 0, pct: 0.833, diff: 92, streak: 'W5' },
      { team: 'Broncos', fullName: 'Denver Broncos', abbr: 'DEN', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/den.png', gamesPlayed: 11, wins: 9, losses: 2, ties: 0, pct: 0.818, diff: 65, streak: 'W5' },
      { team: 'Colts', fullName: 'Indianapolis Colts', abbr: 'IND', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/ind.png', gamesPlayed: 11, wins: 8, losses: 3, ties: 0, pct: 0.727, diff: 112, streak: 'D1' },
      { team: 'Chargers', fullName: 'Los Angeles Chargers', abbr: 'LAC', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/lac.png', gamesPlayed: 11, wins: 7, losses: 4, ties: 0, pct: 0.636, diff: 8, streak: 'D1' },
      { team: 'Jaguars', fullName: 'Jacksonville Jaguars', abbr: 'JAX', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/jax.png', gamesPlayed: 11, wins: 7, losses: 4, ties: 0, pct: 0.636, diff: 17, streak: 'W1' },
      { team: 'Bills', fullName: 'Buffalo Bills', abbr: 'BUF', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/buf.png', gamesPlayed: 11, wins: 7, losses: 4, ties: 0, pct: 0.636, diff: 59, streak: 'D1' },
      { team: 'Ravens', fullName: 'Baltimore Ravens', abbr: 'BAL', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/bal.png', gamesPlayed: 11, wins: 6, losses: 5, ties: 0, pct: 0.545, diff: 14, streak: 'W5' },
      { team: 'Steelers', fullName: 'Pittsburgh Steelers', abbr: 'PIT', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/pit.png', gamesPlayed: 11, wins: 6, losses: 5, ties: 0, pct: 0.545, diff: 11, streak: 'D1' },
      { team: 'Texans', fullName: 'Houston Texans', abbr: 'HOU', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/hou.png', gamesPlayed: 11, wins: 6, losses: 5, ties: 0, pct: 0.545, diff: 61, streak: 'W3' },
      { team: 'Chiefs', fullName: 'Kansas City Chiefs', abbr: 'KC', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png', gamesPlayed: 11, wins: 6, losses: 5, ties: 0, pct: 0.545, diff: 76, streak: 'W1' },
      { team: 'Dolphins', fullName: 'Miami Dolphins', abbr: 'MIA', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/mia.png', gamesPlayed: 11, wins: 4, losses: 7, ties: 0, pct: 0.364, diff: -43, streak: 'W2' },
      { team: 'Bengals', fullName: 'Cincinnati Bengals', abbr: 'CIN', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/cin.png', gamesPlayed: 11, wins: 3, losses: 8, ties: 0, pct: 0.273, diff: -112, streak: 'D3' },
      { team: 'Browns', fullName: 'Cleveland Browns', abbr: 'CLE', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/cle.png', gamesPlayed: 11, wins: 3, losses: 8, ties: 0, pct: 0.273, diff: -58, streak: 'W1' },
      { team: 'Raiders', fullName: 'Las Vegas Raiders', abbr: 'LV', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/lv.png', gamesPlayed: 11, wins: 2, losses: 9, ties: 0, pct: 0.182, diff: -112, streak: 'D5' },
      { team: 'Jets', fullName: 'New York Jets', abbr: 'NYJ', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png', gamesPlayed: 11, wins: 2, losses: 9, ties: 0, pct: 0.182, diff: -72, streak: 'D2' },
      { team: 'Titans', fullName: 'Tennessee Titans', abbr: 'TEN', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/ten.png', gamesPlayed: 11, wins: 1, losses: 10, ties: 0, pct: 0.091, diff: -136, streak: 'D5' }
    ]
  },
  {
    name: 'NFC',
    abbreviation: 'NFC',
    standings: [
      { team: 'Rams', fullName: 'Los Angeles Rams', abbr: 'LAR', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/lar.png', gamesPlayed: 11, wins: 9, losses: 2, ties: 0, pct: 0.818, diff: 127, streak: 'W5' },
      { team: 'Eagles', fullName: 'Philadelphia Eagles', abbr: 'PHI', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/phi.png', gamesPlayed: 11, wins: 8, losses: 3, ties: 0, pct: 0.727, diff: 30, streak: 'D1' },
      { team: 'Bears', fullName: 'Chicago Bears', abbr: 'CHI', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png', gamesPlayed: 11, wins: 8, losses: 3, ties: 0, pct: 0.727, diff: -3, streak: 'W3' },
      { team: 'Seahawks', fullName: 'Seattle Seahawks', abbr: 'SEA', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png', gamesPlayed: 11, wins: 8, losses: 3, ties: 0, pct: 0.727, diff: 107, streak: 'W1' },
      { team: 'Packers', fullName: 'Green Bay Packers', abbr: 'GB', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png', gamesPlayed: 11, wins: 7, losses: 3, ties: 1, pct: 0.682, diff: 61, streak: 'W2' },
      { team: '49ers', fullName: 'San Francisco 49ers', abbr: 'SF', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png', gamesPlayed: 11, wins: 7, losses: 4, ties: 0, pct: 0.636, diff: 9, streak: 'W1' },
      { team: 'Lions', fullName: 'Detroit Lions', abbr: 'DET', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/det.png', gamesPlayed: 11, wins: 7, losses: 4, ties: 0, pct: 0.636, diff: 83, streak: 'W1' },
      { team: 'Buccaneers', fullName: 'Tampa Bay Buccaneers', abbr: 'TB', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/tb.png', gamesPlayed: 11, wins: 6, losses: 5, ties: 0, pct: 0.545, diff: -25, streak: 'D3' },
      { team: 'Panthers', fullName: 'Carolina Panthers', abbr: 'CAR', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/car.png', gamesPlayed: 11, wins: 6, losses: 5, ties: 0, pct: 0.545, diff: -42, streak: 'W1' },
      { team: 'Cowboys', fullName: 'Dallas Cowboys', abbr: 'DAL', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png', gamesPlayed: 11, wins: 5, losses: 5, ties: 1, pct: 0.500, diff: 6, streak: 'W2' },
      { team: 'Falcons', fullName: 'Atlanta Falcons', abbr: 'ATL', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/atl.png', gamesPlayed: 11, wins: 4, losses: 7, ties: 0, pct: 0.364, diff: -30, streak: 'W1' },
      { team: 'Vikings', fullName: 'Minnesota Vikings', abbr: 'MIN', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/min.png', gamesPlayed: 11, wins: 4, losses: 7, ties: 0, pct: 0.364, diff: -31, streak: 'D3' },
      { team: 'Cardinals', fullName: 'Arizona Cardinals', abbr: 'ARI', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/ari.png', gamesPlayed: 11, wins: 3, losses: 8, ties: 0, pct: 0.273, diff: -35, streak: 'D3' },
      { team: 'Commanders', fullName: 'Washington Commanders', abbr: 'WAS', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png', gamesPlayed: 11, wins: 3, losses: 8, ties: 0, pct: 0.273, diff: -60, streak: 'D5' },
      { team: 'Saints', fullName: 'New Orleans Saints', abbr: 'NO', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/no.png', gamesPlayed: 11, wins: 2, losses: 9, ties: 0, pct: 0.182, diff: -109, streak: 'D1' },
      { team: 'Giants', fullName: 'New York Giants', abbr: 'NYG', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png', gamesPlayed: 12, wins: 2, losses: 10, ties: 0, pct: 0.167, diff: -70, streak: 'D5' }
    ]
  }
];

