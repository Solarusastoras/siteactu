import React from 'react';
import FootballLeagueContainer from '../../../Common/components/FootballLeagueContainer';
import { premierLeagueConfig } from '../../../Common/data/footballLeaguesConfig';
import { leaguesConfig } from '../../../Common/data/leaguesConfig';
import { currentPremierLeagueStandings } from '../../../Common/data/standingsData';

const PremierLeague = ({ view = 'matches' }) => {
  return (
    <FootballLeagueContainer 
      leagueConfig={{
        ...premierLeagueConfig,
        ...leaguesConfig.premier
      }}
      standingsData={currentPremierLeagueStandings}
      view={view}
    />
  );
};

export default PremierLeague;
