/**
 * Configurations pour les sports américains
 */

// Configuration NBA
export const nbaConfig = {
  name: 'NBA',
  emoji: '🏀',
  storageKey: 'nba',
  matchesUrl: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
  standingsUrl: 'https://site.api.espn.com/apis/v2/sports/basketball/nba/standings',
  matchDuration: 3, // Durée estimée d'un match + buffer (heures)
  defaultTimeRange: { start: 1 * 60, end: 4 * 60 + 30 }, // 1h-4h30
  liveColor: '#ff9800', // Orange
  formatPeriod: (period) => `Q${period}`,
  checkMatchTime: (currentTime, matchTimeRange) => {
    return currentTime >= matchTimeRange.start && currentTime <= matchTimeRange.end;
  },
  fetchStandings: async () => {
    const response = await fetch('https://site.api.espn.com/apis/v2/sports/basketball/nba/standings');
    const standingsData = await response.json();
    
    if (standingsData?.children) {
      const formattedData = {
        eastern: { atlantic: [], central: [], southeast: [] },
        western: { northwest: [], pacific: [], southwest: [] }
      };

      standingsData.children.forEach(conference => {
        const confKey = conference.name.toLowerCase().includes('east') ? 'eastern' : 'western';
        
        if (conference.standings?.entries) {
          conference.standings.entries.forEach(entry => {
            const stats = entry.stats;
            const wins = parseInt(stats.find(s => s.name === 'wins')?.value || 0);
            const losses = parseInt(stats.find(s => s.name === 'losses')?.value || 0);
            
            const teamData = {
              team: entry.team.name,
              abbr: entry.team.abbreviation,
              wins: wins,
              losses: losses,
              pct: (wins / (wins + losses || 1)).toFixed(3),
              gb: stats.find(s => s.name === 'gamesBehind')?.displayValue || '-',
              home: stats.find(s => s.name === 'Home')?.displayValue || '0-0',
              road: stats.find(s => s.name === 'Road')?.displayValue || '0-0',
              conf: stats.find(s => s.name === 'vs. Conf.')?.displayValue || '0-0',
              div: stats.find(s => s.name === 'vs. Div.')?.displayValue || '0-0',
              strk: stats.find(s => s.name === 'streak')?.displayValue || '-'
            };

            const teamName = entry.team.name.toLowerCase();
            
            // Eastern Conference
            if (['celtics', 'nets', 'knicks', '76ers', 'raptors'].includes(teamName)) {
              formattedData[confKey].atlantic.push(teamData);
            } else if (['bulls', 'cavaliers', 'pistons', 'pacers', 'bucks'].includes(teamName)) {
              formattedData[confKey].central.push(teamData);
            } else if (['hawks', 'hornets', 'heat', 'magic', 'wizards'].includes(teamName)) {
              formattedData[confKey].southeast.push(teamData);
            }
            // Western Conference
            else if (['nuggets', 'timberwolves', 'thunder', 'trail blazers', 'jazz'].includes(teamName)) {
              formattedData[confKey].northwest.push(teamData);
            } else if (['warriors', 'clippers', 'lakers', 'suns', 'kings'].includes(teamName)) {
              formattedData[confKey].pacific.push(teamData);
            } else if (['mavericks', 'rockets', 'grizzlies', 'pelicans', 'spurs'].includes(teamName)) {
              formattedData[confKey].southwest.push(teamData);
            }
          });
        }
      });
      
      return formattedData;
    }
    return null;
  }
};

// Configuration NHL
export const nhlConfig = {
  name: 'NHL',
  emoji: '🏒',
  storageKey: 'nhl',
  matchesUrl: 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard',
  standingsUrl: 'https://site.api.espn.com/apis/v2/sports/hockey/nhl/standings',
  matchDuration: 3,
  defaultTimeRange: { start: 18 * 60, end: 6 * 60 }, // 18h-6h
  liveColor: '#64b5f6', // Bleu
  formatPeriod: (period) => period === 1 ? '1ère' : period === 2 ? '2ème' : period === 3 ? '3ème' : `${period}ème`,
  checkMatchTime: (currentTime, matchTimeRange) => {
    // NHL traverse minuit
    return currentTime >= matchTimeRange.start || currentTime <= matchTimeRange.end;
  },
  fetchStandings: async () => {
    const response = await fetch('https://site.api.espn.com/apis/v2/sports/hockey/nhl/standings');
    const standingsData = await response.json();
    
    if (standingsData?.children) {
      const formattedData = {
        eastern: { atlantic: [], metropolitan: [], wildcard: [] },
        western: { central: [], pacific: [], wildcard: [] }
      };

      standingsData.children.forEach(conference => {
        const confKey = conference.name.toLowerCase().includes('east') ? 'eastern' : 'western';
        
        if (conference.standings?.entries) {
          const allTeamsInConf = [];
          
          conference.standings.entries.forEach(entry => {
            const stats = entry.stats;
            const gp = parseInt(stats.find(s => s.name === 'gamesPlayed')?.value || 0);
            const wins = parseInt(stats.find(s => s.name === 'wins')?.value || 0);
            const losses = parseInt(stats.find(s => s.name === 'losses')?.value || 0);
            const otl = parseInt(stats.find(s => s.name === 'otLosses')?.value || 0);
            
            const teamData = {
              team: entry.team.displayName,
              abbr: entry.team.abbreviation,
              gp: gp,
              wins: wins,
              losses: losses,
              otl: otl,
              pts: wins * 2 + otl,
              rw: parseInt(stats.find(s => s.name === 'regulationWins')?.value || 0),
              row: parseInt(stats.find(s => s.name === 'regulationOvertimeWins')?.value || wins),
              gf: parseInt(stats.find(s => s.name === 'pointsFor')?.value || 0),
              ga: parseInt(stats.find(s => s.name === 'pointsAgainst')?.value || 0),
              home: stats.find(s => s.name === 'Home')?.displayValue || '0-0-0',
              away: stats.find(s => s.name === 'Road')?.displayValue || '0-0-0',
              strk: stats.find(s => s.name === 'streak')?.displayValue || '-'
            };
            
            allTeamsInConf.push(teamData);
            
            const teamName = entry.team.name.toLowerCase();
            
            // Atlantic
            if (['bruins', 'sabres', 'red wings', 'panthers', 'canadiens', 'senators', 'lightning', 'maple leafs'].includes(teamName)) {
              formattedData[confKey].atlantic.push(teamData);
            }
            // Metropolitan
            else if (['hurricanes', 'blue jackets', 'devils', 'islanders', 'rangers', 'flyers', 'penguins', 'capitals'].includes(teamName)) {
              formattedData[confKey].metropolitan.push(teamData);
            }
            // Central
            else if (['blackhawks', 'avalanche', 'stars', 'wild', 'predators', 'blues', 'jets'].includes(teamName)) {
              formattedData[confKey].central.push(teamData);
            }
            // Pacific
            else if (['ducks', 'flames', 'oilers', 'kings', 'sharks', 'kraken', 'canucks', 'golden knights'].includes(teamName)) {
              formattedData[confKey].pacific.push(teamData);
            }
          });

          // Calculer les wild cards
          allTeamsInConf.sort((a, b) => {
            if (b.pts !== a.pts) return b.pts - a.pts;
            if (b.row !== a.row) return b.row - a.row;
            return b.gf - a.gf;
          });
          
          formattedData[confKey].wildcard = allTeamsInConf.slice(6, 8);
        }
      });
      
      return formattedData;
    }
    return null;
  }
};

