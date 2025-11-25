require('dotenv').config();
const axios = require('axios');
const ftp = require('basic-ftp');
const fs = require('fs').promises;
const path = require('path');
const Parser = require('rss-parser');

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
  sportsUpdateInterval: parseInt(process.env.SPORTS_UPDATE_INTERVAL) || 5000, // 5 secondes pour les sports
  newsUpdateInterval: parseInt(process.env.NEWS_UPDATE_INTERVAL) || 1800000, // 30 minutes pour actus/culture
  outputDir: path.join(__dirname, 'output'),
  debug: process.env.DEBUG === 'true'
};

// ESPN Sports Competitions avec plages horaires de matchs
const ESPN_COMPETITIONS = {
  ligue1: {
    name: 'Ligue 1',
    scoreboard: 'https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/scoreboard',
    standings: 'https://site.api.espn.com/apis/v2/sports/soccer/fra.1/standings',
    output: 'ligue1.json',
    matchHours: { start: 17, end: 23.5 },
    matchDays: [5, 6, 0] // Vendredi, Samedi, Dimanche
  },
  ligue2: {
    name: 'Ligue 2',
    scoreboard: 'https://site.api.espn.com/apis/site/v2/sports/soccer/fra.2/scoreboard',
    standings: 'https://site.api.espn.com/apis/v2/sports/soccer/fra.2/standings',
    output: 'ligue2.json',
    matchHours: { start: 19, end: 23.5 },
    matchDays: [5, 1] // Vendredi, Lundi
  },
  premierLeague: {
    name: 'Premier League',
    scoreboard: 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard',
    standings: 'https://site.api.espn.com/apis/v2/sports/soccer/eng.1/standings',
    output: 'premierleague.json',
    matchHours: { start: 13, end: 23.5 },
    matchDays: [6, 0, 1] // Samedi, Dimanche, Lundi
  },
  laLiga: {
    name: 'La Liga',
    scoreboard: 'https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard',
    standings: 'https://site.api.espn.com/apis/v2/sports/soccer/esp.1/standings',
    output: 'laliga.json',
    matchHours: { start: 14, end: 23.75 },
    matchDays: [5, 6, 0, 1] // Vendredi, Samedi, Dimanche, Lundi
  },
  serieA: {
    name: 'Serie A',
    scoreboard: 'https://site.api.espn.com/apis/site/v2/sports/soccer/ita.1/scoreboard',
    standings: 'https://site.api.espn.com/apis/v2/sports/soccer/ita.1/standings',
    output: 'seriea.json',
    matchHours: { start: 12, end: 23.5 },
    matchDays: [6, 0, 1] // Samedi, Dimanche, Lundi
  },
  bundesliga: {
    name: 'Bundesliga',
    scoreboard: 'https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/scoreboard',
    standings: 'https://site.api.espn.com/apis/v2/sports/soccer/ger.1/standings',
    output: 'bundesliga.json',
    matchHours: { start: 15, end: 23.5 },
    matchDays: [5, 6, 0] // Vendredi, Samedi, Dimanche
  },
  brasileirao: {
    name: 'Brasileirão Série A',
    scoreboard: 'https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/scoreboard',
    standings: 'https://site.api.espn.com/apis/v2/sports/soccer/bra.1/standings',
    output: 'brasileirao.json',
    matchHours: { start: 21, end: 7.5 },
    matchDays: [3, 4, 6, 0] // Mercredi, Jeudi, Samedi, Dimanche
  },
  can: {
    name: 'CAN 2025',
    scoreboard: 'https://site.api.espn.com/apis/site/v2/sports/soccer/caf.nations/scoreboard',
    standings: 'https://site.api.espn.com/apis/v2/sports/soccer/caf.nations/standings',
    output: 'can2025.json',
    matchHours: { start: 17, end: 23.5 },
    matchDays: [0, 1, 2, 3, 4, 5, 6] // Tous les jours
  },
  championsLeague: {
    name: 'Champions League',
    scoreboard: 'https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard',
    standings: 'https://site.api.espn.com/apis/v2/sports/soccer/uefa.champions/standings',
    output: 'championsleague.json',
    matchSchedule: [
      { day: 2, start: 17, end: 23.33 }, // Mardi: 17h-23h20
      { day: 3, start: 17, end: 23.33 }  // Mercredi: 17h-23h20
    ]
  },
  nba: {
    name: 'NBA',
    scoreboard: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
    standings: 'https://site.api.espn.com/apis/v2/sports/basketball/nba/standings',
    output: 'nba.json',
    matchHours: { start: 0, end: 7 },
    matchDays: [0, 1, 2, 3, 4, 5, 6], // Tous les jours
    dailyUpdateHour: 6.5
  },
  nfl: {
    name: 'NFL',
    scoreboard: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
    standings: 'https://site.api.espn.com/apis/v2/sports/football/nfl/standings',
    output: 'nfl.json',
    matchSchedule: [
      { day: 4, start: 2, end: 6 },   // Jeudi: 2h-6h
      { day: 0, start: 19, end: 6 },  // Dimanche: 19h-6h (traverse minuit vers lundi)
      { day: 2, start: 2, end: 6 }    // Mardi: 2h-6h
    ],
    dailyUpdateHour: 6.5
  },
  nhl: {
    name: 'NHL',
    scoreboard: 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard',
    standings: 'https://site.api.espn.com/apis/v2/sports/hockey/nhl/standings',
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
    maxItems: 20
  },
  monde: {
    name: 'Actualités Monde',
    url: 'https://www.franceinfo.fr/monde.rss',
    output: 'actus-monde.json',
    maxItems: 20
  }
};

