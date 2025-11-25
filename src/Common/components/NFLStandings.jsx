import React from 'react';

/**
 * Composant pour afficher le classement NFL
 * Utilise les données réelles de l'API ESPN
 */
const NFLStandings = ({ standingsData }) => {
  
  const renderConference = (conference) => {
    if (!conference || !conference.standings || conference.standings.length === 0) {
      return null;
    }

    // Les équipes sont déjà triées par pourcentage dans les données
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
            const isPlayoffSpot = position <= 7; // Top 7 se qualifient
            const teamName = entry.team;
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
