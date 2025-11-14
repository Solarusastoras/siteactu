/**
 * Configuration centralisée pour toutes les ligues de football
 */

// Configuration Ligue 1
export const ligue1Config = {
  name: 'Ligue 1',
  emoji: '⚽',
  apiCode: 'fra.1',
  storageKey: 'ligue1',
  matchTimeRanges: [
    { day: 5, start: 20 * 60 + 44, end: 23 * 60 + 20 }, // Vendredi 20h44-23h20
    { day: 6, start: 16 * 60 + 59, end: 23 * 60 + 10 }, // Samedi 16h59-23h10
    { day: 0, start: 14 * 60 + 59, end: 23 * 60 + 10 }, // Dimanche 14h59-23h10
    { day: 3, start: 20 * 60 + 44, end: 23 * 60 + 20 }  // Mercredi 20h44-23h20
  ]
};

// Configuration Ligue 2
export const ligue2Config = {
  name: 'Ligue 2',
  emoji: '⚽',
  apiCode: 'fra.2',
  storageKey: 'ligue2',
  matchTimeRanges: [
    { day: 5, start: 20 * 60, end: 23 * 60 + 30 },      // Vendredi 20h00-23h30
    { day: 6, start: 14 * 60 + 59, end: 23 * 60 + 30 }, // Samedi 14h59-23h30
    { day: 1, start: 20 * 60 + 44, end: 23 * 60 + 30 }  // Lundi 20h44-23h30
  ]
};

// Configuration Premier League
export const premierLeagueConfig = {
  name: 'Premier League',
  emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  apiCode: 'eng.1',
  storageKey: 'premier',
  matchTimeRanges: [
    { day: 6, start: 13 * 60 + 29, end: 21 * 60 },        // Samedi 13h29-21h00
    { day: 0, start: 14 * 60 + 59, end: 20 * 60 },        // Dimanche 14h59-20h00
    { day: 1, start: 20 * 60 + 59, end: 23 * 60 + 20 },   // Lundi 20h59-23h20
    { day: 2, start: 20 * 60 + 29, end: 23 * 60 + 30 },   // Mardi 20h29-23h30
    { day: 3, start: 20 * 60 + 29, end: 23 * 60 + 30 },   // Mercredi 20h29-23h30
    { day: 4, start: 20 * 60 + 29, end: 23 * 60 + 30 }    // Jeudi 20h29-23h30
  ]
};

// Configuration La Liga
export const laLigaConfig = {
  name: 'La Liga',
  emoji: '🇪🇸',
  apiCode: 'esp.1',
  storageKey: 'laliga',
  matchTimeRanges: [
    { day: 5, start: 20 * 60 + 59, end: 23 * 60 + 30 }, // Vendredi 20h59-23h30
    { day: 6, start: 13 * 60 + 59, end: 23 * 60 + 30 }, // Samedi 13h59-23h30
    { day: 0, start: 13 * 60 + 59, end: 23 * 60 + 30 }, // Dimanche 13h59-23h30
    { day: 1, start: 21 * 60, end: 23 * 60 + 20 }       // Lundi 21h00-23h20
  ]
};

// Configuration Serie A
export const serieAConfig = {
  name: 'Serie A',
  emoji: '🇮🇹',
  apiCode: 'ita.1',
  storageKey: 'seriea',
  matchTimeRanges: [
    { day: 6, start: 14 * 60 + 59, end: 23 * 60 + 30 }, // Samedi 14h59-23h30
    { day: 0, start: 12 * 60 + 29, end: 23 * 60 + 30 }, // Dimanche 12h29-23h30
    { day: 1, start: 18 * 60 + 29, end: 23 * 60 + 20 }, // Lundi 18h29-23h20
    { day: 3, start: 20 * 60 + 44, end: 23 * 60 + 20 }  // Mercredi 20h44-23h20
  ]
};

