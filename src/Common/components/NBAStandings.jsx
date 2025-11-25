import React from 'react';

/**
 * Composant pour afficher le classement NBA
 */
const NBAStandings = ({ standingsData }) => {
  if (!standingsData || !Array.isArray(standingsData) || standingsData.length === 0) {
    return (
      <div className="standings-container">
        <p className="no-data">Classements NBA non disponibles pour le moment</p>
      </div>
    );
  }

  const renderConference = (conference) => {
    if (!conference || !conference.standings || conference.standings.length === 0) {
      return null;
    }

    // Les équipes sont déjà triées par pourcentage
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