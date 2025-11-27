require('dotenv').config();
const axios = require('axios');
const ftp = require('basic-ftp');
const fs = require('fs').promises;
const path = require('path');
const Parser = require('rss-parser');
const { calculateLiveStandings } = require('./standings-calculator');

// Configuration
const CONFIG = {
  ftp: {
    host: process.env.FTP_HOST,
    port: parseInt(process.env.FTP_PORT) || 21,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    secure: false,
    remotePath: process.env.FTP_REMOTE_PATH || '/www/actu/data'
  },
  sportsUpdateInterval: parseInt(process.env.SPORTS_UPDATE_INTERVAL) || 10000,
  newsUpdateInterval: parseInt(process.env.NEWS_UPDATE_INTERVAL) || 3600000,
  outputDir: path.join(__dirname, 'output'),
  debug: process.env.DEBUG === 'true',
  // Heures de mise à jour quotidienne
  updateHours: {
    football: 5.0,      // 5h00 pour toutes les ligues de football
    european: 23.75,    // 23h45 pour les championnats européens
    american: 6.5       // 6h30 pour NBA, NFL, NHL
  },
  // Timeout et retry
  timeout: 15000,
  maxRetries: 3,
  retryDelay: 2000,
  // Cache TheSportsDB - mise à jour 3 fois par semaine (lundi, mercredi, vendredi)
  theSportsDBCache: {
    updateDays: [1, 3, 5], // 1=Lundi, 3=Mercredi, 5=Vendredi
    updateHour: 4.0, // 4h00 du matin
    cacheFile: path.join(__dirname, 'output', 'thesportsdb-cache.json')
  }
};

// TheSportsDB League IDs pour enrichir les matchs à venir
const THESPORTSDB_LEAGUES = {
  ligue1: { id: '4334', name: 'French Ligue 1' },
  ligue2: { id: '4335', name: 'French Ligue 2' },
  premierLeague: { id: '4328', name: 'English Premier League' },
  laLiga: { id: '4335', name: 'Spanish La Liga' },
  serieA: { id: '4332', name: 'Italian Serie A' },
  bundesliga: { id: '4331', name: 'German Bundesliga' },
  brasileirao: { id: '4351', name: 'Brazilian Serie A' }
};

// SofaScore Tournament IDs pour les classements (Saison 2024-2025)
// Note: Utilise unique-tournament ID (pas tournament ID) pour l'API standings
const SOFASCORE_TOURNAMENTS = {
  ligue1: { id: 34, season: 77356, name: 'Ligue 1' },           // ✅ Vérifié 27/11/2025
  ligue2: { id: 182, season: 77357, name: 'Ligue 2' },          // ✅ Vérifié 27/11/2025
  premierLeague: { id: 17, season: 76986, name: 'Premier League' }, // ✅ Vérifié 27/11/2025 (Saison 2025-2026)
  laLiga: { id: 8, season: 77559, name: 'La Liga' },            // ✅ Vérifié 27/11/2025
  serieA: { id: 23, season: 76457, name: 'Serie A' },           // ✅ Vérifié 27/11/2025
  bundesliga: { id: 35, season: 77333, name: 'Bundesliga' },    // ✅ Vérifié 27/11/2025
  brasileirao: { id: 325, season: 72034, name: 'Brasileirão' }, // ✅ Vérifié 27/11/2025
  championsLeague: { id: 7, season: 76953, name: 'Champions League' },
  can: { id: 270, season: 71636, name: 'CAN 2025' },         // ⚠️ Tournoi pas encore commencé
  nba: { id: 132, season: 80229, name: 'NBA' },                 // ✅ Vérifié 27/11/2025 (Eastern Conference)
  nhl: { id: 234, season: 78476, name: 'NHL' },                 // ✅ Vérifié 27/11/2025
  nfl: { id: 108947, season: 75522, name: 'NFL' }
};

