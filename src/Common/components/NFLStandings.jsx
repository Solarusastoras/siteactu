import React from 'react';

/**
 * Composant pour afficher le classement NFL
 * Support des formats: SofaScore (conferences avec name/standings) et ESPN (conferences)
 */
const NFLStandings = ({ standingsData }) => {
  
  if (!standingsData || !Array.isArray(standingsData) || standingsData.length === 0) {
    return (
      <div className="standings-container">
        <p className="no-data">Classements NFL non disponibles pour le moment</p>
      </div>
    );
  }

  // Détection du format de données SofaScore avec conférences structurées
  const hasSofaScoreConferences = standingsData[0]?.name && standingsData[0]?.standings;
  
  // Format SofaScore avec conférences (format préféré)
  if (hasSofaScoreConferences) {
    return (
      <div className="standings-container nfl-standings">
        {standingsData.map((conference, idx) => {
          const icon = conference.name.includes('NFC') ? '🏆' : '⭐';
          
          return (
            <div key={idx} className="nfl-conference">
              <h2 className="conference-title">{icon} {conference.name}</h2>
              <div className="standings-table nfl-table">
                <div className="standings-header">
                  <div className="position-col">#</div>
                  <div className="team-col">Équipe</div>
                  <div>J</div>
                  <div>V</div>
                  <div>D</div>
                  <div>N</div>
                  <div>%</div>
                </div>
                {conference.standings.map((entry) => {
                  const isPlayoffSpot = entry.position <= 7; // Top 7 par conférence
                  const winPct = entry.played > 0 ? (entry.wins / entry.played) : 0;
                  
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
                      <div className="stat-pct">{winPct.toFixed(3)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        
        <div className="standings-legend nfl-legend">
          <div className="legend-item playoff-spot">🏆 Qualifié pour les playoffs (Top 7 par conférence)</div>
          <div className="legend-abbreviations">
            <p><strong>Abréviations:</strong></p>
            <p>J = Matchs joués | V = Victoires | D = Défaites | N = Nuls | % = Pourcentage de victoires</p>
          </div>
        </div>
      </div>
    );
  }

  // Détection du format de données SofaScore flat (ancien format)
  const isSofaScoreFormat = standingsData?.length > 0 && 
    standingsData[0].position !== undefined && 
    typeof standingsData[0].position === 'number';

  // Format SofaScore (flat array)
  if (isSofaScoreFormat) {
    return (
      <div className="standings-container nfl-standings">
        <h2 className="conference-title">🏈 NFL</h2>
        <div className="standings-table nfl-table">
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
            const isPlayoffSpot = entry.position <= 14; // Top 14 (7 par conférence)
            
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
        
        <div className="standings-legend nfl-legend">
          <div className="legend-item playoff-spot">🏆 Qualifié pour les playoffs (Top 7 par conférence)</div>
          <div className="legend-abbreviations">
            <p><strong>Abréviations:</strong></p>
            <p>J = Matchs joués | V = Victoires | D = Défaites | N = Nuls | PTS = Points | +/- = Différence de buts</p>
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

    const sortedTeams = conference.standings;

    return (
      <div className="nfl-conference" key={conference.abbreviation}>
        <h2 className="conference-title">
          🏈 {conference.name}
        </h2>
        <div className="standings-table nfl-table">
          <div className="standings-header">
            <div className="position-col">#</div>
            <div className="team-col">Équipe</div>
            <div>J</div>
            <div>%</div>
            <div>V</div>
            <div>D</div>
            <div>N</div>
            <div>+/-</div>
          </div>
          {sortedTeams.map((entry, index) => {
            const position = index + 1;
            const isPlayoffSpot = position <= 7;
            const gamesPlayed = entry.gamesPlayed || (entry.wins + entry.losses + (entry.ties || 0));
            const netPoints = entry.diff || 0;
            
            return (
              <div 
                key={entry.abbr} 
                className={`standings-row ${isPlayoffSpot ? 'playoff-spot' : ''}`}
              >
                <div className="position-col">{position}</div>
                <div className="team-info team-col">
                  {entry.logo && <img src={entry.logo} alt={entry.team} className="team-logo-small" />}
                  <span className="team-name">{entry.team}</span>
                </div>
                <div className="stat-gp">{gamesPlayed}</div>
                <div className="stat-pct">{entry.pct.toFixed(3)}</div>
                <div className="stat-wins">{entry.wins}</div>
                <div className="stat-losses">{entry.losses}</div>
                <div className="stat-ties">{entry.ties || 0}</div>
                <div className={`stat-diff ${netPoints > 0 ? 'positive' : netPoints < 0 ? 'negative' : ''}`}>
                  {netPoints > 0 ? '+' : ''}{netPoints}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!standingsData || !Array.isArray(standingsData) || standingsData.length === 0) {
    return (
      <div className="standings-container">
        <div className="error-message">
          <h2>📊 Classement NFL</h2>
          <p>Les classements ne sont pas disponibles actuellement.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="standings-container nfl-standings">
      {standingsData.map(conference => renderConference(conference))}
      
      <div className="standings-legend nfl-legend">
        <div className="legend-item playoff-spot">🏆 Qualifié pour les playoffs (Top 7 par conférence)</div>
        <div className="legend-note">
          <strong>Note:</strong> En NFL, les 4 gagnants de division + 3 équipes wild card par conférence se qualifient pour les playoffs
        </div>
        <div className="legend-abbreviations">
          <p><strong>Abréviations:</strong></p>
          <p>J = Matchs joués | % = Pourcentage de victoires | V = Victoires | D = Défaites | N = Nuls | +/- = Différence de points</p>
        </div>
      </div>
    </div>
  );
};

export default NFLStandings;
