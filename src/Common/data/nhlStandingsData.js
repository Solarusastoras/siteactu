/**
 * Données de classement NHL - Saison 2025-2026
 * Organisé par conférences (Eastern/Western) et divisions
 */

export const currentNHLStandings = {
  // EASTERN CONFERENCE
  eastern: {
    atlantic: [
      { team: 'Montreal Canadiens', abbr: 'MTL', gp: 15, wins: 10, losses: 3, otl: 2, pts: 22, rw: 5, row: 10, home: '5-1-1', away: '5-2-1', gf: 57, ga: 47, strk: 'W1' },
      { team: 'Boston Bruins', abbr: 'BOS', gp: 17, wins: 10, losses: 7, otl: 0, pts: 20, rw: 6, row: 9, home: '7-3-0', away: '3-4-0', gf: 57, ga: 56, strk: 'W6' },
      { team: 'Tampa Bay Lightning', abbr: 'TB', gp: 15, wins: 8, losses: 5, otl: 2, pts: 18, rw: 6, row: 8, home: '4-3-0', away: '4-2-2', gf: 46, ga: 41, strk: 'W2' },
      { team: 'Toronto Maple Leafs', abbr: 'TOR', gp: 15, wins: 8, losses: 6, otl: 1, pts: 17, rw: 6, row: 8, home: '7-3-1', away: '1-3-0', gf: 55, ga: 55, strk: 'L1' },
      { team: 'Ottawa Senators', abbr: 'OTT', gp: 15, wins: 7, losses: 5, otl: 3, pts: 17, rw: 4, row: 5, home: '4-2-1', away: '3-3-2', gf: 53, ga: 56, strk: 'W1' },
      { team: 'New York Islanders', abbr: 'NYI', gp: 15, wins: 7, losses: 6, otl: 2, pts: 16, rw: 7, row: 7, home: '4-3-1', away: '3-3-1', gf: 50, ga: 51, strk: 'W1' },
      { team: 'Florida Panthers', abbr: 'FLA', gp: 14, wins: 7, losses: 6, otl: 1, pts: 15, rw: 6, row: 6, home: '5-1-1', away: '2-5-0', gf: 39, ga: 43, strk: 'W1' },
      { team: 'Buffalo Sabres', abbr: 'BUF', gp: 15, wins: 5, losses: 6, otl: 4, pts: 14, rw: 4, row: 4, home: '5-3-2', away: '0-3-2', gf: 41, ga: 49, strk: 'L3' }
    ],
    metropolitan: [
      { team: 'New Jersey Devils', abbr: 'NJ', gp: 15, wins: 11, losses: 4, otl: 0, pts: 22, rw: 8, row: 10, home: '7-0-0', away: '4-4-0', gf: 52, ga: 44, strk: 'W2' },
      { team: 'Pittsburgh Penguins', abbr: 'PIT', gp: 16, wins: 9, losses: 4, otl: 3, pts: 21, rw: 9, row: 9, home: '4-1-1', away: '5-3-2', gf: 55, ga: 45, strk: 'L1' },
      { team: 'Carolina Hurricanes', abbr: 'CAR', gp: 14, wins: 10, losses: 4, otl: 0, pts: 20, rw: 7, row: 9, home: '5-1-0', away: '5-3-0', gf: 54, ga: 38, strk: 'W3' },
      { team: 'New York Rangers', abbr: 'NYR', gp: 16, wins: 7, losses: 7, otl: 2, pts: 16, rw: 5, row: 7, home: '0-6-1', away: '7-1-1', gf: 35, ga: 40, strk: 'L1' },
      { team: 'Washington Capitals', abbr: 'WSH', gp: 15, wins: 7, losses: 7, otl: 1, pts: 15, rw: 6, row: 7, home: '4-4-0', away: '3-3-1', gf: 42, ga: 38, strk: 'L2' },
      { team: 'Columbus Blue Jackets', abbr: 'CBJ', gp: 13, wins: 7, losses: 6, otl: 0, pts: 14, rw: 5, row: 6, home: '3-3-0', away: '4-3-0', gf: 41, ga: 41, strk: 'L2' }
    ],
    wildcard: [
      { team: 'Detroit Red Wings', abbr: 'DET', gp: 15, wins: 9, losses: 6, otl: 0, pts: 18, rw: 6, row: 7, home: '5-2-0', away: '4-4-0', gf: 45, ga: 46, strk: 'L2' },
      { team: 'Philadelphia Flyers', abbr: 'PHI', gp: 15, wins: 8, losses: 5, otl: 2, pts: 18, rw: 4, row: 5, home: '6-3-1', away: '2-2-1', gf: 43, ga: 39, strk: 'L1' }
    ]
  },
  
  // WESTERN CONFERENCE
  western: {
    central: [
      { team: 'Colorado Avalanche', abbr: 'COL', gp: 14, wins: 8, losses: 1, otl: 5, pts: 21, rw: 8, row: 8, home: '4-0-2', away: '4-1-3', gf: 50, ga: 37, strk: 'W1' },
      { team: 'Dallas Stars', abbr: 'DAL', gp: 15, wins: 8, losses: 4, otl: 3, pts: 19, rw: 6, row: 6, home: '4-3-1', away: '4-1-2', gf: 47, ga: 50, strk: 'W1' },
      { team: 'Winnipeg Jets', abbr: 'WPG', gp: 14, wins: 9, losses: 5, otl: 0, pts: 18, rw: 8, row: 9, home: '5-3-0', away: '4-2-0', gf: 46, ga: 35, strk: 'L2' },
      { team: 'Minnesota Wild', abbr: 'MIN', gp: 16, wins: 6, losses: 7, otl: 3, pts: 15, rw: 4, row: 5, home: '3-3-2', away: '3-4-1', gf: 48, ga: 57, strk: 'W1' },
      { team: 'Nashville Predators', abbr: 'NSH', gp: 15, wins: 7, losses: 8, otl: 0, pts: 14, rw: 3, row: 5, home: '2-4-0', away: '5-4-0', gf: 42, ga: 50, strk: 'L1' },
      { team: 'St. Louis Blues', abbr: 'STL', gp: 17, wins: 5, losses: 8, otl: 4, pts: 14, rw: 4, row: 4, home: '4-5-2', away: '1-3-2', gf: 44, ga: 59, strk: 'L4' },
      { team: 'Calgary Flames', abbr: 'CGY', gp: 16, wins: 4, losses: 10, otl: 2, pts: 10, rw: 3, row: 3, home: '2-4-1', away: '2-6-1', gf: 36, ga: 53, strk: 'L1' }
    ],
    pacific: [
      { team: 'Anaheim Ducks', abbr: 'ANA', gp: 13, wins: 9, losses: 3, otl: 1, pts: 19, rw: 7, row: 8, home: '4-1-0', away: '5-2-1', gf: 55, ga: 42, strk: 'W5' },
      { team: 'Seattle Kraken', abbr: 'SEA', gp: 14, wins: 7, losses: 3, otl: 4, pts: 18, rw: 4, row: 7, home: '4-1-2', away: '3-2-2', gf: 38, ga: 42, strk: 'W1' },
      { team: 'Vegas Golden Knights', abbr: 'VGK', gp: 13, wins: 7, losses: 3, otl: 3, pts: 17, rw: 6, row: 7, home: '4-2-1', away: '3-1-2', gf: 43, ga: 38, strk: 'L1' },
      { team: 'Edmonton Oilers', abbr: 'EDM', gp: 15, wins: 6, losses: 5, otl: 4, pts: 16, rw: 4, row: 6, home: '4-0-2', away: '2-5-2', gf: 46, ga: 48, strk: 'L2' },
      { team: 'Los Angeles Kings', abbr: 'LA', gp: 15, wins: 6, losses: 5, otl: 4, pts: 16, rw: 3, row: 5, home: '1-4-2', away: '5-1-2', gf: 42, ga: 49, strk: 'L1' },
      { team: 'San Jose Sharks', abbr: 'SJ', gp: 15, wins: 6, losses: 6, otl: 3, pts: 15, rw: 3, row: 6, home: '3-3-3', away: '3-3-0', gf: 50, ga: 55, strk: 'W2' },
      { team: 'Vancouver Canucks', abbr: 'VAN', gp: 15, wins: 7, losses: 8, otl: 0, pts: 14, rw: 3, row: 5, home: '2-4-0', away: '5-4-0', gf: 42, ga: 50, strk: 'L1' }
    ],
    wildcard: [
      { team: 'Utah Mammoth', abbr: 'UTA', gp: 15, wins: 9, losses: 6, otl: 0, pts: 18, rw: 6, row: 9, home: '4-1-0', away: '5-5-0', gf: 49, ga: 46, strk: 'L2' },
      { team: 'Chicago Blackhawks', abbr: 'CHI', gp: 15, wins: 7, losses: 5, otl: 3, pts: 17, rw: 6, row: 7, home: '3-2-1', away: '4-3-2', gf: 48, ga: 40, strk: 'W2' }
    ]
  }
};
