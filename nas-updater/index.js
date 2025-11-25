require('dotenv').config();
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const SftpClient = require('ssh2-sftp-client');

// Configuration
const OUTPUT_DIR = path.join(__dirname, 'output');
const UPDATE_INTERVAL = parseInt(process.env.UPDATE_INTERVAL) || 5000;
const DEBUG = process.env.DEBUG === 'true';

// Configuration des compétitions
const COMPETITIONS = {
  ligue1: {
    name: 'Ligue 1',
    scoreboard: 'https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/scoreboard',
    standings: 'https://site.api.espn.com/apis/v2/sports/soccer/fra.1/standings',
    files: {
      live: 'ligue1-live.json',
      standings: 'ligue1-standings.json'
    }
  },
  can: {
    name: 'CAN 2025',
    scoreboard: 'https://site.api.espn.com/apis/site/v2/sports/soccer/caf.nations/scoreboard',
    standings: 'https://site.api.espn.com/apis/v2/sports/soccer/caf.nations/standings',
    files: {
      live: 'can-live.json',
      standings: 'can-standings.json'
    }
  },
  championsLeague: {
    name: 'Champions League',
    scoreboard: 'https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard',
    standings: 'https://site.api.espn.com/apis/v2/sports/soccer/uefa.champions/standings',
    files: {
      live: 'champions-live.json',
      standings: 'champions-standings.json'
    }
  },
  nba: {
    name: 'NBA',
    scoreboard: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
    standings: 'https://site.api.espn.com/apis/v2/sports/basketball/nba/standings',
    files: {
      live: 'nba-live.json',
      standings: 'nba-standings.json'
    }
  },
  nfl: {
    name: 'NFL',
    scoreboard: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
    standings: 'https://site.api.espn.com/apis/v2/sports/football/nfl/standings',
    files: {
      live: 'nfl-live.json',
      standings: 'nfl-standings.json'
    }
  },
  nhl: {
    name: 'NHL',
    scoreboard: 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard',
    standings: 'https://site.api.espn.com/apis/v2/sports/hockey/nhl/standings',
    files: {
      live: 'nhl-live.json',
      standings: 'nhl-standings.json'
    }
  }
};

// Client SFTP réutilisable
let sftpClient = null;

// Fonction pour logger avec timestamp
function log(message, isError = false) {
  const timestamp = new Date().toISOString();
  const prefix = isError ? '❌ ERREUR' : '✅';
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

// Connexion SFTP
async function connectSFTP() {
  if (sftpClient && sftpClient.sftp) {
    return sftpClient; // Réutiliser la connexion existante
  }

  sftpClient = new SftpClient();
  
  try {
    await sftpClient.connect({
      host: process.env.SFTP_HOST,
      port: parseInt(process.env.SFTP_PORT) || 22,
      username: process.env.SFTP_USER,
      password: process.env.SFTP_PASSWORD,
      retries: 3,
      retry_factor: 2,
      retry_minTimeout: 2000
    });
    
    log('Connexion SFTP établie avec OVH');
    return sftpClient;
  } catch (error) {
    log(`Échec connexion SFTP: ${error.message}`, true);
    sftpClient = null;
    throw error;
  }
}

// Récupération des données ESPN
async function fetchESPNData(url, type) {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (DEBUG) {
      log(`API ${type} - Status: ${response.status}`);
    }
    
    return response.data;
  } catch (error) {
    log(`Erreur fetch ${type}: ${error.message}`, true);
    return null;
  }
}

// Traitement des matchs en direct
function processLiveMatches(data, competitionName) {
  if (!data || !data.events) {
    return { matches: [], lastUpdate: new Date().toISOString(), competition: competitionName };
  }

  const matches = data.events.map(event => {
    const competition = event.competitions?.[0];
    const homeTeam = competition?.competitors?.find(c => c.homeAway === 'home');
    const awayTeam = competition?.competitors?.find(c => c.homeAway === 'away');
    
    return {
      id: event.id,
      date: event.date,
      name: event.name,
      status: event.status?.type?.description || 'Prévu',
      state: event.status?.type?.state || 'pre',
      home: {
        name: homeTeam?.team?.displayName || 'N/A',
        logo: homeTeam?.team?.logo,
        score: homeTeam?.score || '0'
      },
      away: {
        name: awayTeam?.team?.displayName || 'N/A',
        logo: awayTeam?.team?.logo,
        score: awayTeam?.score || '0'
      },
      venue: competition?.venue?.fullName || 'N/A'
    };
  });

  return {
    matches,
    lastUpdate: new Date().toISOString(),
    competition: competitionName
  };
}