// ESPN Sports Competitions avec plages horaires de matchs
const ESPN_COMPETITIONS = {
  ligue1: {
    name: 'Ligue 1',
    scoreboard: 'https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/scoreboard',
    output: 'ligue1.json',
    matchHours: { start: 17, end: 23.5 },
    matchDays: [5, 6, 0] // Vendredi, Samedi, Dimanche
  },
  ligue2: {
    name: 'Ligue 2',
    scoreboard: 'https://site.api.espn.com/apis/site/v2/sports/soccer/fra.2/scoreboard',
    output: 'ligue2.json',
    matchHours: { start: 19, end: 23.5 },
    matchDays: [5, 6, 1] // Vendredi, Lundi
  },
  premierLeague: {
    name: 'Premier League',
    scoreboard: 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard',
    output: 'premierleague.json',
    matchHours: { start: 13, end: 23.5 },
    matchDays: [6, 0, 1] // Samedi, Dimanche, Lundi
  },
  laLiga: {
    name: 'La Liga',
    scoreboard: 'https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard',
    output: 'laliga.json',
    matchHours: { start: 14, end: 23.75 },
    matchDays: [5, 6, 0, 1] // Vendredi, Samedi, Dimanche, Lundi
  },
  serieA: {
    name: 'Serie A',
    scoreboard: 'https://site.api.espn.com/apis/site/v2/sports/soccer/ita.1/scoreboard',
    output: 'seriea.json',
    matchHours: { start: 12, end: 23.5 },
    matchDays: [6, 0, 1] // Samedi, Dimanche, Lundi
  },
  bundesliga: {
    name: 'Bundesliga',
    scoreboard: 'https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/scoreboard',
    output: 'bundesliga.json',
    matchHours: { start: 15, end: 23.5 },
    matchDays: [5, 6, 0] // Vendredi, Samedi, Dimanche
  },
  brasileirao: {
    name: 'Brasileirão Série A',
    scoreboard: 'https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/scoreboard',
    output: 'brasileirao.json',
    matchHours: { start: 21, end: 7.5 },
    matchDays: [3, 4, 6, 0] // Mercredi, Jeudi, Samedi, Dimanche
  },
  can: {
    name: 'CAN 2025',
    scoreboard: 'https://site.api.espn.com/apis/site/v2/sports/soccer/caf.nations/scoreboard',
    output: 'can2025.json',
    matchHours: { start: 17, end: 23.5 },
    matchDays: [0, 1, 2, 3, 4, 5, 6] // Tous les jours
  },
  championsLeague: {
    name: 'Champions League',
    scoreboard: 'https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard',
    output: 'championsleague.json',
    matchSchedule: [
      { day: 2, start: 17, end: 23.33 }, // Mardi: 17h-23h20
      { day: 3, start: 17, end: 23.33 }  // Mercredi: 17h-23h20
    ]
  },
  nba: {
    name: 'NBA',
    scoreboard: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
    output: 'nba.json',
    matchHours: { start: 0, end: 7 },
    matchDays: [0, 1, 2, 3, 4, 5, 6], // Tous les jours
    dailyUpdateHour: 6.5
  },
  nfl: {
    name: 'NFL',
    scoreboard: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
    output: 'nfl.json',
    matchSchedule: [
      { day: 5, start: 2, end: 6.5 },   // Vendredi 2h-6h30
      { day: 0, start: 19, end: 6.5 },  // Dimanche 19h-Lundi 6h30
      { day: 2, start: 2, end: 6.5 }    // Mardi 2h-6h30
    ],
    dailyUpdateHour: 6.5
  },
  nhl: {
    name: 'NHL',
    scoreboard: 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard',
    output: 'nhl.json',
    matchHours: { start: 0, end: 7 },
    matchDays: [0, 1, 2, 3, 4, 5, 6], // Tous les jours
    dailyUpdateHour: 6.5
  }
};

// RSS News Feeds (Actualités)
const NEWS_FEEDS = {
  france: {
    name: 'Actualités France',
    url: 'https://www.franceinfo.fr/france.rss',
    output: 'actus-france.json',
    maxItems: 15
  },
  monde: {
    name: 'Actualités Monde',
    url: 'https://www.franceinfo.fr/monde.rss',
    output: 'actus-monde.json',
    maxItems: 15
  }
};

// RSS Culture Feeds
const CULTURE_FEEDS = {
  cinema: {
    name: 'Cinéma',
    url: 'https://www.franceinfo.fr/culture/cinema.rss',
    output: 'culture-cinema.json',
    maxItems: 10
  },
  musique: {
    name: 'Musique',
    url: 'https://www.franceinfo.fr/culture/musique.rss',
    output: 'culture-musique.json',
    maxItems: 10
  },
  jeuxvideo: {
    name: 'Jeux Vidéo',
    url: 'https://www.jeuxvideo.com/rss/rss.xml',
    output: 'culture-jeuxvideo.json',
    maxItems: 20
  },
  sante: {
    name: 'Santé',
    url: 'https://www.franceinfo.fr/sante.rss',
    output: 'culture-sante.json',
    maxItems: 10
  },
  sciences: {
    name: 'Sciences',
    url: 'https://www.franceinfo.fr/sciences.rss',
    output: 'culture-sciences.json',
    maxItems: 10
  },
  litterature: {
    name: 'Littérature',
    url: 'https://www.nouvelobs.com/culture/rss.xml',
    output: 'culture-litterature.json',
    maxItems: 10,
    filter: 'livre' // Filtre pour ne garder que les articles sur les livres
  }
};

