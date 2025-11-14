import React from 'react';
import FootballLeagueContainer from '../../../Common/components/FootballLeagueContainer';
import { serieAConfig } from '../../../Common/data/footballLeaguesConfig';
import { leaguesConfig } from '../../../Common/data/leaguesConfig';
import { currentSerieAStandings } from '../../../Common/data/standingsData';

const SerieA = ({ view = 'matches' }) => {
  return (
    <FootballLeagueContainer 
      leagueConfig={{
        ...serieAConfig,
        ...leaguesConfig.seriea
      }}
      standingsData={currentSerieAStandings}
      view={view}
    />
  );
};

export default SerieA;
