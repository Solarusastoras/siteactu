import React from 'react';
import '../leagues/foot.scss';

/**
 * Composant de classement pour les ligues de football
 * Réutilise les styles existants de foot.scss
 * Support des conférences pour NBA/NFL/NHL
 */
const FootballStandings = ({ standings, leagueName, config }) => {
  if (!standings || standings.length === 0) {
    return (
      <div className="no-standings">
        <p>Classement non disponible</p>
      </div>
    );
  }

  const getPositionClass = (position) => {
    if (!config?.positionRules) return '';
    
    for (const rule of config.positionRules) {
      if (rule.range && position >= rule.range[0] && position <= rule.range[1]) {
        return rule.class;
      }
      if (rule.positions && rule.positions.includes(position)) {
        return rule.class;
      }
    }
    return '';
  };

  // Détection du format avec conférences (NBA/NFL/NHL depuis SofaScore)
  const hasConferences = Array.isArray(standings) && 
    standings.length > 0 && 
    standings[0]?.name && 
    standings[0]?.standings;
  
  let conferences = [];
  
  if (hasConferences) {
    // Format SofaScore avec conférences structurées
    conferences = standings;
  }

  const renderTable = (teams, conferenceTitle = null, key = 0) => (
    <div key={key} className="foot-standings-table" style={{ marginBottom: conferenceTitle ? '2rem' : '0' }}>
      {conferenceTitle && (
        <div className="league-header" style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', margin: '0.5rem 0' }}>{conferenceTitle}</h3>
        </div>
      )}
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Équipe</th>
            <th>PTS</th>
            <th>J</th>
            <th>G</th>
            <th>N</th>
            <th>P</th>
            <th>+/-</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, index) => {
              // Support format SofaScore (propriétés directes)
              if (team.points !== undefined && typeof team.points === 'number') {
                const diff = team.goalDifference || (team.goalsFor - team.goalsAgainst);
                const positionClass = getPositionClass(team.position || index + 1);
                
                return (
                  <tr key={team.teamId || index} className={positionClass}>
                    <td className="foot-position">{team.position || index + 1}</td>
                    <td className="foot-team-name">
                      {team.logo && (
                        <img 
                          src={team.logo} 
                          alt={team.team}
                          className="foot-team-logo"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      <span>{team.team}</span>
                    </td>
                    <td className="foot-points"><strong>{team.points}</strong></td>
                    <td>{team.played}</td>
                    <td>{team.wins}</td>
                    <td>{team.draws}</td>
                    <td>{team.losses}</td>
                    <td className={diff > 0 ? 'foot-positive' : diff < 0 ? 'foot-negative' : ''}>
                      {diff > 0 ? '+' : ''}{diff}
                    </td>
                  </tr>
                );
              }
              
              // Support format ESPN (team.stats array)
              const teamLogo = team.team?.logo || team.logo;
              const teamName = team.team?.displayName || team.team?.shortDisplayName || team.displayName || team.name;
              const stats = team.stats || [];
              const positionClass = getPositionClass(index + 1);
              const pointDiff = parseInt(stats.find(s => s.name === 'pointDifferential')?.displayValue || '0');
              
              return (
                <tr key={index} className={positionClass}>
                  <td className="foot-position">{index + 1}</td>
                  <td className="foot-team-name">
                    {teamLogo && (
                      <img 
                        src={teamLogo} 
                        alt={teamName}
                        className="foot-team-logo"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                    <span>{teamName}</span>
                  </td>
                  <td className="foot-points"><strong>{stats.find(s => s.name === 'points')?.displayValue || '0'}</strong></td>
                  <td>{stats.find(s => s.name === 'gamesPlayed')?.displayValue || '0'}</td>
                  <td>{stats.find(s => s.name === 'wins')?.displayValue || '0'}</td>
                  <td>{stats.find(s => s.name === 'ties')?.displayValue || '0'}</td>
                  <td>{stats.find(s => s.name === 'losses')?.displayValue || '0'}</td>
                  <td className={pointDiff > 0 ? 'foot-positive' : pointDiff < 0 ? 'foot-negative' : ''}>
                    {pointDiff > 0 ? '+' : ''}{pointDiff}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
  );

  return (
    <div className="football-league">
      <div className="league-header">
        <h2>{config?.icon || '⚽'} Classement {leagueName || 'Football'}</h2>
      </div>

      {hasConferences ? (
        <>
          {conferences.map((conference, idx) => {
            const icon = conference.name.includes('Western') || conference.name.includes('Ouest') ? '🌅' : '🌄';
            return renderTable(conference.standings, `${icon} ${conference.name}`, idx);
          })}
        </>
      ) : (
        renderTable(standings)
      )}

      {config?.legend && (
        <div className="classification-visual-legend">
          {config.legend.map((item, index) => (
            <div key={index} className={`legend-visual-item ${item.class}`}>
              <span className="legend-text">{item.icon} {item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FootballStandings;