// RSS Mercato Feeds
const MERCATO_FEEDS = {
  maxifoot: {
    name: 'Mercato Maxifoot',
    url: 'https://www.maxifoot.fr/rss/news-mercato.xml',
    output: 'mercato-maxifoot.json',
    maxItems: 15
  },
  rmcsport: {
    name: 'Mercato RMC Sport',
    url: 'https://rmcsport.bfmtv.com/rss/football/mercato/',
    output: 'mercato-rmcsport.json',
    maxItems: 15
  },
  le10sport: {
    name: 'Mercato Le 10 Sport',
    url: 'https://le10sport.com/rss',
    output: 'mercato-le10sport.json',
    maxItems: 15,
    filter: 'mercato'
  },
  footmercato: {
    name: 'Mercato Foot Mercato',
    url: 'https://www.footmercato.net/rss/all.xml',
    output: 'mercato-footmercato.json',
    maxItems: 15,
    filter: 'mercato'
  }
};

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
});

// Fonction de log
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  console.log(`${prefix} ${message}`);
}

// Créer le dossier de sortie
async function ensureOutputDir() {
  try {
    await fs.mkdir(CONFIG.outputDir, { recursive: true });
    log(`Dossier de sortie créé/vérifié: ${CONFIG.outputDir}`);
  } catch (error) {
    log(`Erreur création dossier: ${error.message}`, 'error');
    throw error;
  }
}

// ==================== ESPN SPORTS ====================

function categorizeMatches(events) {
  if (!events?.length) {
    return { completed: [], live: [], upcoming: [] };
  }
  
  const now = new Date();
  const categorized = { completed: [], live: [], upcoming: [] };

  for (const event of events) {
    const state = event.status?.type?.state;
    
    switch (state) {
      case 'post':
        categorized.completed.push(event);
        break;
      case 'in':
        categorized.live.push(event);
        break;
      case 'pre':
        if (new Date(event.date) > now) {
          categorized.upcoming.push(event);
        }
        break;
      default:
        // États inconnus ignorés
        break;
    }
  }
  
  return categorized;
}

// Configuration des conférences pour récupération séparée
const CONFERENCE_CONFIGS = {
  nhl: {
    tournamentId: 142,
    conferences: ['Eastern%20Conference', 'Western%20Conference'],
    names: ['Eastern Conference', 'Western Conference']
  },
  nba: {
    tournamentId: 177,
    conferences: ['NBA%20Eastern%20Conference', 'NBA%20Western%20Conference'],
    names: ['Eastern Conference', 'Western Conference']
  },
  nfl: {
    tournamentId: 108947,
    conferences: ['NFL%2025%2F26%2C%20NFC', 'NFL%2025%2F26%2C%20AFC'],
    names: ['NFC', 'AFC']
  }
};

// Récupérer classement depuis SofaScore avec retry
async function fetchSofaScoreStandings(leagueKey, retryCount = 0) {
  const tournament = SOFASCORE_TOURNAMENTS[leagueKey];
  if (!tournament) {
    log(`⚠️ Tournoi inconnu: ${leagueKey}`, 'warn');
    return [];
  }
  
  try {
    // Pour NHL, NBA, NFL : récupérer chaque conférence séparément
    const conferenceConfig = CONFERENCE_CONFIGS[leagueKey];
    if (conferenceConfig) {
      const allConferences = [];
      
      for (let i = 0; i < conferenceConfig.conferences.length; i++) {
        const confName = conferenceConfig.conferences[i];
        const displayName = conferenceConfig.names[i];
        const url = `https://api.sofascore.com/api/v1/unique-tournament/${conferenceConfig.tournamentId}/season/${tournament.season}/standings/${confName}`;
        
        try {
          const response = await axios.get(url, {
            timeout: CONFIG.timeout,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
          });
          
          const standingsGroups = response.data?.standings;
          if (standingsGroups?.length > 0 && standingsGroups[0]?.rows) {
            const standings = standingsGroups[0].rows.map((t, idx) => ({
              position: t.position || idx + 1,
              team: t.team?.name,
              teamId: t.team?.id,
              logo: `https://api.sofascore.com/api/v1/team/${t.team?.id}/image`,
              played: t.matches || 0,
              wins: t.wins || 0,
              draws: t.draws || 0,
              losses: t.losses || 0,
              points: t.points || 0,
              goalsFor: t.scoresFor || 0,
              goalsAgainst: t.scoresAgainst || 0,
              goalDifference: (t.scoresFor || 0) - (t.scoresAgainst || 0)
            }));
            
            allConferences.push({
              name: displayName,
              standings: standings
            });
            
            log(`✓ ${tournament.name} - ${displayName}: ${standings.length} équipes`);
          }
        } catch (confError) {
          log(`⚠️ ${tournament.name} - ${displayName}: ${confError.message}`, 'warn');
        }
      }
      
      if (allConferences.length > 0) {
        log(`✓ ${tournament.name}: ${allConferences.length} conférences récupérées`);
        return allConferences;
      }
    }
    
    // Pour les autres ligues (football européen) : URL /standings/total
    const url = `https://api.sofascore.com/api/v1/unique-tournament/${tournament.id}/season/${tournament.season}/standings/total`;
    
    const response = await axios.get(url, {
      timeout: CONFIG.timeout,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    
    const standingsGroups = response.data?.standings;
    if (!standingsGroups?.length) {
      log(`⚠️ ${tournament.name}: Aucune donnée de classement`, 'warn');
      return [];
    }
    
    // Pour les ligues simples (football européen), format plat
    const rows = standingsGroups[0]?.rows;
    if (!rows?.length) {
      log(`⚠️ ${tournament.name}: Aucune équipe`, 'warn');
      return [];
    }
    
    const standings = rows.map((t, i) => ({
      position: t.position || i + 1,
      team: t.team?.name,
      teamId: t.team?.id,
      logo: `https://api.sofascore.com/api/v1/team/${t.team?.id}/image`,
      played: t.matches || 0,
      wins: t.wins || 0,
      draws: t.draws || 0,
      losses: t.losses || 0,
      points: t.points || 0,
      goalsFor: t.scoresFor || 0,
      goalsAgainst: t.scoresAgainst || 0,
      goalDifference: (t.scoresFor || 0) - (t.scoresAgainst || 0)
    }));
    
    log(`✓ ${tournament.name}: ${standings.length} équipes`);
    return standings;
  } catch (error) {
    if (retryCount < CONFIG.maxRetries) {
      log(`⚠️ Retry ${retryCount + 1}/${CONFIG.maxRetries} pour ${tournament.name}`, 'warn');
      await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay));
      return fetchSofaScoreStandings(leagueKey, retryCount + 1);
    }
    log(`✗ Erreur SofaScore ${tournament.name}: ${error.message}`, 'error');
    return [];
  }
}

