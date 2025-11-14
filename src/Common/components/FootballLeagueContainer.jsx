import React, { useState, useEffect } from 'react';
import FootballLeague from './FootballLeague';
import {
  getApiUrl,
  getStandingsApiUrl,
  formatDateForApi,
  getWeekendsToFetch,
  isInMatchTime
} from '../data/footballLeaguesConfig';

/**
 * Composant conteneur générique pour toutes les ligues de football
 * Gère la logique de récupération des données, cache localStorage, et chargement silencieux
 */
const FootballLeagueContainer = ({ 
  leagueConfig,      // Configuration de la ligue (ligue1Config, premierLeagueConfig, etc.)
  standingsData,     // Données de classement par défaut
  view = 'matches'   // Vue à afficher : 'matches', 'classement', 'avenir'
}) => {
  const [data, setData] = useState(null);
  const [allWeekendMatches, setAllWeekendMatches] = useState(() => {
    const cached = localStorage.getItem(`${leagueConfig.storageKey}_weekend_matches`);
    return cached ? JSON.parse(cached) : [];
  });
  const [upcomingWeekendMatches, setUpcomingWeekendMatches] = useState(() => {
    const cached = localStorage.getItem(`${leagueConfig.storageKey}_upcoming_matches`);
    return cached ? JSON.parse(cached) : [];
  });
  const [standings, setStandings] = useState(standingsData);
  const [loading, setLoading] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Loading uniquement au premier chargement
        if (firstLoad) {
          setLoading(true);
          setFirstLoad(false);
        }
        
        const now = new Date();
        const dayOfWeek = now.getDay();
        const hours = now.getHours();
        
        // Récupérer la dernière mise à jour depuis localStorage
        const lastUpdate = localStorage.getItem(`${leagueConfig.storageKey}_last_update`);
        const lastUpdateDate = lastUpdate ? new Date(lastUpdate) : null;
        
        // Conditions de mise à jour
        const shouldFetchWeekend = dayOfWeek === 1 && hours === 1; // Lundi à 1h
        const neverFetched = !lastUpdateDate;
        const isOutdated = lastUpdateDate && (now - lastUpdateDate) > 7 * 24 * 60 * 60 * 1000;
        const forceUpdate = !localStorage.getItem(`${leagueConfig.storageKey}_upcoming_matches`) || 
                           JSON.parse(localStorage.getItem(`${leagueConfig.storageKey}_upcoming_matches`) || '[]').length === 0;
        
        // Vérifier si on est dans une plage horaire de match
        const currentTime = hours * 60 + now.getMinutes();
        const isMatchTime = isInMatchTime(dayOfWeek, currentTime, leagueConfig.matchTimeRanges);
        
        // Récupérer les matchs en cours pendant les plages horaires
        if (isMatchTime) {
          const matchesResponse = await fetch(getApiUrl(leagueConfig.apiCode));
          const matchesData = await matchesResponse.json();
          setData(matchesData);
          console.log(`${leagueConfig.emoji} ${leagueConfig.name} - Actualisation matchs en cours`);
        }
        
        // Mise à jour hebdomadaire des matchs du week-end
        if (shouldFetchWeekend || neverFetched || isOutdated || forceUpdate) {
          console.log(`${leagueConfig.emoji} ${leagueConfig.name} - Mise à jour des matchs du week-end...`);
          
          // Récupérer les matchs d'aujourd'hui si pas déjà fait
          if (!isMatchTime) {
            const matchesResponse = await fetch(getApiUrl(leagueConfig.apiCode));
            const matchesData = await matchesResponse.json();
            setData(matchesData);
          }
          
          // Récupérer les matchs sur 3 week-ends
          const weekends = getWeekendsToFetch(3);
          
          try {
            const allFetches = [];
            
            // Créer toutes les requêtes pour les week-ends
            weekends.forEach((weekend) => {
              allFetches.push(
                fetch(getApiUrl(leagueConfig.apiCode, formatDateForApi(weekend.friday))),
                fetch(getApiUrl(leagueConfig.apiCode, formatDateForApi(weekend.saturday))),
                fetch(getApiUrl(leagueConfig.apiCode, formatDateForApi(weekend.sunday)))
              );
            });
            
            // Exécuter toutes les requêtes en parallèle
            const responses = await Promise.all(allFetches);
            const allData = await Promise.all(responses.map(r => r.json()));
            
            // Combiner et trier tous les matchs par date
            let allMatches = allData
              .reduce((acc, data) => [...acc, ...(data.events || [])], [])
              .sort((a, b) => new Date(a.date) - new Date(b.date));
            
            // Séparer les matchs en deux journées : semaine actuelle et suivante
            let currentWeekendMatches = [];
            let nextWeekendMatches = [];
            
            if (allMatches.length > 0) {
              const firstMatchDate = new Date(allMatches[0].date);
              const firstWeekendStart = new Date(firstMatchDate);
              firstWeekendStart.setHours(0, 0, 0, 0);
              
              const dayOfFirstMatch = firstMatchDate.getDay();
              const daysUntilSunday = dayOfFirstMatch === 0 ? 0 : 7 - dayOfFirstMatch;
              
              const firstWeekendEnd = new Date(firstWeekendStart);
              firstWeekendEnd.setDate(firstWeekendStart.getDate() + daysUntilSunday + 1);
              
              currentWeekendMatches = allMatches.filter(match => {
                const matchDate = new Date(match.date);
                return matchDate >= firstWeekendStart && matchDate < firstWeekendEnd;
              });
              
              nextWeekendMatches = allMatches.filter(match => {
                const matchDate = new Date(match.date);
                return matchDate >= firstWeekendEnd;
              });
            }
            
            console.log(`${leagueConfig.emoji} Matchs semaine actuelle: ${currentWeekendMatches.length}`);
            console.log(`${leagueConfig.emoji} Matchs semaine suivante: ${nextWeekendMatches.length}`);
            
            setAllWeekendMatches(currentWeekendMatches);
            setUpcomingWeekendMatches(nextWeekendMatches);
            
            // Sauvegarder dans localStorage
            localStorage.setItem(`${leagueConfig.storageKey}_weekend_matches`, JSON.stringify(currentWeekendMatches));
            localStorage.setItem(`${leagueConfig.storageKey}_upcoming_matches`, JSON.stringify(nextWeekendMatches));
            localStorage.setItem(`${leagueConfig.storageKey}_last_update`, now.toISOString());
            console.log(`✅ ${leagueConfig.name} - Matchs sauvegardés dans le cache`);
          } catch (weekendError) {
            console.log(`Erreur récupération matchs week-end ${leagueConfig.name}:`, weekendError);
          }
        } else if (!isMatchTime) {
          console.log(`📦 ${leagueConfig.name} - Utilisation des matchs en cache`);
        }
        
        // Récupérer le classement depuis l'API
        try {
          const standingsResponse = await fetch(getStandingsApiUrl(leagueConfig.apiCode));
          const standingsApiData = await standingsResponse.json();
          
          if (standingsApiData?.children?.[0]?.standings?.entries) {
            const apiStandings = standingsApiData.children[0].standings.entries.map(entry => ({
              team: entry.team.displayName,
              played: entry.stats.find(s => s.name === 'gamesPlayed')?.value || 0,
              wins: entry.stats.find(s => s.name === 'wins')?.value || 0,
              draws: entry.stats.find(s => s.name === 'ties')?.value || 0,
              losses: entry.stats.find(s => s.name === 'losses')?.value || 0,
              goalsFor: entry.stats.find(s => s.name === 'pointsFor')?.value || 0,
              goalsAgainst: entry.stats.find(s => s.name === 'pointsAgainst')?.value || 0,
              points: entry.stats.find(s => s.name === 'points')?.value || 0
            }));
            setStandings(apiStandings);
          }
        } catch (standingsError) {
          console.log(`${leagueConfig.name} - Classement API non disponible, utilisation des données de secours`);
        }
        
      } catch (error) {
        console.error(`Erreur lors du chargement ${leagueConfig.name}:`, error);
      } finally {
        // Désactiver le loading après le premier chargement seulement
        if (loading) {
          setLoading(false);
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Vérifier toutes les 10 secondes
    return () => clearInterval(interval);
  }, [firstLoad, loading, leagueConfig]);

  if (loading) return <div className="loading"><h2>Chargement...</h2></div>;

  return (
    <FootballLeague 
      leagueData={data}
      weekendMatches={allWeekendMatches}
      upcomingMatches={upcomingWeekendMatches}
      standingsData={standings}
      leagueConfig={leagueConfig}
      view={view}
    />
  );
};

export default FootballLeagueContainer;
