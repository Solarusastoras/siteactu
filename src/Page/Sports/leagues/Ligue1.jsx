import React from 'react';
import FootballLeagueContainer from '../../../Common/components/FootballLeagueContainer';
import { ligue1Config } from '../../../Common/data/footballLeaguesConfig';
import { leaguesConfig } from '../../../Common/data/leaguesConfig';
import { currentLigue1Standings } from '../../../Common/data/standingsData';

const Ligue1 = ({ view = 'matches' }) => {
  return (
    <FootballLeagueContainer 
      leagueConfig={{
        ...ligue1Config,
        ...leaguesConfig.ligue1  // Fusionner avec la config d'affichage
      }}
      standingsData={currentLigue1Standings}
      view={view}
    />
  );
};

export default Ligue1;