// Vérifier si on doit mettre à jour les standings (après fin de journée)
function shouldUpdateStandings(matchData) {
  const { completed, live } = matchData;
  
  // Pas de mise à jour si pas de matchs terminés ou des matchs en cours
  if (!completed.length || live.length > 0) {
    return false;
  }
  
  // Vérifier si le dernier match terminé date de moins de 2h
  const lastMatchDate = new Date(completed[completed.length - 1].date);
  const hoursSince = (Date.now() - lastMatchDate.getTime()) / (1000 * 60 * 60);
  
  return hoursSince < 2;
}

async function fetchESPNCompetition(key, competition, forceStandingsUpdate = false) {
  const outputPath = path.join(CONFIG.outputDir, competition.output);
  
  try {
    // Fetch scoreboard ESPN
    const scoreboardRes = await axios.get(competition.scoreboard, { timeout: CONFIG.timeout });
    const events = scoreboardRes.data?.events || [];
    
    // Catégoriser les matchs ESPN
    const matchData = categorizeMatches(events);
    let { completed, live, upcoming } = matchData;
    
    // Enrichir les matchs à venir avec TheSportsDB si c'est une ligue de football
    if (THESPORTSDB_LEAGUES[key]) {
      const theSportsDBMatches = await fetchTheSportsDBUpcoming(key, 7);
      
      // Fusionner et dédupliquer les matchs à venir
      const upcomingMap = new Map();
      
      // Ajouter les matchs ESPN d'abord (priorité)
      upcoming.forEach(match => {
        const dateKey = new Date(match.date).toISOString().split('T')[0];
        const homeTeam = match.competitions?.[0]?.competitors?.find(c => c.homeAway === 'home')?.team?.displayName;
        const awayTeam = match.competitions?.[0]?.competitors?.find(c => c.homeAway === 'away')?.team?.displayName;
        const key = `${dateKey}-${homeTeam}-${awayTeam}`;
        upcomingMap.set(key, match);
      });
      
      // Ajouter les matchs TheSportsDB non dupliqués
      theSportsDBMatches.forEach(match => {
        const dateKey = new Date(match.date).toISOString().split('T')[0];
        const homeTeam = match.competitions?.[0]?.competitors?.find(c => c.homeAway === 'home')?.team?.displayName;
        const awayTeam = match.competitions?.[0]?.competitors?.find(c => c.homeAway === 'away')?.team?.displayName;
        const key = `${dateKey}-${homeTeam}-${awayTeam}`;
        
        if (!upcomingMap.has(key)) {
          upcomingMap.set(key, match);
        }
      });
      
      // Convertir en tableau et trier par date
      upcoming = Array.from(upcomingMap.values()).sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );
      
      log(`✓ ${competition.name} - ${upcoming.length} matchs à venir (ESPN + TheSportsDB)`);
    }
    
    // Extraire les matchs du jour suivant uniquement pour affichage séparé
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
    
    const nextDayMatches = upcoming.filter(match => {
      const matchDate = new Date(match.date);
      return matchDate >= tomorrow && matchDate < dayAfterTomorrow;
    });

    // Lire le classement existant (cache)
    let standings = await readCachedStandings(outputPath);
    const isFirstRun = standings.length === 0;
    
    // Pour les sports US : calculer standings dynamiquement depuis scoreboard
    const isAmericanSport = ['nba', 'nhl', 'nfl'].includes(key);
    const isFootballLeague = ['ligue1', 'ligue2', 'premierLeague', 'laLiga', 'serieA', 'bundesliga', 'brasileirao'].includes(key);
    
    // Mettre à jour standings
    if (isAmericanSport) {
      // Sports US : calculer depuis les résultats du scoreboard
      standings = await calculateLiveStandings(key, scoreboardRes.data);
      log(`🔄 ${competition.name} - Classement calculé dynamiquement`);
    } else if (forceStandingsUpdate || isFirstRun || (isFootballLeague && standings.length === 0) || shouldUpdateStandings(matchData)) {
      // Ligues de football : utiliser SofaScore API
      const newStandings = await fetchSofaScoreStandings(key);
      if (newStandings.length > 0) {
        standings = newStandings;
        log(`🔄 ${competition.name} - Classement mis à jour depuis SofaScore`);
      }
    }

    const data = {
      competition: competition.name,
      lastUpdate: new Date().toISOString(),
      matches: { completed, live, upcoming },
      nextDayMatches: nextDayMatches || [],
      standings,
      season: scoreboardRes.data?.season
    };

    await fs.writeFile(outputPath, JSON.stringify(data, null, 2));
    
    const summary = `${completed.length} terminés, ${live.length} en cours, ${upcoming.length} à venir`;
    log(`✓ ${competition.name} - ${summary}`);
    return { key, outputPath, data };
  } catch (error) {
    log(`✗ Erreur ${competition.name}: ${error.message}`, 'error');
    return null;
  }
}

