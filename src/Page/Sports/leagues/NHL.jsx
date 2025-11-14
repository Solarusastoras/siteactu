import React from 'react';
import AmericanSportLeague from '../../../Common/components/AmericanSportLeague';
import { nhlConfig } from '../../../Common/data/americanSportsConfig';
import NHLStandings from '../../../Common/components/NHLStandings';
import { currentNHLStandings } from '../../../Common/data/nhlStandingsData';

const NHL = ({ view = 'matches' }) => {
  return (
    <AmericanSportLeague 
      sportConfig={{
        ...nhlConfig,
        defaultStandings: currentNHLStandings
      }}
      StandingsComponent={NHLStandings}
      view={view}
    />
  );
};

export default NHL;
