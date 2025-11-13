import React, { useState, useEffect } from 'react';
import FootballLeague from '../../../Common/components/FootballLeague';
import { leaguesConfig } from '../../../Common/data/leaguesConfig';
import { currentLaLigaStandings } from '../../../Common/data/standingsData';

const LaLiga = ({ view = 'matches' }) => {
  const [data, setData] = useState(null);
  const [allWeekendMatches, setAllWeekendMatches] = useState(() => {
    const cached = localStorage.getItem('laliga_weekend_matches');
    return cached ? JSON.parse(cached) : [];
  });
  const [upcomingWeekendMatches, setUpcomingWeekendMatches] = useState(() => {
    const cached = localStorage.getItem('laliga_upcoming_matches');
    return cached ? JSON.parse(cached) : [];
  });
  const [standings, setStandings] = useState(currentLaLigaStandings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const now = new Date();
        const dayOfWeek = now.getDay();
        const hours = now.getHours();
        const lastUpdate = localStorage.getItem('laliga_last_update');
        const lastUpdateDate = lastUpdate ? new Date(lastUpdate) : null;
        const shouldFetchWeekend = dayOfWeek === 1 && hours === 1;
        const neverFetched = !lastUpdateDate;
        const isOutdated = lastUpdateDate && (now - lastUpdateDate) > 7 * 24 * 60 * 60 * 1000;
        const forceUpdate = !localStorage.getItem('laliga_upcoming_matches') || JSON.parse(localStorage.getItem('laliga_upcoming_matches') || '[]').length === 0;
        const currentTime = hours * 60 + now.getMinutes();
        const isMatchTime = 
          (dayOfWeek === 5 && currentTime >= 20 * 60 + 59 && currentTime <= 23 * 60 + 30) || // Vendredi 20h59-23h30
          (dayOfWeek === 6 && currentTime >= 13 * 60 + 59 && currentTime <= 23 * 60 + 30) || // Samedi 13h59-23h30
          (dayOfWeek === 0 && currentTime >= 13 * 60 + 59 && currentTime <= 23 * 60 + 30) || // Dimanche 13h59-23h30
          (dayOfWeek === 1 && currentTime >= 21 * 60 && currentTime <= 23 * 60 + 20); // Lundi 21h00-23h20
        
        if (isMatchTime) {
          const matchesResponse = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard');
          const matchesData = await matchesResponse.json();
          setData(matchesData);
        }
        
        if (shouldFetchWeekend || neverFetched || isOutdated || forceUpdate) {
          if (!isMatchTime) {
            const matchesResponse = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard');
            const matchesData = await matchesResponse.json();
            setData(matchesData);
          }
          
          const today = new Date();
          const currentDayOfWeek = today.getDay();
          const weekends = [];
          let daysToFriday = currentDayOfWeek === 0 ? 5 : currentDayOfWeek >= 1 && currentDayOfWeek <= 4 ? 5 - currentDayOfWeek : currentDayOfWeek === 6 ? -1 : 0;
          
          for (let week = 0; week < 3; week++) {
            const baseFriday = new Date(today);
            baseFriday.setDate(today.getDate() + daysToFriday + (week * 7));
            weekends.push({
              friday: new Date(baseFriday),
              saturday: new Date(baseFriday.getTime() + 24 * 60 * 60 * 1000),
              sunday: new Date(baseFriday.getTime() + 2 * 24 * 60 * 60 * 1000)
            });
          }
          
          const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}${month}${day}`;
          };
          
          try {
            const allFetches = [];
            weekends.forEach((weekend) => {
              allFetches.push(
                fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard?dates=${formatDate(weekend.friday)}`),
                fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard?dates=${formatDate(weekend.saturday)}`),
                fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard?dates=${formatDate(weekend.sunday)}`)
              );
            });
            
            const responses = await Promise.all(allFetches);
            const allData = await Promise.all(responses.map(r => r.json()));
            let allMatches = allData.reduce((acc, data) => [...acc, ...(data.events || [])], []).sort((a, b) => new Date(a.date) - new Date(b.date));
            
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
            
            setAllWeekendMatches(currentWeekendMatches);
            setUpcomingWeekendMatches(nextWeekendMatches);
            localStorage.setItem('laliga_weekend_matches', JSON.stringify(currentWeekendMatches));
            localStorage.setItem('laliga_upcoming_matches', JSON.stringify(nextWeekendMatches));
            localStorage.setItem('laliga_last_update', now.toISOString());
          } catch (weekendError) {
            console.log('Erreur récupération matchs week-end La Liga:', weekendError);
          }
        } else if (!isMatchTime) {
          console.log('📦 Utilisation des matchs La Liga en cache');
        }
        
        try {
          const standingsResponse = await fetch('https://site.api.espn.com/apis/v2/sports/soccer/esp.1/standings');
          const standingsData = await standingsResponse.json();
          if (standingsData?.children?.[0]?.standings?.entries) {
            const apiStandings = standingsData.children[0].standings.entries.map(entry => ({
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
          console.log('Classement API non disponible');
        }
      } catch (error) {
        console.error('Erreur lors du chargement La Liga:', error);
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
      leagueConfig={leaguesConfig.laliga}
      view={view}
    />
  );
};

export default LaLiga;
