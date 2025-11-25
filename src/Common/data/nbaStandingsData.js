/**
 * Données de classement NBA - Saison 2024-25
 * Format par conférence (Est/Ouest)
 */

export const currentNBAStandings = [
  {
    name: 'Conférence Est',
    abbreviation: 'EST',
    standings: [
      { team: 'Cavaliers', fullName: 'Cleveland Cavaliers', abbr: 'CLE', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/cle.png', wins: 22, losses: 3, pct: 0.880 },
      { team: 'Celtics', fullName: 'Boston Celtics', abbr: 'BOS', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png', wins: 18, losses: 4, pct: 0.818 },
      { team: 'Knicks', fullName: 'New York Knicks', abbr: 'NYK', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/nyk.png', wins: 15, losses: 9, pct: 0.625 },
      { team: 'Magic', fullName: 'Orlando Magic', abbr: 'ORL', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/orl.png', wins: 15, losses: 11, pct: 0.577 },
      { team: 'Heat', fullName: 'Miami Heat', abbr: 'MIA', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/mia.png', wins: 12, losses: 10, pct: 0.545 },
      { team: 'Bucks', fullName: 'Milwaukee Bucks', abbr: 'MIL', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/mil.png', wins: 13, losses: 11, pct: 0.542 },
      { team: 'Hawks', fullName: 'Atlanta Hawks', abbr: 'ATL', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/atl.png', wins: 13, losses: 12, pct: 0.520 },
      { team: 'Pacers', fullName: 'Indiana Pacers', abbr: 'IND', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/ind.png', wins: 12, losses: 13, pct: 0.480 },
      { team: 'Bulls', fullName: 'Chicago Bulls', abbr: 'CHI', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png', wins: 11, losses: 14, pct: 0.440 },
      { team: 'Pistons', fullName: 'Detroit Pistons', abbr: 'DET', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/det.png', wins: 10, losses: 15, pct: 0.400 },
      { team: '76ers', fullName: 'Philadelphia 76ers', abbr: 'PHI', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/phi.png', wins: 9, losses: 15, pct: 0.375 },
      { team: 'Nets', fullName: 'Brooklyn Nets', abbr: 'BKN', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/bkn.png', wins: 9, losses: 15, pct: 0.375 },
      { team: 'Hornets', fullName: 'Charlotte Hornets', abbr: 'CHA', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/cha.png', wins: 7, losses: 16, pct: 0.304 },
      { team: 'Raptors', fullName: 'Toronto Raptors', abbr: 'TOR', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/tor.png', wins: 6, losses: 18, pct: 0.250 },
      { team: 'Wizards', fullName: 'Washington Wizards', abbr: 'WAS', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/wsh.png', wins: 3, losses: 19, pct: 0.136 }
    ]
  },
  {
    name: 'Conférence Ouest',
    abbreviation: 'OUEST',
    standings: [
      { team: 'Thunder', fullName: 'Oklahoma City Thunder', abbr: 'OKC', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/okc.png', wins: 19, losses: 5, pct: 0.792 },
      { team: 'Rockets', fullName: 'Houston Rockets', abbr: 'HOU', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/hou.png', wins: 17, losses: 8, pct: 0.680 },
      { team: 'Grizzlies', fullName: 'Memphis Grizzlies', abbr: 'MEM', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/mem.png', wins: 16, losses: 9, pct: 0.640 },
      { team: 'Warriors', fullName: 'Golden State Warriors', abbr: 'GSW', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/gs.png', wins: 15, losses: 9, pct: 0.625 },
      { team: 'Mavericks', fullName: 'Dallas Mavericks', abbr: 'DAL', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/dal.png', wins: 15, losses: 10, pct: 0.600 },
      { team: 'Nuggets', fullName: 'Denver Nuggets', abbr: 'DEN', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/den.png', wins: 14, losses: 10, pct: 0.583 },
      { team: 'Lakers', fullName: 'Los Angeles Lakers', abbr: 'LAL', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png', wins: 14, losses: 11, pct: 0.560 },
      { team: 'Suns', fullName: 'Phoenix Suns', abbr: 'PHX', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/phx.png', wins: 13, losses: 11, pct: 0.542 },
      { team: 'Clippers', fullName: 'LA Clippers', abbr: 'LAC', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/lac.png', wins: 13, losses: 11, pct: 0.542 },
      { team: 'Timberwolves', fullName: 'Minnesota Timberwolves', abbr: 'MIN', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/min.png', wins: 12, losses: 11, pct: 0.522 },
      { team: 'Spurs', fullName: 'San Antonio Spurs', abbr: 'SAS', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/sa.png', wins: 12, losses: 13, pct: 0.480 },
      { team: 'Kings', fullName: 'Sacramento Kings', abbr: 'SAC', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/sac.png', wins: 11, losses: 13, pct: 0.458 },
      { team: 'Trail Blazers', fullName: 'Portland Trail Blazers', abbr: 'POR', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/por.png', wins: 8, losses: 16, pct: 0.333 },
      { team: 'Jazz', fullName: 'Utah Jazz', abbr: 'UTA', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/uta.png', wins: 5, losses: 19, pct: 0.208 },
      { team: 'Pelicans', fullName: 'New Orleans Pelicans', abbr: 'NOP', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/no.png', wins: 5, losses: 21, pct: 0.192 }
    ]
  }
];
