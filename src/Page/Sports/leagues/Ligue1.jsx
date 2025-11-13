import React, { useState, useEffect } from 'react';
import FootballLeague from '../../../Common/components/FootballLeague';
import { leaguesConfig } from '../../../Common/data/leaguesConfig';
import { currentLigue1Standings } from '../../../Common/data/standingsData';

const Ligue1 = ({ view = 'matches' }) => {
  const [data, setData] = useState(null);
  const [allWeekendMatches, setAllWeekendMatches] = useState(() => {
    // Charger depuis localStorage au démarrage
    const cached = localStorage.getItem('ligue1_weekend_matches');
    return cached ? JSON.parse(cached) : [];
  });
  const [upcomingWeekendMatches, setUpcomingWeekendMatches] = useState(() => {
    // Charger les matchs à venir depuis localStorage
    const cached = localStorage.getItem('ligue1_upcoming_matches');
    return cached ? JSON.parse(cached) : [];
  });
  const [standings, setStandings] = useState(currentLigue1Standings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Vérifier si on doit faire l'appel API pour les matchs du week-end
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 = dimanche, 1 = lundi
        const hours = now.getHours();
        
        // Récupérer la dernière mise à jour depuis localStorage
        const lastUpdate = localStorage.getItem('ligue1_last_update');
        const lastUpdateDate = lastUpdate ? new Date(lastUpdate) : null;
        
        // Faire l'appel seulement le lundi à 1h du matin
        const shouldFetchWeekend = dayOfWeek === 1 && hours === 1;
        
        // Ou si jamais fait auparavant
        const neverFetched = !lastUpdateDate;
        
        // Ou si la dernière mise à jour date de plus d'une semaine
        const isOutdated = lastUpdateDate && (now - lastUpdateDate) > 7 * 24 * 60 * 60 * 1000;
        
        // TEMPORAIRE : Forcer la mise à jour pour tester
        const forceUpdate = !localStorage.getItem('ligue1_upcoming_matches') || 
                           JSON.parse(localStorage.getItem('ligue1_upcoming_matches') || '[]').length === 0;
        
        // Vérifier les plages horaires pour les matchs en cours
        const currentTime = hours * 60 + now.getMinutes();
        const isMatchTime = 
          (dayOfWeek === 5 && currentTime >= 20 * 60 + 44 && currentTime <= 23 * 60 + 20) || // Vendredi 20h44-23h20
          (dayOfWeek === 6 && currentTime >= 16 * 60 + 59 && currentTime <= 23 * 60 + 10) || // Samedi 16h59-23h10
          (dayOfWeek === 0 && currentTime >= 14 * 60 + 59 && currentTime <= 23 * 60 + 10) || // Dimanche 14h59-23h10
          (dayOfWeek === 3 && currentTime >= 20 * 60 + 44 && currentTime <= 23 * 60 + 20);   // Mercredi 20h44-23h20
        
        // Récupérer les matchs en cours seulement pendant les plages horaires
        if (isMatchTime) {
          const matchesResponse = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/scoreboard');
          const matchesData = await matchesResponse.json();
          setData(matchesData);
          console.log('⚽ Actualisation matchs en cours');
        }
        
        if (shouldFetchWeekend || neverFetched || isOutdated || forceUpdate) {
          console.log('🔄 Mise à jour des matchs du week-end...');
          
          // Récupérer les matchs d'aujourd'hui si pas déjà fait
          if (!isMatchTime) {
            const matchesResponse = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/scoreboard');
            const matchesData = await matchesResponse.json();
            setData(matchesData);
          }
        
        // Récupérer les matchs du week-end (vendredi, samedi, dimanche)
        const today = new Date();
        const currentDayOfWeek = today.getDay();
        
        // Chercher les matchs sur plusieurs semaines si nécessaire
        const weekends = [];
        
        // Week-end actuel
        let daysToFriday;
        if (currentDayOfWeek === 0) { // Dimanche
          daysToFriday = 5; // Prochain vendredi
        } else if (currentDayOfWeek >= 1 && currentDayOfWeek <= 4) { // Lundi à Jeudi
          daysToFriday = 5 - currentDayOfWeek; // Vendredi de cette semaine
        } else { // Vendredi (5) ou Samedi (6)
          daysToFriday = 0;
          if (currentDayOfWeek === 6) daysToFriday = -1;
        }
        
        // Ajouter ce week-end
        for (let week = 0; week < 3; week++) { // Chercher sur 3 semaines
          const baseFriday = new Date(today);
          baseFriday.setDate(today.getDate() + daysToFriday + (week * 7));
          
          weekends.push({
            friday: new Date(baseFriday),
            saturday: new Date(baseFriday.getTime() + 24 * 60 * 60 * 1000),
            sunday: new Date(baseFriday.getTime() + 2 * 24 * 60 * 60 * 1000)
          });
        }
        
        // Fonction pour formater la date au format YYYYMMDD
        const formatDate = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}${month}${day}`;
        };
        
        // Récupérer les matchs pour chaque jour
        try {
          const allFetches = [];
          
          // Fetch pour tous les week-ends
          weekends.forEach((weekend, index) => {
            console.log(`Week-end ${index + 1}:`);
            console.log('Vendredi:', formatDate(weekend.friday));
            console.log('Samedi:', formatDate(weekend.saturday));
            console.log('Dimanche:', formatDate(weekend.sunday));
            
            allFetches.push(
              fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/scoreboard?dates=${formatDate(weekend.friday)}`),
              fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/scoreboard?dates=${formatDate(weekend.saturday)}`),
              fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/scoreboard?dates=${formatDate(weekend.sunday)}`)
            );
          });
          
          const responses = await Promise.all(allFetches);
          const allData = await Promise.all(responses.map(r => r.json()));
          
          // Combiner tous les matchs et les trier par date
          let allMatches = allData.reduce((acc, data) => {
            return [...acc, ...(data.events || [])];
          }, []).sort((a, b) => new Date(a.date) - new Date(b.date));
          
          // Séparer en deux journées : cette semaine et semaine prochaine
          let currentWeekendMatches = [];
          let nextWeekendMatches = [];
          
          if (allMatches.length > 0) {
            // Trouver la première date de match
            const firstMatchDate = new Date(allMatches[0].date);
            const firstWeekendStart = new Date(firstMatchDate);
            firstWeekendStart.setHours(0, 0, 0, 0);
            
            // Trouver le dimanche de ce week-end
            const dayOfFirstMatch = firstMatchDate.getDay();
            const daysUntilSunday = dayOfFirstMatch === 0 ? 0 : 7 - dayOfFirstMatch;
            const firstWeekendEnd = new Date(firstWeekendStart);
            firstWeekendEnd.setDate(firstWeekendStart.getDate() + daysUntilSunday + 1);
            
            // Séparer les matchs
            currentWeekendMatches = allMatches.filter(match => {
              const matchDate = new Date(match.date);
              return matchDate >= firstWeekendStart && matchDate < firstWeekendEnd;
            });
            
            nextWeekendMatches = allMatches.filter(match => {
              const matchDate = new Date(match.date);
              return matchDate >= firstWeekendEnd;
            });
          }
          
          console.log('Matchs semaine actuelle:', currentWeekendMatches.length);
          console.log('Matchs semaine suivante:', nextWeekendMatches.length);
          
          setAllWeekendMatches(currentWeekendMatches);
          setUpcomingWeekendMatches(nextWeekendMatches);
          
          // Sauvegarder dans localStorage
          localStorage.setItem('ligue1_weekend_matches', JSON.stringify(currentWeekendMatches));
          localStorage.setItem('ligue1_upcoming_matches', JSON.stringify(nextWeekendMatches));
          localStorage.setItem('ligue1_last_update', now.toISOString());
          console.log('✅ Matchs sauvegardés dans le cache');
        } catch (weekendError) {
          console.log('Erreur récupération matchs week-end:', weekendError);
        }
      } else if (!isMatchTime) {
        // En dehors des plages horaires et pas de mise à jour nécessaire
        console.log('📦 Utilisation des matchs en cache (hors plage horaire)');
      }
        
        // Récupérer le classement
        try {
          const standingsResponse = await fetch('https://site.api.espn.com/apis/v2/sports/soccer/fra.1/standings');
          const standingsData = await standingsResponse.json();
          
          if (standingsData?.children?.[0]?.standings?.entries) {
            const teamAbbreviations = {
              'Paris Saint-Germain': 'PSG',
              'Marseille': 'OM',
              'Lyon': 'OL',
              'Monaco': 'ASM',
              'Lille': 'LOSC',
              'Nice': 'OGC Nice',
              'Rennes': 'Stade Rennais',
              'Lens': 'RC Lens',
              'Strasbourg': 'RC Strasbourg',
              'Montpellier': 'MHSC',
              'Nantes': 'FC Nantes',
              'Toulouse': 'TFC',
              'Reims': 'Stade de Reims',
              'Brest': 'Stade Brestois',
              'Lorient': 'FC Lorient',
              'Le Havre': 'Le Havre AC',
              'Clermont Foot': 'Clermont',
              'Auxerre': 'AJ Auxerre',
              'Angers': 'SCO Angers',
              'Metz': 'FC Metz',
              'Saint-Étienne': 'ASSE'
            };

            const apiStandings = standingsData.children[0].standings.entries.map(entry => {
              const teamName = entry.team.displayName;
              const abbreviatedName = teamAbbreviations[teamName] || teamName;
              
              return {
                team: abbreviatedName,
                played: entry.stats.find(s => s.name === 'gamesPlayed')?.value || 0,
                wins: entry.stats.find(s => s.name === 'wins')?.value || 0,
                draws: entry.stats.find(s => s.name === 'ties')?.value || 0,
                losses: entry.stats.find(s => s.name === 'losses')?.value || 0,
                goalsFor: entry.stats.find(s => s.name === 'pointsFor')?.value || 0,
                goalsAgainst: entry.stats.find(s => s.name === 'pointsAgainst')?.value || 0,
                points: entry.stats.find(s => s.name === 'points')?.value || 0
              };
            });
            setStandings(apiStandings);
          }
        } catch (standingsError) {
          console.log('Classement API non disponible, utilisation des données de secours');
        }
        
      } catch (error) {
        console.error('Erreur lors du chargement Ligue 1:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="loading"><h2>Chargement...</h2></div>;

  return (
    <FootballLeague 
      leagueData={data}
      weekendMatches={allWeekendMatches}
      upcomingMatches={upcomingWeekendMatches}
      standingsData={standings}
      leagueConfig={leaguesConfig.ligue1}
      view={view}
    />
  );
};

export default Ligue1;
