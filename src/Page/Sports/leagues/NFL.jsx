import React from 'react';
import AmericanSportLeague from '../../../Common/components/AmericanSportLeague';
import { nflConfig } from '../../../Common/data/americanSportsConfig';
import NFLStandings from '../../../Common/components/NFLStandings';
import { currentNFLStandings } from '../../../Common/data/nflStandingsData';

const NFL = ({ view = 'matches' }) => {
  return (
    <AmericanSportLeague 
      sportConfig={{
        ...nflConfig,
        defaultStandings: currentNFLStandings
      }}
      StandingsComponent={NFLStandings}
      view={view}
    />
  );
};

export default NFL;