// Traitement du classement
function processStandings(data, competitionName) {
  if (!data || !data.standings) {
    return { standings: [], lastUpdate: new Date().toISOString(), competition: competitionName };
  }

  const standings = data.standings.map(standing => {
    return standing.entries?.map((entry, index) => ({
      position: index + 1,
      team: entry.team?.displayName || 'N/A',
      logo: entry.team?.logos?.[0]?.href,
      stats: {
        played: entry.stats?.find(s => s.name === 'gamesPlayed')?.value || 0,
        wins: entry.stats?.find(s => s.name === 'wins')?.value || 0,
        draws: entry.stats?.find(s => s.name === 'ties')?.value || 0,
        losses: entry.stats?.find(s => s.name === 'losses')?.value || 0,
        goalsFor: entry.stats?.find(s => s.name === 'pointsFor')?.value || 0,
        goalsAgainst: entry.stats?.find(s => s.name === 'pointsAgainst')?.value || 0,
        goalDifference: entry.stats?.find(s => s.name === 'pointDifferential')?.value || 0,
        points: entry.stats?.find(s => s.name === 'points')?.value || 0
      }
    })) || [];
  }).flat();

  return {
    standings,
    lastUpdate: new Date().toISOString(),
    competition: competitionName
  };
}

// Sauvegarde locale JSON
async function saveJSON(filename, data) {
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    const filePath = path.join(OUTPUT_DIR, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    if (DEBUG) {
      log(`JSON sauvegardé: ${filename}`);
    }
    
    return filePath;
  } catch (error) {
    log(`Erreur sauvegarde ${filename}: ${error.message}`, true);
    return null;
  }
}

// Upload SFTP vers OVH
async function uploadToOVH(localPath, remoteFilename) {
  try {
    const client = await connectSFTP();
    const remotePath = `${process.env.SFTP_REMOTE_PATH}/${remoteFilename}`;
    
    // Créer le dossier distant si nécessaire
    const remoteDir = process.env.SFTP_REMOTE_PATH;
    try {
      await client.mkdir(remoteDir, true);
    } catch (err) {
      // Dossier existe déjà, ignorer l'erreur
    }
    
    await client.put(localPath, remotePath);
    
    if (DEBUG) {
      log(`Upload OVH: ${remoteFilename}`);
    }
    
    return true;
  } catch (error) {
    log(`Erreur upload ${remoteFilename}: ${error.message}`, true);
    
    // Réinitialiser la connexion en cas d'erreur
    if (sftpClient) {
      try {
        await sftpClient.end();
      } catch (e) {
        // Ignorer les erreurs de fermeture
      }
      sftpClient = null;
    }
    
    return false;
  }
}

// Mise à jour d'une compétition
async function updateCompetition(key, config) {
  try {
    // Récupération matchs en direct
    const liveData = await fetchESPNData(config.scoreboard, `${config.name} Live`);
    if (liveData) {
      const processedLive = processLiveMatches(liveData, config.name);
      const liveFilePath = await saveJSON(config.files.live, processedLive);
      if (liveFilePath) {
        await uploadToOVH(liveFilePath, config.files.live);
      }
    }

    // Récupération classement
    const standingsData = await fetchESPNData(config.standings, `${config.name} Standings`);
    if (standingsData) {
      const processedStandings = processStandings(standingsData, config.name);
      const standingsFilePath = await saveJSON(config.files.standings, processedStandings);
      if (standingsFilePath) {
        await uploadToOVH(standingsFilePath, config.files.standings);
      }
    }

    log(`✓ ${config.name} mis à jour`);
  } catch (error) {
    log(`Erreur mise à jour ${config.name}: ${error.message}`, true);
  }
}

// Boucle principale
async function mainLoop() {
  log('🚀 Démarrage du service d\'actualisation sportive');
  log(`📊 Compétitions surveillées: ${Object.keys(COMPETITIONS).length}`);
  log(`⏱️  Intervalle: ${UPDATE_INTERVAL / 1000} secondes`);
  
  while (true) {
    const startTime = Date.now();
    
    // Mise à jour de toutes les compétitions
    for (const [key, config] of Object.entries(COMPETITIONS)) {
      await updateCompetition(key, config);
    }
    
    const elapsed = Date.now() - startTime;
    log(`Cycle terminé en ${(elapsed / 1000).toFixed(2)}s`);
    
    // Attendre avant le prochain cycle
    const waitTime = Math.max(0, UPDATE_INTERVAL - elapsed);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
}

// Gestion de l'arrêt propre
process.on('SIGINT', async () => {
  log('🛑 Arrêt du service...');
  if (sftpClient) {
    try {
      await sftpClient.end();
      log('Connexion SFTP fermée');
    } catch (error) {
      // Ignorer les erreurs de fermeture
    }
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  log('🛑 Arrêt du service...');
  if (sftpClient) {
    try {
      await sftpClient.end();
    } catch (error) {
      // Ignorer les erreurs de fermeture
    }
  }
  process.exit(0);
});

// Démarrage
mainLoop().catch(error => {
  log(`Erreur fatale: ${error.message}`, true);
  process.exit(1);
});
