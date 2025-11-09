import React, { useState, useEffect } from 'react';
import FootballLeague from '../../../Common/components/FootballLeague';
import { leaguesConfig } from '../../../Common/data/leaguesConfig';
import { currentLigue2Standings } from '../../../Common/data/standingsData';

const Ligue2 = ({ view = 'matches' }) => {
  const [data, setData] = useState(null);
  const [standings, setStandings] = useState(currentLigue2Standings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const matchesResponse = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fra.2/scoreboard');
        const matchesData = await matchesResponse.json();
        setData(matchesData);
        
        try {
          const standingsResponse = await fetch('https://site.api.espn.com/apis/v2/sports/soccer/fra.2/standings');
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
        console.error('Erreur lors du chargement Ligue 2:', error);
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
      standingsData={standings}
      leagueConfig={leaguesConfig.ligue2}
      view={view}
    />
  );
};

export default Ligue2;
