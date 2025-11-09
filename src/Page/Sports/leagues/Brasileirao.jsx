import React, { useState, useEffect } from 'react';
import FootballLeague from '../../../Common/components/FootballLeague';
import { leaguesConfig } from '../../../Common/data/leaguesConfig';
import { currentBrasileiraoStandings } from '../../../Common/data/standingsData';

const Brasileirao = ({ view = 'matches' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/scoreboard');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Erreur lors du chargement Brasileirão:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="loading"><h2>Chargement...</h2></div>;

  return (
    <FootballLeague 
      leagueData={data}
      standingsData={currentBrasileiraoStandings}
      leagueConfig={leaguesConfig.brasileirao}
      view={view}
    />
  );
};

export default Brasileirao;