// Configuration NFL
export const nflConfig = {
  name: 'NFL',
  emoji: '🏈',
  storageKey: 'nfl',
  matchesUrl: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
  standingsUrl: 'https://site.api.espn.com/apis/v2/sports/football/nfl/standings',
  matchDuration: 4,
  defaultTimeRange: null, // Sera calculé dynamiquement
  liveColor: '#4caf50', // Vert
  formatPeriod: (period) => `Q${period}`,
  checkMatchTime: (currentTime, matchTimeRange) => {
    // NFL peut traverser minuit
    return currentTime >= matchTimeRange.start || currentTime <= matchTimeRange.end;
  },
  fetchStandings: async () => {
    const response = await fetch('https://site.api.espn.com/apis/v2/sports/football/nfl/standings');
    const standingsData = await response.json();
    
    if (standingsData?.children) {
      const formattedData = {
        afc: { east: [], north: [], south: [], west: [] },
        nfc: { east: [], north: [], south: [], west: [] }
      };

      standingsData.children.forEach(conference => {
        const confKey = conference.abbreviation.toLowerCase();
        
        if (conference.standings?.entries) {
          conference.standings.entries.forEach(entry => {
            const stats = entry.stats;
            const wins = parseInt(stats.find(s => s.name === 'wins')?.value || 0);
            const losses = parseInt(stats.find(s => s.name === 'losses')?.value || 0);
            const ties = parseInt(stats.find(s => s.name === 'ties')?.value || 0);
            
            const teamData = {
              team: entry.team.displayName,
              wins: wins,
              losses: losses,
              ties: ties,
              pct: ties > 0 ? (wins + ties * 0.5) / (wins + losses + ties) : (wins / (wins + losses || 1)),
              pf: parseInt(stats.find(s => s.name === 'pointsFor')?.value || 0),
              pa: parseInt(stats.find(s => s.name === 'pointsAgainst')?.value || 0),
              home: stats.find(s => s.name === 'Home')?.displayValue || '0-0-0',
              road: stats.find(s => s.name === 'Road')?.displayValue || '0-0-0',
              div: stats.find(s => s.name === 'divisionRecord')?.displayValue || '0-0-0',
              conf: stats.find(s => s.name === 'vs. Conf.')?.displayValue || '0-0-0',
              strk: stats.find(s => s.name === 'streak')?.displayValue || '-'
            };

            const teamName = entry.team.name.toLowerCase();
            
            // AFC
            if (['bills', 'dolphins', 'patriots', 'jets'].includes(teamName)) {
              formattedData[confKey].east.push(teamData);
            } else if (['ravens', 'bengals', 'browns', 'steelers'].includes(teamName)) {
              formattedData[confKey].north.push(teamData);
            } else if (['colts', 'texans', 'jaguars', 'titans'].includes(teamName)) {
              formattedData[confKey].south.push(teamData);
            } else if (['broncos', 'chiefs', 'raiders', 'chargers'].includes(teamName)) {
              formattedData[confKey].west.push(teamData);
            }
            // NFC
            else if (['cowboys', 'giants', 'eagles', 'commanders'].includes(teamName)) {
              formattedData[confKey].east.push(teamData);
            } else if (['bears', 'lions', 'packers', 'vikings'].includes(teamName)) {
              formattedData[confKey].north.push(teamData);
            } else if (['falcons', 'panthers', 'saints', 'buccaneers'].includes(teamName)) {
              formattedData[confKey].south.push(teamData);
            } else if (['cardinals', 'rams', '49ers', 'seahawks'].includes(teamName)) {
              formattedData[confKey].west.push(teamData);
            }
          });
        }
      });
      
      return formattedData;
    }
    return null;
  }
};