// Configuration Bundesliga
export const bundesligaConfig = {
  name: 'Bundesliga',
  emoji: '🇩🇪',
  apiCode: 'ger.1',
  storageKey: 'bundesliga',
  matchTimeRanges: [
    { day: 5, start: 20 * 60 + 29, end: 23 * 60 + 20 }, // Vendredi 20h29-23h20
    { day: 6, start: 15 * 60 + 29, end: 21 * 60 },      // Samedi 15h29-21h00
    { day: 0, start: 15 * 60 + 29, end: 20 * 60 }       // Dimanche 15h29-20h00
  ]
};

// Configuration Brasileirão
export const brasileiraoConfig = {
  name: 'Brasileirão',
  emoji: '🇧🇷',
  apiCode: 'bra.1',
  storageKey: 'brasileirao',
  matchTimeRanges: [
    { day: 6, start: 19 * 60 + 59, end: 24 * 60 },      // Samedi à partir de 19h59
    { day: 0, start: 0, end: 4 * 60 },                   // Dimanche 0h-4h (fin samedi soir)
    { day: 0, start: 19 * 60, end: 24 * 60 },            // Dimanche 19h-minuit
    { day: 1, start: 0, end: 4 * 60 },                   // Lundi 0h-4h (fin dimanche soir)
    { day: 3, start: 0, end: 4 * 60 },                   // Mercredi 0h-4h (fin mardi soir)
    { day: 3, start: 21 * 60 + 59, end: 24 * 60 },       // Mercredi 21h59-minuit
    { day: 4, start: 0, end: 4 * 60 }                    // Jeudi 0h-4h (fin mercredi soir)
  ]
};

/**
 * Fonction helper pour vérifier si on est dans une plage horaire de match
 */
export const isInMatchTime = (dayOfWeek, currentTime, matchTimeRanges) => {
  return matchTimeRanges.some(range => {
    if (range.day !== dayOfWeek) return false;
    
    // Gestion du passage de minuit
    if (range.end === 24 * 60 || range.start > range.end) {
      return currentTime >= range.start || currentTime <= (range.end % (24 * 60));
    }
    
    return currentTime >= range.start && currentTime <= range.end;
  });
};

/**
 * Fonction pour obtenir l'URL de l'API ESPN pour une ligue
 */
export const getApiUrl = (apiCode, date = null) => {
  const baseUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/${apiCode}/scoreboard`;
  if (date) {
    return `${baseUrl}?dates=${date}`;
  }
  return baseUrl;
};

/**
 * Fonction pour obtenir l'URL de l'API des classements
 */
export const getStandingsApiUrl = (apiCode) => {
  return `https://site.api.espn.com/apis/v2/sports/soccer/${apiCode}/standings`;
};

/**
 * Fonction pour formater une date au format YYYYMMDD pour l'API ESPN
 */
export const formatDateForApi = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

/**
 * Fonction pour calculer les week-ends à récupérer
 */
export const getWeekendsToFetch = (weeksCount = 3) => {
  const today = new Date();
  const currentDayOfWeek = today.getDay();
  
  // Calculer le prochain vendredi
  let daysToFriday;
  if (currentDayOfWeek === 0) { // Dimanche
    daysToFriday = 5;
  } else if (currentDayOfWeek >= 1 && currentDayOfWeek <= 4) { // Lundi à Jeudi
    daysToFriday = 5 - currentDayOfWeek;
  } else if (currentDayOfWeek === 6) { // Samedi
    daysToFriday = -1;
  } else { // Vendredi
    daysToFriday = 0;
  }
  
  const weekends = [];
  for (let week = 0; week < weeksCount; week++) {
    const baseFriday = new Date(today);
    baseFriday.setDate(today.getDate() + daysToFriday + (week * 7));
    
    weekends.push({
      friday: new Date(baseFriday),
      saturday: new Date(baseFriday.getTime() + 24 * 60 * 60 * 1000),
      sunday: new Date(baseFriday.getTime() + 2 * 24 * 60 * 60 * 1000)
    });
  }
  
  return weekends;
};
