import React, { useState, useEffect } from 'react';
import FootballLeague from '../../../Common/components/FootballLeague';
import GroupStageTable from '../../../Common/components/GroupStageTable';
import AfricNationCupWrapper from './AfricNationCupWrapper';
import africanCupData from '../../../Data/Foot/dataAfricNationCup.json';
import {
  getApiUrl,
  formatDateForApi,
  isInMatchTime,
  africanCupConfig
} from '../../../Common/data/footballLeaguesConfig';

const AfricNationCup = ({ view = 'matches' }) => {
  const [data, setData] = useState(null);
  const [allWeekendMatches, setAllWeekendMatches] = useState(() => {
    const cached = localStorage.getItem('africancup_weekend_matches');
    return cached ? JSON.parse(cached) : [];
  });
  const [upcomingWeekendMatches, setUpcomingWeekendMatches] = useState(() => {
    const cached = localStorage.getItem('africancup_upcoming_matches');
    return cached ? JSON.parse(cached) : [];
  });
  const [standings, setStandings] = useState(() => {
    const cached = localStorage.getItem('africancup_standings');
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const now = new Date();
        const dayOfWeek = now.getDay();
        const hours = now.getHours();
        
        const lastUpdate = localStorage.getItem('africancup_last_update');
        const lastUpdateDate = lastUpdate ? new Date(lastUpdate) : null;
        
        const shouldFetchWeekend = dayOfWeek === 1 && hours === 1;
        const neverFetched = !lastUpdateDate;
        const isOutdated = lastUpdateDate && (now - lastUpdateDate) > 7 * 24 * 60 * 60 * 1000;
        const forceUpdate = !localStorage.getItem('africancup_upcoming_matches') || 
                           JSON.parse(localStorage.getItem('africancup_upcoming_matches') || '[]').length === 0;
        
        const currentTime = hours * 60 + now.getMinutes();
        const isMatchTime = isInMatchTime(dayOfWeek, currentTime, africanCupConfig.matchTimeRanges);
        
        if (isMatchTime) {
          const matchesResponse = await fetch(getApiUrl(africanCupConfig.apiCode));
          const matchesData = await matchesResponse.json();
          setData(matchesData);
          console.log('🦁 CAN - Actualisation matchs en cours');
        }
        
        if (shouldFetchWeekend || neverFetched || isOutdated || forceUpdate) {
          console.log('🦁 CAN - Mise à jour des matchs...');
          
          if (!isMatchTime) {
            const matchesResponse = await fetch(getApiUrl(africanCupConfig.apiCode));
            const matchesData = await matchesResponse.json();
            setData(matchesData);
          }
          
          try {
            const allFetches = [];
            const today = new Date();
            
            for (let i = -30; i < 30; i++) {
              const date = new Date(today);
              date.setDate(today.getDate() + i);
              allFetches.push(fetch(getApiUrl(africanCupConfig.apiCode, formatDateForApi(date))));
            }
            
            const responses = await Promise.all(allFetches);
            const allData = await Promise.all(responses.map(r => r.json()));
            
            let allMatches = allData
              .reduce((acc, data) => [...acc, ...(data.events || [])], [])
              .sort((a, b) => new Date(a.date) - new Date(b.date));
            
            if (allMatches.length > 0) {
              const todayEnd = new Date(now);
              todayEnd.setHours(23, 59, 59, 999);
              
              const currentWeekendMatches = allMatches.filter(match => {
                const matchDate = new Date(match.date);
                return matchDate <= todayEnd;
              });
              
              const nextWeekendMatches = allMatches.filter(match => {
                const matchDate = new Date(match.date);
                return matchDate > todayEnd;
              });
              
              setAllWeekendMatches(currentWeekendMatches);
              setUpcomingWeekendMatches(nextWeekendMatches);
              
              localStorage.setItem('africancup_weekend_matches', JSON.stringify(currentWeekendMatches));
              localStorage.setItem('africancup_upcoming_matches', JSON.stringify(nextWeekendMatches));
              localStorage.setItem('africancup_last_update', now.toISOString());
              console.log('✅ CAN - Matchs sauvegardés dans le cache');
            }
          } catch (error) {
            console.log('Erreur récupération matchs CAN:', error);
          }
        }

        // Récupérer le classement depuis l'API
        try {
          const standingsUrl = `https://site.api.espn.com/apis/v2/sports/soccer/${africanCupConfig.apiCode}/standings`;
          const standingsResponse = await fetch(standingsUrl);
          const standingsData = await standingsResponse.json();
          
          if (standingsData.children) {
            // Organiser par groupes
            const groupedStandings = standingsData.children.map(group => ({
              name: group.name,
              standings: group.standings.entries.map((entry, idx) => ({
                team: entry.team.displayName,
                played: entry.stats.find(s => s.name === 'gamesPlayed')?.value || 0,
                won: entry.stats.find(s => s.name === 'wins')?.value || 0,
                drawn: entry.stats.find(s => s.name === 'ties')?.value || 0,
                lost: entry.stats.find(s => s.name === 'losses')?.value || 0,
                goalsFor: entry.stats.find(s => s.name === 'pointsFor')?.value || 0,
                goalsAgainst: entry.stats.find(s => s.name === 'pointsAgainst')?.value || 0,
                goalDiff: entry.stats.find(s => s.name === 'pointDifferential')?.value || 0,
                points: entry.stats.find(s => s.name === 'points')?.value || 0,
                qualified: idx < 2 // Top 2 de chaque groupe
              }))
            }));
            
            setStandings(groupedStandings);
            localStorage.setItem('africancup_standings', JSON.stringify(groupedStandings));
            console.log('✅ CAN - Classement récupéré et sauvegardé');
          }
        } catch (error) {
          console.log('Erreur récupération classement CAN:', error);
          // En cas d'erreur, utiliser les données JSON locales comme fallback
          if (africanCupData.currentCAN.standings) {
            const fallbackStandings = africanCupData.currentCAN.standings.map(group => ({
              name: group.group,
              standings: group.teams.map((team, idx) => ({
                team: team.team,
                played: team.played,
                won: team.won,
                drawn: team.drawn,
                lost: team.lost,
                goalsFor: team.goalsFor,
                goalsAgainst: team.goalsAgainst,
                goalDiff: team.goalDiff,
                points: team.points,
                qualified: idx < 2
              }))
            }));
            setStandings(fallbackStandings);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erreur chargement données CAN:', error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Vue Historique & Éditions
  if (view === 'editions') {
    return <AfricNationCupWrapper view="editions" />;
  }

  // Vue Phase éliminatoire
  if (view === 'eliminatoire') {
    return <AfricNationCupWrapper view="eliminatoire" />;
  }

  // Vue Matchs à venir avec données API ou JSON en fallback
  if (view === 'avenir') {
    const now = new Date();
    
    // Afficher tous les matchs futurs (pas seulement J+1)
    let matchesToShow = upcomingWeekendMatches.length > 0 
      ? upcomingWeekendMatches 
      : africanCupData.currentCAN.nextMatches || [];
    
    // Filtrer pour ne garder que les matchs futurs
    matchesToShow = matchesToShow.filter(match => {
      const matchDate = new Date(match.date);
      return matchDate > now;
    });
    
    return <AfricNationCupWrapper view="avenir" upcomingMatches={matchesToShow} />;
  }

  // Pour le classement, on utilise les données de l'API organisées par groupes
  if (view === 'classement') {
    return (
      <div className="can-standings-wrapper">
        <div className="league-header">
          <h2>🦁 CAN 2025</h2>
          <p>Coupe d'Afrique des Nations - Maroc</p>
        </div>
        
        {loading ? (
          <div className="loading-message">
            <p>Chargement du classement...</p>
          </div>
        ) : standings && standings.length > 0 ? (
          <div className="groups-grid">
            {standings.map((groupData, idx) => (
              <GroupStageTable 
                key={idx} 
                group={{
                  name: groupData.name,
                  standings: groupData.standings
                }} 
              />
            ))}
          </div>
        ) : (
          <div className="no-data">
            <p>Classement non disponible</p>
          </div>
        )}

        <div className="standings-legend">
          <div className="legend-item">
            <span className="legend-badge qualified-direct"></span>
            <span>Top 2 : Qualifiés pour les 1/8 de finale</span>
          </div>
          <div className="legend-item">
            <span className="legend-badge best-third"></span>
            <span>4 meilleurs 3èmes : Qualifiés pour les 1/8 de finale</span>
          </div>
        </div>
      </div>
    );
  }

  // Pour les matchs, on utilise FootballLeague avec les données de l'API
  return (
    <FootballLeague
      leagueData={data}
      weekendMatches={allWeekendMatches}
      upcomingMatches={upcomingWeekendMatches}
      standingsData={[]}
      leagueConfig={africanCupConfig}
      view={view}
    />
  );
};

export default AfricNationCup;
