import React from 'react';

/**
 * Composant pour afficher le classement NHL
 * Support des formats: SofaScore (conferences avec name/standings) et ESPN (conferences)
 */
const NHLStandings = ({ standingsData }) => {
  
  if (!standingsData || !Array.isArray(standingsData) || standingsData.length === 0) {
    return (
      <div className="standings-container">
        <p className="no-data">Classements NHL non disponibles pour le moment</p>
      </div>
    );
  }

  // Détection du format de données SofaScore avec conférences structurées
  const hasSofaScoreConferences = standingsData[0]?.name && standingsData[0]?.standings;
  
  // Format SofaScore avec conférences (format préféré)
  if (hasSofaScoreConferences) {
    return (
      <div className="standings-container nhl-standings">
        {standingsData.map((conference, idx) => {
          const icon = conference.name.includes('Western') || conference.name.includes('Ouest') ? '🌅' : '🌄';
          
          return (
            <div key={idx} className="nhl-conference">
              <h2 className="conference-title">{icon} {conference.name}</h2>
              <div className="standings-table nhl-table">
                <div className="standings-header">
                  <div className="position-col">#</div>
                  <div className="team-col">Équipe</div>
                  <div>J</div>
                  <div>V</div>
                  <div>D</div>
                  <div>N</div>
                  <div>PTS</div>
                  <div>+/-</div>
                </div>
                {conference.standings.map((entry) => {
                  const isPlayoffSpot = entry.position <= 8; // Top 8 par conférence
                  
                  return (
                    <div 
                      key={entry.teamId} 
                      className={`standings-row ${isPlayoffSpot ? 'playoff-spot' : ''}`}
                    >
                      <div className="position-col">{entry.position}</div>
                      <div className="team-info team-col">
                        {entry.logo && <img src={entry.logo} alt={entry.team} className="team-logo-small" />}
                        <span className="team-name">{entry.team}</span>
                      </div>
                      <div className="stat-gp">{entry.played}</div>
                      <div className="stat-wins">{entry.wins}</div>
                      <div className="stat-losses">{entry.losses}</div>
                      <div className="stat-ties">{entry.draws || 0}</div>
                      <div className="stat-pts">{entry.points}</div>
                      <div className={`stat-diff ${entry.goalDifference > 0 ? 'positive' : entry.goalDifference < 0 ? 'negative' : ''}`}>
                        {entry.goalDifference > 0 ? '+' : ''}{entry.goalDifference}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        
        <div className="standings-legend nhl-legend">
          <div className="legend-item playoff-spot">🏆 Qualifié pour les playoffs (Top 8 par conférence)</div>
          <div className="legend-abbreviations">
            <p><strong>Abréviations:</strong></p>
            <p>J = Matchs joués | V = Victoires | D = Défaites | N = Nuls | PTS = Points | +/- = Différentiel de buts</p>
          </div>
        </div>
      </div>
    );
  }

  // Détection du format de données SofaScore flat (ancien format)
  const isSofaScoreFormat = standingsData[0]?.position !== undefined && 
    typeof standingsData[0].position === 'number';

  // Format SofaScore (flat array)
  if (isSofaScoreFormat) {
    return (
      <div className="standings-container nhl-standings">
        <h2 className="conference-title">🏒 NHL</h2>
        <div className="standings-table nhl-table">
          <div className="standings-header">
            <div className="position-col">#</div>
            <div className="team-col">Équipe</div>
            <div>J</div>
            <div>V</div>
            <div>D</div>
            <div>N</div>
            <div>PTS</div>
            <div>+/-</div>
          </div>
          {standingsData.map((entry) => {
            const isPlayoffSpot = entry.position <= 16; // Top 16
            
            return (
              <div 
                key={entry.teamId} 
                className={`standings-row ${isPlayoffSpot ? 'playoff-spot' : ''}`}
              >
                <div className="position-col">{entry.position}</div>
                <div className="team-info team-col">
                  {entry.logo && <img src={entry.logo} alt={entry.team} className="team-logo-small" />}
                  <span className="team-name">{entry.team}</span>
                </div>
                <div className="stat-gp">{entry.played}</div>
                <div className="stat-wins">{entry.wins}</div>
                <div className="stat-losses">{entry.losses}</div>
                <div className="stat-ties">{entry.draws || 0}</div>
                <div className="stat-pts">{entry.points}</div>
                <div className={`stat-diff ${entry.goalDifference > 0 ? 'positive' : entry.goalDifference < 0 ? 'negative' : ''}`}>
                  {entry.goalDifference > 0 ? '+' : ''}{entry.goalDifference}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="standings-legend nhl-legend">
          <div className="legend-item playoff-spot">🏆 Qualifié pour les playoffs (Top 8 par conférence)</div>
          <div className="legend-abbreviations">
            <p><strong>Abréviations:</strong></p>
            <p>J = Matchs joués | V = Victoires | D = Défaites | N = Nuls | PTS = Points | +/- = Différentiel de buts</p>
          </div>
        </div>
      </div>
    );
  }

  // Format ESPN (conferences)
  const renderConference = (conference) => {
    if (!conference || !conference.standings || conference.standings.length === 0) {
      return null;
    }

    const sortedTeams = [...conference.standings].sort((a, b) => {
      if (a.stats?.playoffSeed && b.stats?.playoffSeed) {
        return a.stats.playoffSeed - b.stats.playoffSeed;
      }
      return (b.stats?.points || 0) - (a.stats?.points || 0);
    });

    return (
      <div className="nhl-conference" key={conference.abbreviation}>
        <h2 className="conference-title">
          🏒 {conference.name}
        </h2>
        <div className="standings-table nhl-table">
          <div className="standings-header">
            <div className="position-col">#</div>
            <div className="team-col">Équipe</div>
            <div>J</div>
            <div>PTS</div>
            <div>V</div>
            <div>D</div>
            <div>OTL</div>
            <div>+/-</div>
          </div>
          {sortedTeams.map((entry, index) => {
            const team = entry.team || {};
            const stats = entry.stats || {};
            const position = stats.playoffSeed || (index + 1);
            const isPlayoffSpot = position <= 8;
            
            return (
              <div 
                key={team.id || entry.abbr || index} 
                className={`standings-row ${isPlayoffSpot ? 'playoff-spot' : ''}`}
              >
                <div className="position-col">{position}</div>
                <div className="team-info team-col">
                  {team.logo && <img src={team.logo} alt={team.shortName || team.name} className="team-logo-small" />}
                  <span className="team-name">{team.shortName || team.name || entry.team}</span>
                </div>
                <div className="stat-gp">{stats.gamesPlayed || stats.GP || 0}</div>
                <div className="stat-pts">{stats.points || stats.PTS || 0}</div>
                <div className="stat-wins">{stats.wins || stats.W || 0}</div>
                <div className="stat-losses">{stats.losses || stats.L || 0}</div>
                <div className="stat-otl">{stats.otLosses || stats.OTL || 0}</div>
                <div className={`stat-diff ${(stats.goalDifferential || 0) > 0 ? 'positive' : (stats.goalDifferential || 0) < 0 ? 'negative' : ''}`}>
                  {(stats.goalDifferential || 0) > 0 ? '+' : ''}{stats.goalDifferential || 0}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="standings-container nhl-standings">
      {standingsData.map(conference => renderConference(conference))}
      
      <div className="standings-legend nhl-legend">
        <div className="legend-item playoff-spot">🏆 Qualifié pour les playoffs (Top 8 par conférence)</div>
        <div className="legend-note">
          <strong>Note:</strong> En NHL, les 3 premiers de chaque division + 2 wild cards par conférence se qualifient pour les playoffs
        </div>
        <div className="legend-abbreviations">
          <p><strong>Abréviations:</strong></p>
          <p>J = Matchs joués | PTS = Points (2 pts victoire, 1 pt défaite OT/SO) | V = Victoires | D = Défaites | OTL = Défaites en prolongation/fusillade | +/- = Différentiel de buts</p>
        </div>
      </div>
    </div>
  );
};

export default NHLStandings;