// Helper pour lire le classement en cache
async function readCachedStandings(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(content);
    return data.standings || [];
  } catch {
    return [];
  }
}

// Vérifier si on doit mettre à jour le cache TheSportsDB
function shouldUpdateTheSportsDBCache() {
  const now = new Date();
  const currentDay = now.getDay(); // 0=Dimanche, 1=Lundi, ..., 6=Samedi
  const currentHour = now.getHours() + now.getMinutes() / 60;
  
  // Vérifier si c'est un jour de mise à jour (lundi, mercredi, vendredi)
  if (!CONFIG.theSportsDBCache.updateDays.includes(currentDay)) {
    return false;
  }
  
  // Vérifier si on est dans la plage horaire (4h00 ± 30 minutes)
  const updateHour = CONFIG.theSportsDBCache.updateHour;
  return currentHour >= updateHour && currentHour < updateHour + 0.5;
}

// Lire le cache TheSportsDB
async function readTheSportsDBCache() {
  try {
    const content = await fs.readFile(CONFIG.theSportsDBCache.cacheFile, 'utf8');
    const cache = JSON.parse(content);
    
    // Vérifier si le cache est encore valide (moins de 4 jours)
    const cacheDate = new Date(cache.lastUpdate);
    const now = new Date();
    const daysDiff = (now - cacheDate) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > 4) {
      log('⚠️ Cache TheSportsDB expiré (> 4 jours)', 'warn');
      return null;
    }
    
    return cache;
  } catch {
    return null;
  }
}

// Sauvegarder le cache TheSportsDB
async function saveTheSportsDBCache(data) {
  try {
    const cache = {
      lastUpdate: new Date().toISOString(),
      data: data
    };
    await fs.writeFile(CONFIG.theSportsDBCache.cacheFile, JSON.stringify(cache, null, 2));
    log('💾 Cache TheSportsDB sauvegardé');
  } catch (error) {
    log(`Erreur sauvegarde cache TheSportsDB: ${error.message}`, 'error');
  }
}