// RSS Culture Feeds
const CULTURE_FEEDS = {
  cinema: {
    name: 'Cinéma',
    url: 'https://www.franceinfo.fr/culture/cinema.rss',
    output: 'culture-cinema.json',
    maxItems: 15
  },
  musique: {
    name: 'Musique',
    url: 'https://www.franceinfo.fr/culture/musique.rss',
    output: 'culture-musique.json',
    maxItems: 15
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
    maxItems: 15
  },
  sciences: {
    name: 'Sciences',
    url: 'https://www.franceinfo.fr/sciences.rss',
    output: 'culture-sciences.json',
    maxItems: 15
  },
  litterature: {
    name: 'Littérature',
    url: 'https://www.nouvelobs.com/culture/rss.xml',
    output: 'culture-litterature.json',
    maxItems: 15,
    filter: 'livre' // Filtre pour ne garder que les articles sur les livres
  }
};

// RSS Mercato Feeds
const MERCATO_FEEDS = {
  maxifoot: {
    name: 'Mercato Maxifoot',
    url: 'https://www.maxifoot.fr/rss/news-mercato.xml',
    output: 'mercato-maxifoot.json',
    maxItems: 20
  },
  rmcsport: {
    name: 'Mercato RMC Sport',
    url: 'https://rmcsport.bfmtv.com/rss/football/mercato/',
    output: 'mercato-rmcsport.json',
    maxItems: 20
  },
  le10sport: {
    name: 'Mercato Le 10 Sport',
    url: 'https://le10sport.com/rss',
    output: 'mercato-le10sport.json',
    maxItems: 20,
    filter: 'mercato'
  },
  footmercato: {
    name: 'Mercato Foot Mercato',
    url: 'https://www.footmercato.net/rss/all.xml',
    output: 'mercato-footmercato.json',
    maxItems: 20,
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

function processLiveMatches(events) {
  if (!events || !Array.isArray(events)) return [];
  
  return events.map(event => ({
    id: event.id,
    name: event.name,
    shortName: event.shortName,
    date: event.date,
    status: {
      type: event.status?.type?.name || 'Scheduled',
      detail: event.status?.type?.detail || '',
      completed: event.status?.type?.completed || false
    },
    competitions: event.competitions?.[0] ? {
      homeTeam: {
        id: event.competitions[0].competitors?.find(c => c.homeAway === 'home')?.id,
        name: event.competitions[0].competitors?.find(c => c.homeAway === 'home')?.team?.displayName,
        shortName: event.competitions[0].competitors?.find(c => c.homeAway === 'home')?.team?.shortDisplayName,
        logo: event.competitions[0].competitors?.find(c => c.homeAway === 'home')?.team?.logo,
        score: event.competitions[0].competitors?.find(c => c.homeAway === 'home')?.score
      },
      awayTeam: {
        id: event.competitions[0].competitors?.find(c => c.homeAway === 'away')?.id,
        name: event.competitions[0].competitors?.find(c => c.homeAway === 'away')?.team?.displayName,
        shortName: event.competitions[0].competitors?.find(c => c.homeAway === 'away')?.team?.shortDisplayName,
        logo: event.competitions[0].competitors?.find(c => c.homeAway === 'away')?.team?.logo,
        score: event.competitions[0].competitors?.find(c => c.homeAway === 'away')?.score
      },
      venue: event.competitions[0].venue?.fullName,
      time: event.competitions[0].status?.displayClock
    } : null
  }));
}

function processStandings(standings) {
  if (!standings || !Array.isArray(standings)) return [];
  
  return standings.map(standing => ({
    name: standing.name,
    abbreviation: standing.abbreviation,
    entries: standing.entries?.map(entry => ({
      team: {
        id: entry.team?.id,
        name: entry.team?.displayName,
        shortName: entry.team?.shortDisplayName,
        logo: entry.team?.logos?.[0]?.href
      },
      stats: entry.stats?.reduce((acc, stat) => {
        acc[stat.name] = stat.value;
        return acc;
      }, {})
    })) || []
  }));
}

async function fetchESPNCompetition(key, competition) {
  try {
    const [scoreboardRes, standingsRes] = await Promise.all([
      axios.get(competition.scoreboard, { timeout: 10000 }),
      axios.get(competition.standings, { timeout: 10000 })
    ]);

    const data = {
      competition: competition.name,
      lastUpdate: new Date().toISOString(),
      scoreboard: {
        events: processLiveMatches(scoreboardRes.data.events),
        season: scoreboardRes.data.season
      },
      standings: processStandings(standingsRes.data.children?.[0]?.standings || [])
    };

    const outputPath = path.join(CONFIG.outputDir, competition.output);
    await fs.writeFile(outputPath, JSON.stringify(data, null, 2));
    
    log(`✓ ${competition.name} mis à jour`);
    return { key, outputPath, data };
  } catch (error) {
    log(`✗ Erreur ${competition.name}: ${error.message}`, 'error');
    return null;
  }
}

async function fetchAllESPNCompetitions() {
  const promises = Object.entries(ESPN_COMPETITIONS).map(([key, comp]) => 
    fetchESPNCompetition(key, comp)
  );
  
  const results = await Promise.all(promises);
  return results.filter(r => r !== null);
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

async function uploadToFTP(client, localPath, remotePath) {
  try {
    await client.uploadFrom(localPath, remotePath);
    return true;
  } catch (error) {
    log(`✗ Erreur upload ${path.basename(localPath)}: ${error.message}`, 'error');
    return false;
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
      const filename = path.basename(result.outputPath, '.json');
      const fileContent = await fs.readFile(result.outputPath, 'utf8');
      const data = JSON.parse(fileContent);
      
      if (filename.startsWith('actus-')) {
        const key = filename.replace('actus-', '');
        consolidatedData.actus[key] = data;
      } else if (filename.startsWith('culture-')) {
        const key = filename.replace('culture-', '');
        consolidatedData.culture[key] = data;
      } else if (filename.startsWith('mercato-')) {
        const key = filename.replace('mercato-', '');
        consolidatedData.mercato[key] = data;
      } else {
        consolidatedData.sports[filename] = data;
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
  const currentDay = now.getDay(); // 0=Dimanche, 1=Lundi, ..., 6=Samedi
  
  // Si la compétition a un planning complexe (NFL avec plusieurs plages)
  if (competition.matchSchedule) {
    return competition.matchSchedule.some(schedule => {
      const { day, start, end } = schedule;
      
      // Vérifier si c'est le bon jour
      let isRightDay = currentDay === day;
      
      // Si la plage traverse minuit, vérifier aussi le jour suivant
      if (start > end && currentHour < end) {
        isRightDay = isRightDay || currentDay === (day + 1) % 7;
      }
      
      if (!isRightDay) return false;
      
      // Vérifier l'heure
      if (start > end) {
        return currentHour >= start || currentHour < end;
      }
      return currentHour >= start && currentHour < end;
    });
  }
  
  // Sinon, utiliser le système simple (matchDays + matchHours)
  const { start, end } = competition.matchHours;
  
  // Vérifier si c'est un jour de match
  if (!competition.matchDays.includes(currentDay)) {
    return false;
  }
  
  // Gérer les plages qui traversent minuit (ex: 21h-4h)
  if (start > end) {
    return currentHour >= start || currentHour < end;
  }
  return currentHour >= start && currentHour < end;
}

// Mise à jour des sports (intelligente selon l'heure)
async function sportsLoop() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour + (currentMinute / 60);
  
  // Mise à jour complète à 23h45 pour les championnats européens
  const isEuropeanDailyUpdate = currentHour === 23 && currentMinute === 45;
  
  // Mise à jour quotidienne à 6h30 pour les sports US (NBA, NFL, NHL)
  const isUSDailyUpdate = currentHour === 6 && currentMinute === 30;
  
  if (isEuropeanDailyUpdate) {
    log('=== 🕐 23h45: Mise à jour quotidienne championnats européens + foot (scores + standings) ===');
  }
  
  if (isUSDailyUpdate) {
    log('=== 🕐 6h30: Mise à jour quotidienne sports US (NBA, NFL, NHL) ===');
  }
  
  try {
    const competitionsToUpdate = Object.entries(ESPN_COMPETITIONS).filter(([key, comp]) => {
      // Sports US: mise à jour à leur heure dédiée 6h30
      if (comp.dailyUpdateHour && Math.abs(currentTime - comp.dailyUpdateHour) < 0.1) {
        return true;
      }
      
      // Championnats européens et foot: mise à jour à 23h45
      if (isEuropeanDailyUpdate && !comp.dailyUpdateHour) {
        return true;
      }
      
      // Sinon, seulement les compétitions en plage horaire de matchs
      return isMatchTime(comp);
    });
    
    if (competitionsToUpdate.length === 0) {
      log('Aucune compétition active à cette heure, attente...');
      return;
    }
    
    log(`=== Sports: Mise à jour de ${competitionsToUpdate.length} compétitions ===`);
    
    const promises = competitionsToUpdate.map(([key, comp]) => 
      fetchESPNCompetition(key, comp)
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
  
  log(`=== News/Culture/Mercato: Prochaine mise à jour dans ${CONFIG.newsUpdateInterval / 60000} minutes ===\n`);
}

// ==================== DÉMARRAGE ====================

async function start() {
  log('🚀 Démarrage du service de mise à jour automatique');
  log(`Configuration:`);
  log(`  - ${Object.keys(ESPN_COMPETITIONS).length} sports (refresh intelligent par plage horaire + 23h45 quotidien)`);
  log(`  - ${Object.keys(NEWS_FEEDS).length} actualités (refresh: ${CONFIG.newsUpdateInterval / 60000} min)`);
  log(`  - ${Object.keys(CULTURE_FEEDS).length} culture (refresh: ${CONFIG.newsUpdateInterval / 60000} min)`);
  log(`  - ${Object.keys(MERCATO_FEEDS).length} mercato (refresh: ${CONFIG.newsUpdateInterval / 60000} min)`);
  log(`Destination FTP: ${CONFIG.ftp.host}:${CONFIG.ftp.remotePath}`);
  log(``);
  
  await ensureOutputDir();
  
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
