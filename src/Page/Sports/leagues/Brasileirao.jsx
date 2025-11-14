import React from 'react';
import FootballLeagueContainer from '../../../Common/components/FootballLeagueContainer';
import { brasileiraoConfig } from '../../../Common/data/footballLeaguesConfig';
import { leaguesConfig } from '../../../Common/data/leaguesConfig';
import { currentBrasileiraoStandings } from '../../../Common/data/standingsData';

const Brasileirao = ({ view = 'matches' }) => {
  return (
    <FootballLeagueContainer 
      leagueConfig={{
        ...brasileiraoConfig,
        ...leaguesConfig.brasileirao
      }}
      standingsData={currentBrasileiraoStandings}
      view={view}
    />
  );
};

export default Brasileirao;