// Récupérer les matchs à venir depuis TheSportsDB pour enrichir les données
async function fetchTheSportsDBUpcoming(leagueKey, daysAhead = 7) {
  const leagueConfig = THESPORTSDB_LEAGUES[leagueKey];
  if (!leagueConfig) return [];
  
  // Vérifier d'abord le cache
  const cache = await readTheSportsDBCache();
  const shouldUpdate = shouldUpdateTheSportsDBCache();
  
  // Si on a un cache valide et qu'on ne doit pas mettre à jour, utiliser le cache
  if (cache && !shouldUpdate && cache.data[leagueKey]) {
    return cache.data[leagueKey];
  }
  
  // Sinon, récupérer depuis l'API (seulement 3 fois par semaine)
  if (!shouldUpdate && cache) {
    // On a un cache mais ce n'est pas le moment de mettre à jour
    return cache.data[leagueKey] || [];
  }
  
  try {
    log(`🔄 Mise à jour TheSportsDB pour ${leagueConfig.name} (${new Date().toLocaleDateString('fr-FR', { weekday: 'long' })})`);
    const today = new Date();
    const allUpcoming = [];
    
    // Récupérer les matchs pour les prochains jours
    for (let i = 0; i <= daysAhead; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0]; // Format YYYY-MM-DD
      
      const url = `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${dateStr}&s=Soccer`;
      const response = await axios.get(url, { timeout: CONFIG.timeout });
      
      if (response.data?.events) {
        // Filtrer uniquement les matchs de la ligue demandée
        const leagueMatches = response.data.events.filter(event => 
          event.strLeague === leagueConfig.name && 
          event.strStatus !== 'FT' && // Pas les matchs terminés
          event.strStatus !== 'CANC' // Pas les matchs annulés
        );
        
        // Convertir au format ESPN-like pour compatibilité
        const convertedMatches = leagueMatches.map(event => ({
          id: event.idEvent,
          date: `${event.dateEvent}T${event.strTime}`,
          name: event.strEvent,
          shortName: event.strEventAlternate || event.strEvent,
          status: {
            type: { state: 'pre' },
            detail: event.strStatus || 'Scheduled',
            completed: false
          },
          competitions: [{
            id: event.idEvent,
            date: `${event.dateEvent}T${event.strTime}`,
            competitors: [
              {
                id: event.idHomeTeam,
                homeAway: 'home',
                team: {
                  id: event.idHomeTeam,
                  name: event.strHomeTeam,
                  displayName: event.strHomeTeam,
                  abbreviation: event.strHomeTeam.substring(0, 3).toUpperCase(),
                  logo: event.strHomeTeamBadge
                },
                score: '0'
              },
              {
                id: event.idAwayTeam,
                homeAway: 'away',
                team: {
                  id: event.idAwayTeam,
                  name: event.strAwayTeam,
                  displayName: event.strAwayTeam,
                  abbreviation: event.strAwayTeam.substring(0, 3).toUpperCase(),
                  logo: event.strAwayTeamBadge
                },
                score: '0'
              }
            ],
            venue: {
              fullName: event.strVenue || 'Stadium'
            }
          }],
          source: 'thesportsdb'
        }));
        
        allUpcoming.push(...convertedMatches);
      }
      
      // Délai pour ne pas surcharger l'API
      if (i < daysAhead) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    log(`✓ TheSportsDB: ${allUpcoming.length} matchs à venir récupérés pour ${leagueConfig.name}`);
    
    // Mettre à jour le cache avec les nouvelles données
    const existingCache = await readTheSportsDBCache();
    const cacheData = existingCache?.data || {};
    cacheData[leagueKey] = allUpcoming;
    await saveTheSportsDBCache(cacheData);
    
    return allUpcoming;
  } catch (error) {
    log(`✗ Erreur TheSportsDB pour ${leagueKey}: ${error.message}`, 'error');
    
    // En cas d'erreur, essayer de retourner le cache existant
    const cache = await readTheSportsDBCache();
    if (cache && cache.data[leagueKey]) {
      log(`📦 Utilisation du cache TheSportsDB pour ${leagueKey}`, 'warn');
      return cache.data[leagueKey];
    }
    
    return [];
  }
}

// ==================== RSS NEWS ====================

async function fetchRSSFeed(key, feed) {
  try {
    const rssFeed = await parser.parseURL(feed.url);
    
    let items = rssFeed.items.slice(0, feed.maxItems).map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate || item.isoDate,
      description: item.contentSnippet || item.description,
      content: item.content,
      image: item.enclosure?.url || item.image?.url,
      categories: item.categories || []
    }));

    // Filtre optionnel (pour littérature)
    if (feed.filter) {
      items = items.filter(item => 
        item.title?.toLowerCase().includes(feed.filter) ||
        item.description?.toLowerCase().includes(feed.filter) ||
        item.categories?.some(cat => cat.toLowerCase().includes(feed.filter))
      );
    }

    const data = {
      feed: feed.name,
      lastUpdate: new Date().toISOString(),
      itemCount: items.length,
      items: items
    };

    const outputPath = path.join(CONFIG.outputDir, feed.output);
    await fs.writeFile(outputPath, JSON.stringify(data, null, 2));
    
    log(`✓ ${feed.name} mis à jour (${items.length} articles)`);
    return { key, outputPath, data };
  } catch (error) {
    log(`✗ Erreur ${feed.name}: ${error.message}`, 'error');
    return null;
  }
}

async function fetchAllNews() {
  const promises = Object.entries(NEWS_FEEDS).map(([key, feed]) => 
    fetchRSSFeed(key, feed)
  );
  
  const results = await Promise.all(promises);
  return results.filter(r => r !== null);
}

async function fetchAllCulture() {
  const promises = Object.entries(CULTURE_FEEDS).map(([key, feed]) => 
    fetchRSSFeed(key, feed)
  );
  
  const results = await Promise.all(promises);
  return results.filter(r => r !== null);
}

