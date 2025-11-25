/**
 * Données de classement NHL par défaut
 * Source: Données actuelles de la saison 2024-2025
 */

export const currentNHLStandings = [
  {
    name: 'Eastern Conference',
    abbreviation: 'EST',
    standings: [
      {
        team: {
          id: '7',
          name: 'Carolina Hurricanes',
          shortName: 'Hurricanes',
          abbreviation: 'CAR',
          logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/car.png'
        },
        stats: {
          gamesPlayed: 22,
          wins: 14,
          losses: 8,
          otLosses: 2,
          points: 30,
          pointPercent: 0.682,
          goalsFor: 71,
          goalsAgainst: 58,
          goalDifferential: 13,
          streak: 'L1',
          playoffSeed: 1
        }
      },
      {
        team: {
          id: '12',
          name: 'New York Islanders',
          shortName: 'Islanders',
          abbreviation: 'NYI',
          logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/nyi.png'
        },
        stats: {
          gamesPlayed: 23,
          wins: 13,
          losses: 10,
          otLosses: 2,
          points: 28,
          pointPercent: 0.609,
          goalsFor: 63,
          goalsAgainst: 58,
          goalDifferential: 5,
          streak: 'W1',
          playoffSeed: 2
        }
      },
      {
        team: {
          id: '1',
          name: 'New Jersey Devils',
          shortName: 'Devils',
          abbreviation: 'NJ',
          logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/nj.png'
        },
        stats: {
          gamesPlayed: 21,
          wins: 13,
          losses: 8,
          otLosses: 1,
          points: 27,
          pointPercent: 0.643,
          goalsFor: 64,
          goalsAgainst: 63,
          goalDifferential: 1,
          streak: 'L1',
          playoffSeed: 3
        }
      },
      {
        team: {
          id: '11',
          name: 'Detroit Red Wings',
          shortName: 'Red Wings',
          abbreviation: 'DET',
          logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/det.png'
        },
        stats: {
          gamesPlayed: 22,
          wins: 13,
          losses: 9,
          otLosses: 1,
          points: 27,
          pointPercent: 0.614,
          goalsFor: 62,
          goalsAgainst: 66,
          goalDifferential: -4,
          streak: 'W1',
          playoffSeed: 4
        }
      },
      {
        team: {
          id: '14',
          name: 'Tampa Bay Lightning',
          shortName: 'Lightning',
          abbreviation: 'TB',
          logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/tb.png'
        },
        stats: {
          gamesPlayed: 21,
          wins: 12,
          losses: 9,
          otLosses: 2,
          points: 26,
          pointPercent: 0.619,
          goalsFor: 68,
          goalsAgainst: 62,
          goalDifferential: 6,
          streak: 'W1',
          playoffSeed: 5
        }
      },
      {
        team: {
          id: '9',
          name: 'Ottawa Senators',
          shortName: 'Senators',
          abbreviation: 'OTT',
          logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/ott.png'
        },
        stats: {
          gamesPlayed: 21,
          wins: 11,
          losses: 10,
          otLosses: 4,
          points: 26,
          pointPercent: 0.619,
          goalsFor: 65,
          goalsAgainst: 64,
          goalDifferential: 1,
          streak: 'W1',
          playoffSeed: 6
        }
      },
      {
        team: {
          id: '1',
          name: 'Boston Bruins',
          shortName: 'Bruins',
          abbreviation: 'BOS',
          logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/bos.png'
        },
        stats: {
          gamesPlayed: 24,
          wins: 13,
          losses: 11,
          otLosses: 0,
          points: 26,
          pointPercent: 0.542,
          goalsFor: 66,
          goalsAgainst: 68,
          goalDifferential: -2,
          streak: 'L1',
          playoffSeed: 7
        }
      },
      {
        team: {
          id: '4',
          name: 'Philadelphia Flyers',
          shortName: 'Flyers',
          abbreviation: 'PHI',
          logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/phi.png'
        },
        stats: {
          gamesPlayed: 20,
          wins: 11,
          losses: 9,
          otLosses: 3,
          points: 25,
          pointPercent: 0.625,
          goalsFor: 61,
          goalsAgainst: 57,
          goalDifferential: 4,
          streak: 'W1',
          playoffSeed: 8
        }
      },
      {
        team: {
          id: '5',
          name: 'Pittsburgh Penguins',
          shortName: 'Penguins',
          abbreviation: 'PIT',
          logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/pit.png'
        },
        stats: {
          gamesPlayed: 21,
          wins: 10,
          losses: 11,
          otLosses: 5,
          points: 25,
          pointPercent: 0.595,
          goalsFor: 68,
          goalsAgainst: 62,
          goalDifferential: 6,
          streak: 'L1',
          playoffSeed: 9
        }
      },
      {
        team: {
          id: '8',
          name: 'Montreal Canadiens',
          shortName: 'Canadiens',
          abbreviation: 'MTL',
          logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/mtl.png'
        },
        stats: {
          gamesPlayed: 21,
          wins: 11,
          losses: 10,
          otLosses: 3,
          points: 25,
          pointPercent: 0.595,
          goalsFor: 61,
          goalsAgainst: 65,
          goalDifferential: -4,
          streak: 'W1',
          playoffSeed: 10
        }
      },
      {
        team: {
          id: '29',
          name: 'Columbus Blue Jackets',
          shortName: 'Blue Jackets',
          abbreviation: 'CBJ',
          logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/cbj.png'
        },
        stats: {
          gamesPlayed: 22,
          wins: 11,
          losses: 11,
          otLosses: 3,
          points: 25,
          pointPercent: 0.568,
          goalsFor: 67,
          goalsAgainst: 70,
          goalDifferential: -3,
          streak: 'L1',
          playoffSeed: 11
        }
      },
      {
        team: {
          id: '15',
          name: 'Washington Capitals',
          shortName: 'Capitals',
          abbreviation: 'WSH',
          logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/wsh.png'
        },
        stats: {
          gamesPlayed: 22,
          wins: 11,
          losses: 11,
          otLosses: 2,
          points: 24,
          pointPercent: 0.545,
          goalsFor: 71,
          goalsAgainst: 62,
          goalDifferential: 9,
          streak: 'L1',
          playoffSeed: 12
        }
      },
      {
        team: {
          id: '13',
          name: 'Florida Panthers',
          shortName: 'Panthers',
          abbreviation: 'FLA',
          logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/fla.png'
        },
        stats: {
          gamesPlayed: 21,
          wins: 11,
          losses: 10,
          otLosses: 1,
          points: 23,
          pointPercent: 0.548,
          goalsFor: 64,
          goalsAgainst: 67,
          goalDifferential: -3,
          streak: 'L1',
          playoffSeed: 13
        }
      },
      {
        team: {
          id: '2',
          name: 'Buffalo Sabres',
          shortName: 'Sabres',
          abbreviation: 'BUF',
          logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/buf.png'
        },
        stats: {
          gamesPlayed: 22,
          wins: 9,
          losses: 13,
          otLosses: 4,
          points: 22,
          pointPercent: 0.500,
          goalsFor: 62,
          goalsAgainst: 66,
          goalDifferential: -4,
          streak: 'W1',
          playoffSeed: 14
        }
      },
      {
        team: {
          id: '3',
          name: 'New York Rangers',
          shortName: 'Rangers',
          abbreviation: 'NYR',
          logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/nyr.png'
        },
        stats: {
          gamesPlayed: 23,
          wins: 10,
          losses: 13,
          otLosses: 2,
          points: 22,
          pointPercent: 0.478,
          goalsFor: 65,
          goalsAgainst: 68,
          goalDifferential: -3,
          streak: 'L1',
          playoffSeed: 15
        }
      },
      {
        team: {
          id: '10',
          name: 'Toronto Maple Leafs',
          shortName: 'Maple Leafs',
          abbreviation: 'TOR',
          logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/tor.png'
        },
        stats: {
          gamesPlayed: 22,
          wins: 9,
          losses: 13,
          otLosses: 3,
          points: 21,
          pointPercent: 0.477,
          goalsFor: 58,
          goalsAgainst: 66,
          goalDifferential: -8,
          streak: 'L1',
          playoffSeed: 16
        }
      }
    ]
  },
  {
    name: 'Western Conference',
    abbreviation: 'WST',
    standings: [
      {
        team: {
          id: '17',
          name: 'Colorado Avalanche',
          shortName: 'Avalanche',
          abbreviation: 'COL',
          logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/col.png'
        },
        stats: {
          gamesPlayed: 22,
          wins: 16,
          losses: 6,
          otLosses: 5,
          points: 37,
          pointPercent: 0.841,
          goalsFor: 88,
          goalsAgainst: 50,
          goalDifferential: 38,
          streak: 'W5',
          playoffSeed: 1
        }
      },
      {
        team: {
          id: '25',
          name: 'Dallas Stars',
          shortName: 'Stars',
          abbreviation: 'DAL',
          logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/dal.png'
        },
        stats: {
          gamesPlayed: 22,
          wins: 13,
          losses: 9,
          otLosses: 4,
          points: 30,
          pointPercent: 0.682,
          goalsFor: 67,
          goalsAgainst: 57,
          goalDifferential: 10,
          streak: 'L1',
          playoffSeed: 2
        }
      },
      {
        team: {
          id: '24',
          name: 'Anaheim Ducks',
          shortName: 'Ducks',
          abbreviation: 'ANA',
          logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/ana.png'
        },
        stats: {
          gamesPlayed: 22,
          wins: 14,
          losses: 8,
          otLosses: 1,
          points: 29,
          pointPercent: 0.659,
          goalsFor: 70,
          goalsAgainst: 59,
          goalDifferential: 11,
          streak: 'W1',
          playoffSeed: 3
        }
      },
      {
        team: {
          id: '124292',
          name: 'Seattle Kraken',
          shortName: 'Kraken',
          abbreviation: 'SEA',
          logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/sea.png'
        },
        stats: {
          gamesPlayed: 22,
          wins: 11,
          losses: 11,
          otLosses: 6,
          points: 28,
          pointPercent: 0.636,
          goalsFor: 63,
          goalsAgainst: 65,
          goalDifferential: -2,
          streak: 'L1',
          playoffSeed: 4
        }
      },
      {
        team: {
          id: '30',
          name: 'Minnesota Wild',
          shortName: 'Wild',
          abbreviation: 'MIN',
          logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/min.png'
        },
        stats: {
          gamesPlayed: 23,
          wins: 12,
          losses: 11,
          otLosses: 4,
          points: 28,
          pointPercent: 0.609,
          goalsFor: 69,
          goalsAgainst: 65,
          goalDifferential: 4,
          streak: 'W4',
          playoffSeed: 5
        }
      },
      {
        team: {
          id: '16',
          name: 'Vegas Golden Knights',
          shortName: 'Golden Knights',
          abbreviation: 'VGK',
          logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/vgk.png'
        },
        stats: {
          gamesPlayed: 21,
          wins: 10,
          losses: 11,
          otLosses: 7,
          points: 27,
          pointPercent: 0.643,
          goalsFor: 70,
          goalsAgainst: 63,
          goalDifferential: 7,
          streak: 'L1',
          playoffSeed: 6
        }
      },
      {
        team: {
          id: '26',
          name: 'Los Angeles Kings',
          shortName: 'Kings',
          abbreviation: 'LA',
          logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/la.png'
        },
        stats: {
          gamesPlayed: 22,
          wins: 10,
          losses: 12,
          otLosses: 6,
          points: 26,
          pointPercent: 0.591,
          goalsFor: 64,
          goalsAgainst: 67,
          goalDifferential: -3,
          streak: 'L1',
          playoffSeed: 7
        }
      },
      {
        team: {
          id: '21',
          name: 'Utah Hockey Club',
          shortName: 'Mammoth',
          abbreviation: 'UTA',
          logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/uta.png'
        },
        stats: {
          gamesPlayed: 22,
          wins: 11,
          losses: 11,
          otLosses: 3,
          points: 25,
          pointPercent: 0.568,
          goalsFor: 64,
          goalsAgainst: 65,
          goalDifferential: -1,
          streak: 'W1',
          playoffSeed: 8
        }
      },
      {
        team: {
          id: '18',
          name: 'San Jose Sharks',
          shortName: 'Sharks',
          abbreviation: 'SJ',
          logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/sj.png'
        },
        stats: {
          gamesPlayed: 23,
          wins: 11,
          losses: 12,
          otLosses: 3,
          points: 25,
          pointPercent: 0.543,
          goalsFor: 66,
          goalsAgainst: 70,
          goalDifferential: -4,
          streak: 'W1',
          playoffSeed: 9
        }
      },
      {
        team: {
          id: '22',
          name: 'Edmonton Oilers',
          shortName: 'Oilers',
          abbreviation: 'EDM',
          logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/edm.png'
        },
        stats: {
          gamesPlayed: 24,
          wins: 10,
          losses: 14,
          otLosses: 5,
          points: 25,
          pointPercent: 0.521,
          goalsFor: 68,
          goalsAgainst: 81,
          goalDifferential: -13,
          streak: 'W1',
          playoffSeed: 10
        }
      },
      {
        team: {
          id: '28',
          name: 'Winnipeg Jets',
          shortName: 'Jets',
          abbreviation: 'WPG',
          logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/wpg.png'
        },
        stats: {
          gamesPlayed: 21,
          wins: 12,
          losses: 9,
          otLosses: 0,
          points: 24,
          pointPercent: 0.571,
          goalsFor: 65,
          goalsAgainst: 57,
          goalDifferential: 8,
          streak: 'L2',
          playoffSeed: 11
        }
      },
      {
        team: {
          id: '4',
          name: 'Chicago Blackhawks',
          shortName: 'Blackhawks',
          abbreviation: 'CHI',
          logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png'
        },
        stats: {
          gamesPlayed: 22,
          wins: 10,
          losses: 12,
          otLosses: 4,
          points: 24,
          pointPercent: 0.545,
          goalsFor: 68,
          goalsAgainst: 61,
          goalDifferential: 7,
          streak: 'L1',
          playoffSeed: 12
        }
      },
      {
        team: {
          id: '19',
          name: 'St. Louis Blues',
          shortName: 'Blues',
          abbreviation: 'STL',
          logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/stl.png'
        },
        stats: {
          gamesPlayed: 22,
          wins: 7,
          losses: 15,
          otLosses: 6,
          points: 20,
          pointPercent: 0.455,
          goalsFor: 55,
          goalsAgainst: 78,
          goalDifferential: -23,
          streak: 'W1',
          playoffSeed: 13
        }
      },
      {
        team: {
          id: '22',
          name: 'Vancouver Canucks',
          shortName: 'Canucks',
          abbreviation: 'VAN',
          logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/van.png'
        },
        stats: {
          gamesPlayed: 23,
          wins: 9,
          losses: 14,
          otLosses: 2,
          points: 20,
          pointPercent: 0.435,
          goalsFor: 63,
          goalsAgainst: 78,
          goalDifferential: -15,
          streak: 'L2',
          playoffSeed: 14
        }
      },
      {
        team: {
          id: '3',
          name: 'Calgary Flames',
          shortName: 'Flames',
          abbreviation: 'CGY',
          logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/cgy.png'
        },
        stats: {
          gamesPlayed: 24,
          wins: 8,
          losses: 16,
          otLosses: 3,
          points: 19,
          pointPercent: 0.396,
          goalsFor: 64,
          goalsAgainst: 78,
          goalDifferential: -14,
          streak: 'W3',
          playoffSeed: 15
        }
      },
      {
        team: {
          id: '6',
          name: 'Nashville Predators',
          shortName: 'Predators',
          abbreviation: 'NSH',
          logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/nsh.png'
        },
        stats: {
          gamesPlayed: 21,
          wins: 6,
          losses: 15,
          otLosses: 4,
          points: 16,
          pointPercent: 0.381,
          goalsFor: 51,
          goalsAgainst: 75,
          goalDifferential: -24,
          streak: 'L1',
          playoffSeed: 16
        }
      }
    ]
  }
];
