import React from 'react';

/**
 * Composant pour afficher le classement NHL
 * Organisé par conférences (Eastern/Western) et divisions
 */
const NHLStandings = ({ standingsData }) => {
  
  const renderDivision = (divisionName, teams, conference) => {
    // Trier par points, puis par ROW (Regulation + OT Wins)
    const sortedTeams = [...teams].sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.row !== a.row) return b.row - a.row;
      return b.gf - a.gf;
    });

    const divisionTitles = {
      atlantic: 'Atlantic',
      metropolitan: 'Metropolitan',
      central: 'Central',
      pacific: 'Pacific'
    };

    return (
      <div className="nhl-division" key={`${conference}-${divisionName}`}>
        <h3 className="division-title">
          {divisionTitles[divisionName]}
        </h3>
        <div className="standings-table nhl-table">
          <div className="standings-header">
            <div className="team-col">Équipe</div>
            <div>GP</div>
            <div>V</div>
            <div>D</div>
            <div>OTL</div>
            <div>PTS</div>
          </div>
          {sortedTeams.map((team, index) => {
            const position = index + 1;
            const isPlayoffSpot = position <= 3;
            
            return (
              <div 
                key={team.abbr} 
                className={`standings-row ${isPlayoffSpot ? 'playoff-spot' : ''}`}
              >
                <div className="team-info team-col">
                  <span className="position-indicator">{position}</span>
                  <div className="team-details">
                    <span className="team-abbr">{team.abbr}</span>
                    <span className="team-name-full">{team.team}</span>
                  </div>
                </div>
                <div className="stat-gp">{team.gp}</div>
                <div className="stat-wins">{team.wins}</div>
                <div className="stat-losses">{team.losses}</div>
                <div className="stat-otl">{team.otl}</div>
                <div className="stat-pts">{team.pts}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderConference = (conferenceName, conferenceData) => {
    return (
      <div className="nhl-conference" key={conferenceName}>
        <h2 className="conference-title">
          {conferenceName === 'eastern' ? '🏒 EASTERN CONFERENCE' : '🏒 WESTERN CONFERENCE'}
        </h2>
        <div className="divisions-grid">
          {conferenceName === 'eastern' ? (
            <>
              {renderDivision('atlantic', conferenceData.atlantic, conferenceName)}
              {renderDivision('metropolitan', conferenceData.metropolitan, conferenceName)}
            </>
          ) : (
            <>
              {renderDivision('central', conferenceData.central, conferenceName)}
              {renderDivision('pacific', conferenceData.pacific, conferenceName)}
            </>
          )}
        </div>
      </div>
    );
  };

  if (!standingsData) {
    return (
      <div className="standings-container">
        <p>Chargement des classements NHL...</p>
      </div>
    );
  }

  return (
    <div className="standings-container nhl-standings">
      {renderConference('eastern', standingsData.eastern)}
      {renderConference('western', standingsData.western)}
      
      <div className="standings-legend nhl-legend">
        <div className="legend-item playoff-spot">🏆 Positions qualificatives pour les playoffs</div>
        <div className="legend-note">
          <strong>Note:</strong> En NHL, les 3 premiers de chaque division se qualifient pour les playoffs
        </div>
        <div className="legend-abbreviations">
          <p><strong>Abréviations:</strong></p>
          <p>GP = Matchs joués | V = Victoires | D = Défaites | OTL = Défaites en prolongation/fusillade</p>
          <p>PTS = Points (2 pts victoire, 1 pt défaite OT/SO)</p>
        </div>
      </div>
    </div>
  );
};

export default NHLStandings;
