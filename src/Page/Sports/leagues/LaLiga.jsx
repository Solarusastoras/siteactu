import React from 'react';
import FootballLeagueContainer from '../../../Common/components/FootballLeagueContainer';
import { laLigaConfig } from '../../../Common/data/footballLeaguesConfig';
import { leaguesConfig } from '../../../Common/data/leaguesConfig';
import { currentLaLigaStandings } from '../../../Common/data/standingsData';

const LaLiga = ({ view = 'matches' }) => {
  return (
    <FootballLeagueContainer 
      leagueConfig={{
        ...laLigaConfig,
        ...leaguesConfig.laliga
      }}
      standingsData={currentLaLigaStandings}
      view={view}
    />
  );
};

export default LaLiga;
