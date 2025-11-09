/**
 * Données de classement NFL - Saison 2025
 * Organisé par conférences (AFC/NFC) et divisions
 */

export const currentNFLStandings = {
  // AMERICAN FOOTBALL CONFERENCE
  afc: {
    east: [
      { team: 'Patriots', wins: 7, losses: 2, ties: 0, pct: 0.778, pf: 237, pa: 169, home: '3-2-0', road: '4-0-0', div: '2-0-0', conf: '4-2-0', strk: '6W' },
      { team: 'Bills', wins: 6, losses: 2, ties: 0, pct: 0.750, pf: 235, pa: 167, home: '4-1-0', road: '2-1-0', div: '2-1-0', conf: '4-1-0', strk: '2W' },
      { team: 'Dolphins', wins: 2, losses: 7, ties: 0, pct: 0.222, pf: 180, pa: 243, home: '1-3-0', road: '1-4-0', div: '1-2-0', conf: '1-6-0', strk: '1L' },
      { team: 'Jets', wins: 1, losses: 7, ties: 0, pct: 0.125, pf: 168, pa: 221, home: '0-5-0', road: '1-2-0', div: '0-2-0', conf: '1-4-0', strk: '1W' }
    ],
    north: [
      { team: 'Steelers', wins: 5, losses: 3, ties: 0, pct: 0.625, pf: 202, pa: 195, home: '3-2-0', road: '2-1-0', div: '1-1-0', conf: '4-1-0', strk: '1W' },
      { team: 'Ravens', wins: 3, losses: 5, ties: 0, pct: 0.375, pf: 202, pa: 216, home: '2-3-0', road: '1-2-0', div: '1-0-0', conf: '2-3-0', strk: '2W' },
      { team: 'Bengals', wins: 3, losses: 6, ties: 0, pct: 0.333, pf: 216, pa: 300, home: '2-3-0', road: '1-3-0', div: '2-0-0', conf: '3-2-0', strk: '2L' },
      { team: 'Browns', wins: 2, losses: 6, ties: 0, pct: 0.250, pf: 126, pa: 184, home: '2-2-0', road: '0-4-0', div: '0-3-0', conf: '1-4-0', strk: '1L' }
    ],
    south: [
      { team: 'Colts', wins: 7, losses: 2, ties: 0, pct: 0.778, pf: 290, pa: 181, home: '5-0-0', road: '2-2-0', div: '2-0-0', conf: '6-1-0', strk: '1L' },
      { team: 'Jaguars', wins: 5, losses: 3, ties: 0, pct: 0.625, pf: 176, pa: 184, home: '3-2-0', road: '2-1-0', div: '1-0-0', conf: '3-1-0', strk: '1W' },
      { team: 'Texans', wins: 3, losses: 5, ties: 0, pct: 0.375, pf: 168, pa: 121, home: '2-2-0', road: '1-3-0', div: '1-1-0', conf: '2-2-0', strk: '1L' },
      { team: 'Titans', wins: 1, losses: 8, ties: 0, pct: 0.111, pf: 130, pa: 257, home: '0-4-0', road: '1-4-0', div: '0-3-0', conf: '0-7-0', strk: '4L' }
    ],
    west: [
      { team: 'Broncos', wins: 8, losses: 2, ties: 0, pct: 0.800, pf: 235, pa: 173, home: '5-0-0', road: '3-2-0', div: '1-1-0', conf: '5-2-0', strk: '7W' },
      { team: 'Chargers', wins: 6, losses: 3, ties: 0, pct: 0.667, pf: 215, pa: 193, home: '3-2-0', road: '3-1-0', div: '3-0-0', conf: '5-1-0', strk: '2W' },
      { team: 'Chiefs', wins: 5, losses: 4, ties: 0, pct: 0.556, pf: 235, pa: 159, home: '4-1-0', road: '1-3-0', div: '1-1-0', conf: '2-3-0', strk: '1L' },
      { team: 'Raiders', wins: 2, losses: 7, ties: 0, pct: 0.222, pf: 139, pa: 220, home: '1-3-0', road: '1-4-0', div: '0-3-0', conf: '2-5-0', strk: '3L' }
    ]
  },
  
  // NATIONAL FOOTBALL CONFERENCE
  nfc: {
    east: [
      { team: 'Eagles', wins: 6, losses: 2, ties: 0, pct: 0.750, pf: 208, pa: 185, home: '3-1-0', road: '3-1-0', div: '2-1-0', conf: '5-1-0', strk: '2W' },
      { team: 'Cowboys', wins: 3, losses: 5, ties: 1, pct: 0.389, pf: 263, pa: 277, home: '2-1-1', road: '1-4-0', div: '2-1-0', conf: '2-4-1', strk: '2L' },
      { team: 'Commanders', wins: 3, losses: 6, ties: 0, pct: 0.333, pf: 201, pa: 236, home: '2-2-0', road: '1-4-0', div: '1-1-0', conf: '1-5-0', strk: '4L' },
      { team: 'Giants', wins: 2, losses: 7, ties: 0, pct: 0.222, pf: 197, pa: 249, home: '2-2-0', road: '0-5-0', div: '1-3-0', conf: '1-5-0', strk: '3L' }
    ],
    north: [
      { team: 'Packers', wins: 5, losses: 2, ties: 1, pct: 0.688, pf: 206, pa: 166, home: '3-1-0', road: '2-1-1', div: '1-0-0', conf: '3-1-1', strk: '1L' },
      { team: 'Lions', wins: 5, losses: 3, ties: 0, pct: 0.625, pf: 239, pa: 178, home: '3-1-0', road: '2-2-0', div: '1-2-0', conf: '2-2-0', strk: '1L' },
      { team: 'Bears', wins: 5, losses: 3, ties: 0, pct: 0.625, pf: 215, pa: 227, home: '2-1-0', road: '3-2-0', div: '0-2-0', conf: '3-2-0', strk: '1W' },
      { team: 'Vikings', wins: 4, losses: 4, ties: 0, pct: 0.500, pf: 182, pa: 186, home: '1-2-0', road: '3-2-0', div: '2-0-0', conf: '2-2-0', strk: '1W' }
    ],
    south: [
      { team: 'Buccaneers', wins: 6, losses: 2, ties: 0, pct: 0.750, pf: 197, pa: 178, home: '2-1-0', road: '4-1-0', div: '2-0-0', conf: '4-2-0', strk: '1W' },
      { team: 'Panthers', wins: 5, losses: 4, ties: 0, pct: 0.556, pf: 170, pa: 205, home: '3-1-0', road: '2-3-0', div: '1-0-0', conf: '3-1-0', strk: '1W' },
      { team: 'Falcons', wins: 3, losses: 5, ties: 0, pct: 0.375, pf: 143, pa: 178, home: '2-2-0', road: '1-3-0', div: '0-2-0', conf: '2-3-0', strk: '3L' },
      { team: 'Saints', wins: 1, losses: 8, ties: 0, pct: 0.111, pf: 138, pa: 243, home: '1-4-0', road: '0-4-0', div: '0-1-0', conf: '1-6-0', strk: '4L' }
    ],
    west: [
      { team: 'Seahawks', wins: 6, losses: 2, ties: 0, pct: 0.750, pf: 231, pa: 150, home: '2-2-0', road: '4-0-0', div: '1-1-0', conf: '3-2-0', strk: '3W' },
      { team: 'Rams', wins: 6, losses: 2, ties: 0, pct: 0.750, pf: 209, pa: 127, home: '3-1-0', road: '3-1-0', div: '0-1-0', conf: '1-2-0', strk: '3W' },
      { team: '49ers', wins: 6, losses: 3, ties: 0, pct: 0.667, pf: 194, pa: 188, home: '2-1-0', road: '4-2-0', div: '3-0-0', conf: '6-1-0', strk: '1W' },
      { team: 'Cardinals', wins: 3, losses: 5, ties: 0, pct: 0.375, pf: 180, pa: 171, home: '1-3-0', road: '2-2-0', div: '0-2-0', conf: '3-3-0', strk: '1W' }
    ]
  }
};
