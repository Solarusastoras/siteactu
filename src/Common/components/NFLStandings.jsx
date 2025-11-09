import React from 'react';

/**
 * Composant pour afficher le classement NFL
 * Organisé par conférences (AFC/NFC) et divisions
 */
const NFLStandings = ({ standingsData }) => {
  
  const renderDivision = (divisionName, teams, conference) => {
    // Trier par pourcentage de victoires, puis par différence de points
    const sortedTeams = [...teams].sort((a, b) => {
      if (b.pct !== a.pct) return b.pct - a.pct;
      return (b.pf - b.pa) - (a.pf - a.pa);
    });

    return (
      <div className="nfl-division" key={`${conference}-${divisionName}`}>
        <h3 className="division-title">
          {conference === 'afc' ? 'AFC' : 'NFC'} {divisionName.toUpperCase()}
        </h3>
        <div className="standings-table nfl-table">
          <div className="standings-header">
            <div className="team-col">Équipe</div>
            <div>V</div>
            <div>D</div>
            <div>N</div>
            <div>%</div>
            <div>PF</div>
            <div>PA</div>
            <div>Diff</div>
          </div>
          {sortedTeams.map((team, index) => {
            const position = index + 1;
            const isPlayoffSpot = position === 1; // Gagnant de division
            const netPoints = team.pf - team.pa;
            
            return (
              <div 
                key={team.team} 
                className={`standings-row ${isPlayoffSpot ? 'division-winner' : ''}`}
              >
                <div className="team-info team-col">
                  <span className="position-indicator">{position}</span>
                  <span className="team-name">{team.team}</span>
                </div>
                <div className="stat-wins">{team.wins}</div>
                <div className="stat-losses">{team.losses}</div>
                <div className="stat-ties">{team.ties}</div>
                <div className="stat-pct">{team.pct.toFixed(3)}</div>
                <div className="stat-pf">{team.pf}</div>
                <div className="stat-pa">{team.pa}</div>
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

  const renderConference = (conferenceName, conferenceData) => {
    return (
      <div className="nfl-conference" key={conferenceName}>
        <h2 className="conference-title">
          {conferenceName === 'afc' ? '🏈 AMERICAN FOOTBALL CONFERENCE' : '🏈 NATIONAL FOOTBALL CONFERENCE'}
        </h2>
        <div className="divisions-grid">
          {renderDivision('east', conferenceData.east, conferenceName)}
          {renderDivision('north', conferenceData.north, conferenceName)}
          {renderDivision('south', conferenceData.south, conferenceName)}
          {renderDivision('west', conferenceData.west, conferenceName)}
        </div>
      </div>
    );
  };

  if (!standingsData) {
    return (
      <div className="standings-container">
        <p>Chargement des classements NFL...</p>
      </div>
    );
  }

  return (
    <div className="standings-container nfl-standings">
      {renderConference('afc', standingsData.afc)}
      {renderConference('nfc', standingsData.nfc)}
      
      <div className="standings-legend nfl-legend">
        <div className="legend-item division-winner">🏆 Gagnant de division - Qualifié pour les playoffs</div>
        <div className="legend-note">
          <strong>Note:</strong> En NFL, les 4 gagnants de division + 3 équipes wild card par conférence se qualifient pour les playoffs
        </div>
        <div className="legend-abbreviations">
          <p><strong>Abréviations:</strong></p>
          <p>V = Victoires | D = Défaites | N = Nuls | % = Pourcentage de victoires</p>
          <p>PF = Points marqués | PA = Points encaissés | Diff = Différence de points</p>
        </div>
      </div>
    </div>
  );
};

export default NFLStandings;
