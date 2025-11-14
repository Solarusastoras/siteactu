import React from 'react';
import FootballLeagueContainer from '../../../Common/components/FootballLeagueContainer';
import { bundesligaConfig } from '../../../Common/data/footballLeaguesConfig';
import { leaguesConfig } from '../../../Common/data/leaguesConfig';
import { currentBundesligaStandings } from '../../../Common/data/standingsData';

const Bundesliga = ({ view = 'matches' }) => {
  return (
    <FootballLeagueContainer 
      leagueConfig={{
        ...bundesligaConfig,
        ...leaguesConfig.bundesliga
      }}
      standingsData={currentBundesligaStandings}
      view={view}
    />
  );
};

export default Bundesliga;
