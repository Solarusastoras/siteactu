/**
 * Configuration centralisée pour toutes les ligues de football
 * Contient les règles de classement, légendes et métadonnées
 */

export const leaguesConfig = {
  ligue1: {
    id: 'ligue1',
    name: 'Ligue 1',
    icon: '🏆',
    flag: '🇫🇷',
    apiEndpoint: 'fra.1',
    positionRules: [
      { range: [1, 3], class: 'champions' },
      { positions: [4], class: 'playoff' },
      { positions: [5], class: 'europa' },
      { positions: [6], class: 'conference' },
      { positions: [16], class: 'relegation-playoff' },
      { range: [17, 18], class: 'relegation' }
    ],
    legend: [
      { class: 'champions', icon: '🏆', label: 'Ligue des Champions' },
      { class: 'playoff', icon: '🎯', label: 'Barrages LDC' },
      { class: 'europa', icon: '🥈', label: 'Ligue Europa de l\'UEFA' },
      { class: 'conference', icon: '🥉', label: 'Conference League Qualification' },
      { class: 'relegation-playoff', icon: '⚠️', label: 'Barrages de relégation' },
      { class: 'relegation', icon: '⬇️', label: 'Relégation' }
    ],
    schedule: {
      enabled: true,
      days: [5, 6, 0],
      startHour: 14,
      endHour: 23,
      interval: 30
    }
  },

  ligue2: {
    id: 'ligue2',
    name: 'Ligue 2',
    icon: '⚽',
    flag: '🇫🇷',
    apiEndpoint: 'fra.2',
    positionRules: [
      { range: [1, 2], class: 'promotion' },
      { range: [3, 5], class: 'playoff' },
      { positions: [16], class: 'relegation-playoff' },
      { range: [17, 18], class: 'relegation' }
    ],
    legend: [
      { class: 'promotion', icon: '⬆️', label: 'Accession' },
      { class: 'playoff', icon: '🎯', label: 'Barrages d\'accession' },
      { class: 'relegation-playoff', icon: '⚠️', label: 'Barrages de relégation' },
      { class: 'relegation', icon: '⬇️', label: 'Relégation' }
    ],
    schedule: {
      enabled: true,
      days: [5, 6, 1],
      startHour: 18,
      endHour: 23,
      interval: 30
    }
  },

  premier: {
    id: 'premier',
    name: 'Premier League',
    icon: '🏆',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    apiEndpoint: 'eng.1',
    positionRules: [
      { range: [1, 4], class: 'champions' },
      { positions: [5], class: 'europa' },
      { range: [18, 20], class: 'relegation' }
    ],
    legend: [
      { class: 'champions', icon: '🏆', label: 'Ligue des Champions (1 à 4)' },
      { class: 'europa', icon: '🥈', label: 'Ligue Europa de l\'UEFA (5)' },
      { class: 'relegation', icon: '⬇️', label: 'Relégation (18 à 20)' }
    ],
    schedule: {
      enabled: true,
      days: [6, 0],
      startHour: 13,
      endHour: 22,
      interval: 30
    }
  },

  laliga: {
    id: 'laliga',
    name: 'La Liga',
    icon: '🇪🇸',
    flag: '🇪🇸',
    apiEndpoint: 'esp.1',
    positionRules: [
      { range: [1, 4], class: 'champions' },
      { positions: [5], class: 'europa' },
      { positions: [6], class: 'conference' },
      { range: [18, 20], class: 'relegation' }
    ],
    legend: [
      { class: 'champions', icon: '🏆', label: 'Ligue des Champions (1 à 4)' },
      { class: 'europa', icon: '🥈', label: 'Ligue Europa de l\'UEFA (5)' },
      { class: 'conference', icon: '🌍', label: 'Conference League Qualification (6)' },
      { class: 'relegation', icon: '⬇️', label: 'Relégation (18 à 20)' }
    ],
    schedule: {
      enabled: true,
      days: [5, 6, 0, 1],
      startHour: 16,
      endHour: 23,
      interval: 30
    }
  },

  seriea: {
    id: 'seriea',
    name: 'Serie A',
    icon: '🇮🇹',
    flag: '🇮🇹',
    apiEndpoint: 'ita.1',
    positionRules: [
      { range: [1, 4], class: 'champions' },
      { positions: [5], class: 'europa' },
      { positions: [6], class: 'conference' },
      { range: [18, 20], class: 'relegation' }
    ],
    legend: [
      { class: 'champions', icon: '🏆', label: 'Ligue des Champions (1 à 4)' },
      { class: 'europa', icon: '🌍', label: 'Ligue Europa (5)' },
      { class: 'conference', icon: '🌍', label: 'Conference League (6)' },
      { class: 'relegation', icon: '⬇️', label: 'Relégation (18 à 20)' }
    ],
    schedule: {
      enabled: true,
      days: [5, 6, 0, 1],
      startHour: 18,
      endHour: 23,
      interval: 30
    }
  },

  bundesliga: {
    id: 'bundesliga',
    name: 'Bundesliga',
    icon: '🇩🇪',
    flag: '🇩🇪',
    apiEndpoint: 'ger.1',
    positionRules: [
      { range: [1, 4], class: 'champions' },
      { positions: [5], class: 'europa' },
      { positions: [6], class: 'conference' },
      { positions: [16], class: 'relegation-playoff' },
      { range: [17, 18], class: 'relegation' }
    ],
    legend: [
      { class: 'champions', icon: '🏆', label: 'Ligue des Champions' },
      { class: 'europa', icon: '🌍', label: 'Ligue Europa' },
      { class: 'conference', icon: '🌍', label: 'Conference League' },
      { class: 'relegation-playoff', icon: '🔄', label: 'Barrages de relégation' },
      { class: 'relegation', icon: '⬇️', label: 'Relégation' }
    ],
    schedule: {
      enabled: true,
      days: [5, 6, 0],
      startHour: 15,
      endHour: 22,
      interval: 30
    }
  },

  botola: {
    id: 'botola',
    name: 'Botola Pro',
    icon: '🇲🇦',
    flag: '🇲🇦',
    apiEndpoint: 'mar.1',
    positionRules: [
      { range: [1, 2], class: 'champions' },
      { positions: [3], class: 'conference' },
      { range: [13, 14], class: 'relegation-playoff' },
      { range: [15, 16], class: 'relegation' }
    ],
    legend: [
      { class: 'champions', icon: '🏆', label: 'Ligue des Champions CAF (1 et 2)' },
      { class: 'conference', icon: '🌍', label: 'Coupe des Confédérations CAF (3)' },
      { class: 'relegation-playoff', icon: '🔄', label: 'Barrages de relégation (13 et 14)' },
      { class: 'relegation', icon: '⬇️', label: 'Relégation (15 et 16)' }
    ],
    schedule: {
      enabled: true,
      days: [5, 6, 0, 1],
      startHour: 15,
      endHour: 22,
      interval: 30
    }
  },

  brasileirao: {
    id: 'brasileirao',
    name: 'Brasileirão Betano',
    icon: '🇧🇷',
    flag: '🇧🇷',
    apiEndpoint: 'bra.1',
    positionRules: [
      { range: [1, 4], class: 'champions' },
      { range: [5, 6], class: 'playoff' },
      { range: [7, 12], class: 'europa' },
      { range: [17, 20], class: 'relegation' }
    ],
    legend: [
      { class: 'champions', icon: '🏆', label: 'Copa Libertadores (1 à 4)' },
      { class: 'playoff', icon: '🔄', label: 'Qualifications Copa Libertadores (5 et 6)' },
      { class: 'europa', icon: '🌍', label: 'Copa Sudamericana (7 à 12)' },
      { class: 'relegation', icon: '⬇️', label: 'Relégation (17 à 20)' }
    ],
    schedule: {
      enabled: true,
      days: [6, 0, 3],
      startHour: 19,
      endHour: 5,
      interval: 30
    }
  }
};

// Export individuel pour faciliter l'import
export const {
  ligue1: ligue1Config,
  ligue2: ligue2Config,
  premier: premierConfig,
  laliga: laligaConfig,
  seriea: serieaConfig,
  bundesliga: bundesligaConfig,
  botola: botolaConfig,
  brasileirao: brasileiraoConfig
} = leaguesConfig;