async function fetchAllMercato() {
  const promises = Object.entries(MERCATO_FEEDS).map(([key, feed]) => 
    fetchRSSFeed(key, feed)
  );
  
  const results = await Promise.all(promises);
  return results.filter(r => r !== null);
}

// ==================== FTP ====================

async function connectFTP() {
  const client = new ftp.Client();
  client.ftp.verbose = CONFIG.debug;
  try {
    await client.access({
      host: CONFIG.ftp.host,
      port: CONFIG.ftp.port,
      user: CONFIG.ftp.user,
      password: CONFIG.ftp.password,
      secure: CONFIG.ftp.secure
    });
    log('✓ Connexion FTP établie');
    return client;
  } catch (error) {
    log(`✗ Erreur connexion FTP: ${error.message}`, 'error');
    throw error;
  }
}

async function uploadAllFiles(results) {
  let client;
  try {
    // Créer un fichier JSON consolidé avec toutes les données
    const consolidatedData = {
      sports: {},
      actus: {},
      culture: {},
      mercato: {},
      lastUpdate: new Date().toISOString()
    };

    // Lire et consolider tous les fichiers JSON
    for (const result of results) {
      try {
        const filename = path.basename(result.outputPath, '.json');
        const fileContent = await fs.readFile(result.outputPath, 'utf8');
        const data = JSON.parse(fileContent);
        
        // Catégoriser par préfixe
        const [category, key] = (
          filename.startsWith('actus-') ? ['actus', filename.replace('actus-', '')] :
          filename.startsWith('culture-') ? ['culture', filename.replace('culture-', '')] :
          filename.startsWith('mercato-') ? ['mercato', filename.replace('mercato-', '')] :
          ['sports', filename]
        );
        
        consolidatedData[category][key] = data;
      } catch (err) {
        log(`⚠️ Erreur lecture ${result.outputPath}: ${err.message}`, 'warn');
      }
    }

    // Écrire le fichier consolidé
    const consolidatedPath = path.join(CONFIG.outputDir, 'data.json');
    await fs.writeFile(consolidatedPath, JSON.stringify(consolidatedData, null, 2));
    log(`✓ Fichier consolidé créé: data.json (${results.length} sources)`);

    // Upload du fichier unique
    client = await connectFTP();
    const remotePath = `${CONFIG.ftp.remotePath}/data.json`;
    await client.uploadFrom(consolidatedPath, remotePath);
    log(`✓ Fichier uploadé vers OVH: ${remotePath}`);
    
  } catch (error) {
    log(`Erreur upload FTP: ${error.message}`, 'error');
  } finally {
    if (client) {
      client.close();
    }
  }
}

// ==================== BOUCLES DE MISE À JOUR ====================

// Vérifier si l'heure actuelle est dans la plage de matchs d'une compétition
function isMatchTime(competition) {
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay();
  
  // Planning complexe (NFL, Champions League)
  if (competition.matchSchedule) {
    return competition.matchSchedule.some(({ day, start, end }) => {
      const isRightDay = currentDay === day || 
        (start > end && currentHour < end && currentDay === (day + 1) % 7);
      
      if (!isRightDay) return false;
      
      return start > end 
        ? currentHour >= start || currentHour < end
        : currentHour >= start && currentHour < end;
    });
  }
  
  // Planning simple (matchDays + matchHours)
  const { start, end } = competition.matchHours;
  
  if (!competition.matchDays.includes(currentDay)) {
    return false;
  }
  
  return start > end 
    ? currentHour >= start || currentHour < end
    : currentHour >= start && currentHour < end;
}

