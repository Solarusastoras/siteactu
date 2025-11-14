import React from 'react';
import FootballLeagueContainer from '../../../Common/components/FootballLeagueContainer';
import { ligue2Config } from '../../../Common/data/footballLeaguesConfig';
import { leaguesConfig } from '../../../Common/data/leaguesConfig';
import { currentLigue2Standings } from '../../../Common/data/standingsData';

const Ligue2 = ({ view = 'matches' }) => {
  return (
    <FootballLeagueContainer 
      leagueConfig={{
        ...ligue2Config,
        ...leaguesConfig.ligue2
      }}
      standingsData={currentLigue2Standings}
      view={view}
    />
  );
};

export default Ligue2;
