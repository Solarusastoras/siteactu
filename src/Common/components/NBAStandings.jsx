import React from 'react';

/**
 * Composant pour afficher le classement NBA
 * Support des formats: SofaScore (conferences avec name/standings) et ESPN (conferences)
 */
const NBAStandings = ({ standingsData }) => {
  if (!standingsData || !Array.isArray(standingsData) || standingsData.length === 0) {
    return (
      <div className="standings-container">
        <p className="no-data">Classements NBA non disponibles pour le moment</p>
      </div>
    );
  }

  // Détection du format de données SofaScore avec conférences structurées
  const hasSofaScoreConferences = standingsData[0]?.name && standingsData[0]?.standings;
  
  // Format SofaScore avec conférences (format préféré)
  if (hasSofaScoreConferences) {
    return (
      <div className="standings-container nba-standings">
        {standingsData.map((conference, idx) => {
          const icon = conference.name.includes('Western') || conference.name.includes('Ouest') ? '🌅' : '🌄';
          
          return (
            <div key={idx} className="nba-conference">
              <h2 className="conference-title">{icon} {conference.name}</h2>
              <div className="standings-table nba-table">
                <div className="standings-header">
                  <div className="position-col">#</div>
                  <div className="team-col">Équipe</div>
                  <div>J</div>
                  <div>V</div>
                  <div>D</div>
                  <div>%</div>
                </div>
                {conference.standings.map((entry) => {
                  const isPlayoffSpot = entry.position <= 8; // Top 8 par conférence
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
                      <div className="stat-pct">{winPct.toFixed(3)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        
        <div className="standings-legend nba-legend">
          <div className="legend-item playoff-spot">🏆 Qualifié pour les playoffs (Top 8 par conférence)</div>
          <div className="legend-abbreviations">
            <p><strong>Abréviations:</strong></p>
            <p>J = Matchs joués | V = Victoires | D = Défaites | % = Pourcentage de victoires</p>
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
      <div className="standings-container nba-standings">
        <h2 className="conference-title">🏀 NBA</h2>
        <div className="standings-table nba-table">
          <div className="standings-header">
            <div className="position-col">#</div>
            <div className="team-col">Équipe</div>
            <div>J</div>
            <div>V</div>
            <div>D</div>
            <div>%</div>
            <div>+/-</div>
          </div>
          {standingsData.map((entry) => {
            const isPlayoffSpot = entry.position <= 16; // Top 16
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
                <div className="stat-pct">{winPct.toFixed(3)}</div>
                <div className={`stat-diff ${entry.goalDifference > 0 ? 'positive' : entry.goalDifference < 0 ? 'negative' : ''}`}>
                  {entry.goalDifference > 0 ? '+' : ''}{entry.goalDifference}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="standings-legend nba-legend">
          <div className="legend-item playoff-spot">🏆 Qualifié pour les playoffs (Top 8 par conférence)</div>
          <div className="legend-abbreviations">
            <p><strong>Abréviations:</strong></p>
            <p>J = Matchs joués | V = Victoires | D = Défaites | % = Pourcentage de victoires | +/- = Différence de points</p>
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
      <div className="nba-conference" key={conference.name}>
        <h2 className="conference-title">
          🏀 {conference.name}
        </h2>
        <div className="standings-table nba-table">
          <div className="standings-header">
            <div className="position-col">#</div>
            <div className="team-col">Équipe</div>
            <div>J</div>
            <div>%</div>
            <div>V</div>
            <div>D</div>
          </div>
          {sortedTeams.map((entry, index) => {
            const position = index + 1;
            const isPlayoffSpot = position <= 8;
            const gamesPlayed = (entry.wins || 0) + (entry.losses || 0);
            
            return (
              <div 
                key={entry.abbr || entry.team?.abbreviation || index} 
                className={`standings-row ${isPlayoffSpot ? 'playoff-spot' : ''}`}
              >
                <div className="position-col">{position}</div>
                <div className="team-info team-col">
                  {entry.logo && <img src={entry.logo} alt={entry.team || entry.fullName} className="team-logo-small" />}
                  <span className="team-name">{entry.team || entry.fullName}</span>
                </div>
                <div className="stat-gp">{gamesPlayed}</div>
                <div className="stat-pct">{(entry.pct || 0).toFixed(3)}</div>
                <div className="stat-wins">{entry.wins || 0}</div>
                <div className="stat-losses">{entry.losses || 0}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="standings-container nba-standings">
      {standingsData.map(conference => renderConference(conference))}
      
      <div className="standings-legend nba-legend">
        <div className="legend-item playoff-spot">🏆 Qualifié pour les playoffs (Top 8 par conférence)</div>
        <div className="legend-note">
          <strong>Note:</strong> En NBA, les 6 premiers de chaque conférence + 2 équipes play-in se qualifient pour les playoffs
        </div>
        <div className="legend-abbreviations">
          <p><strong>Abréviations:</strong></p>
          <p>J = Matchs joués | % = Pourcentage de victoires | V = Victoires | D = Défaites</p>
        </div>
      </div>
    </div>
  );
};

export default NBAStandings;