// Mise à jour des sports (intelligente selon l'heure)
async function sportsLoop() {
  const now = new Date();
  const currentTime = now.getHours() + (now.getMinutes() / 60);
  
  // Vérifier les différentes fenêtres de mise à jour
  const isFootballDailyUpdate = Math.abs(currentTime - CONFIG.updateHours.football) < 0.1;
  const isEuropeanDailyUpdate = Math.abs(currentTime - CONFIG.updateHours.european) < 0.1;
  const isUSDailyUpdate = Math.abs(currentTime - CONFIG.updateHours.american) < 0.1;
  
  // Log des mises à jour quotidiennes
  if (isFootballDailyUpdate) log('=== 🕐 5h00: Mise à jour quotidienne football ===');
  if (isEuropeanDailyUpdate) log('=== 🕐 23h45: Mise à jour quotidienne championnats européens ===');
  if (isUSDailyUpdate) log('=== 🕐 6h30: Mise à jour quotidienne sports US ===');
  
  try {
    const footballLeagues = ['ligue1', 'ligue2', 'premierLeague', 'laLiga', 'serieA', 'bundesliga', 'brasileirao', 'can', 'championsLeague'];
    const americanSports = ['nba', 'nhl', 'nfl'];
    
    // Déterminer quelles compétitions mettre à jour
    const competitionsToUpdate = Object.entries(ESPN_COMPETITIONS).filter(([key, comp]) => {
      // Sports US: TOUJOURS mis à jour (pour affichage permanent des standings)
      if (americanSports.includes(key)) {
        return true;
      }
      
      // Ligues de football: TOUJOURS mises à jour (pour affichage permanent)
      if (footballLeagues.includes(key)) {
        return true;
      }
      
      // Autres compétitions: mise à jour à 23h45 OU pendant les heures de matchs
      return isEuropeanDailyUpdate || isMatchTime(comp);
    });
    
    if (competitionsToUpdate.length === 0) {
      log('Aucune compétition active à cette heure, attente...');
      return;
    }
    
    log(`=== Sports: Mise à jour de ${competitionsToUpdate.length} compétitions ===`);
    
    // Forcer la mise à jour des classements aux heures quotidiennes
    const forceStandingsUpdate = isFootballDailyUpdate || isEuropeanDailyUpdate || isUSDailyUpdate;
    
    const promises = competitionsToUpdate.map(([key, comp]) => 
      fetchESPNCompetition(key, comp, forceStandingsUpdate)
    );
    
    const espnResults = (await Promise.all(promises)).filter(r => r !== null);
    
    if (espnResults.length > 0) {
      log(`Sports: ${espnResults.length} compétitions mises à jour`);
      await uploadAllFiles(espnResults);
    }
  } catch (error) {
    log(`Erreur dans sportsLoop: ${error.message}`, 'error');
  }
  
  log(`=== Sports: Prochaine vérification dans ${CONFIG.sportsUpdateInterval / 1000}s ===\n`);
}

// Mise à jour des actualités, culture et mercato (toutes les 30 minutes)
async function newsLoop() {
  log('=== News/Culture/Mercato: Démarrage mise à jour ===');
  
  try {
    const [newsResults, cultureResults, mercatoResults] = await Promise.all([
      fetchAllNews(),
      fetchAllCulture(),
      fetchAllMercato()
    ]);

    const allResults = [...newsResults, ...cultureResults, ...mercatoResults];
    
    if (allResults.length > 0) {
      log(`News/Culture/Mercato: ${allResults.length} sources mises à jour`);
      await uploadAllFiles(allResults);
    }
  } catch (error) {
    log(`Erreur dans newsLoop: ${error.message}`, 'error');
  }
  
  log(`=== News/Culture/Mercato: Prochaine mise à jour dans 1 heure ===\n`);
}

// ==================== DÉMARRAGE ====================

async function start() {
  log('🚀 Démarrage du service de mise à jour automatique');
  log(`Configuration:`);
  log(`  - ${Object.keys(ESPN_COMPETITIONS).length} sports (refresh intelligent par plage horaire + 23h45 quotidien)`);
  log(`  - ${Object.keys(NEWS_FEEDS).length} actualités (refresh: toutes les heures)`);
  log(`  - ${Object.keys(CULTURE_FEEDS).length} culture (refresh: toutes les heures)`);
  log(`  - ${Object.keys(MERCATO_FEEDS).length} mercato (refresh: toutes les heures)`);
  log(`Destination FTP: ${CONFIG.ftp.host}:${CONFIG.ftp.remotePath}`);
  log(``);
  
  await ensureOutputDir();
  
  // Initialisation du cache TheSportsDB au démarrage
  log('📦 Initialisation du cache TheSportsDB...');
  try {
    const cacheData = {};
    for (const leagueKey of Object.keys(THESPORTSDB_LEAGUES)) {
      const matches = await fetchTheSportsDBUpcoming(leagueKey, 7);
      cacheData[leagueKey] = matches;
      log(`  ✓ ${THESPORTSDB_LEAGUES[leagueKey].name}: ${matches.length} matchs`);
    }
    await saveTheSportsDBCache(cacheData);
    log('✅ Cache TheSportsDB initialisé');
  } catch (error) {
    log(`⚠️ Erreur initialisation cache TheSportsDB: ${error.message}`, 'warn');
  }
  log(``);
  
  // Première exécution immédiate des deux boucles
  await Promise.all([
    sportsLoop(),
    newsLoop()
  ]);
  
  // Boucles infinies avec intervalles différents
  setInterval(sportsLoop, CONFIG.sportsUpdateInterval); // 5 secondes (mais intelligent)
  setInterval(newsLoop, CONFIG.newsUpdateInterval); // 30 minutes
}

// Gestion des erreurs non catchées
process.on('unhandledRejection', (error) => {
  log(`Erreur non gérée: ${error.message}`, 'error');
  console.error(error);
});

process.on('SIGINT', () => {
  log('Arrêt du service (SIGINT)');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('Arrêt du service (SIGTERM)');
  process.exit(0);
});

// Lancement
start().catch(error => {
  log(`Erreur fatale: ${error.message}`, 'error');
  console.error(error);
  process.exit(1);
});
