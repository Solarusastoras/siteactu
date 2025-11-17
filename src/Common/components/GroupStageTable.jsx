import React, { useState } from 'react';

const GroupStageTable = ({ group }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const handleTeamClick = (team, e) => {
    e.stopPropagation();
    setSelectedTeam(team);
    setShowModal(true);
  };

  const getTeamMatches = (team) => {
    if (!group.matches) return [];
    return group.matches.filter(match => 
      match.team1 === team || match.team2 === team
    );
  };

  return (
    <>
      <div className="group-card" style={{ cursor: 'default' }}>
        <h5>{group.name}</h5>
      {group.standings ? (
        <div className="group-table">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Équipe</th>
                <th>J</th>
                <th>V</th>
                <th>N</th>
                <th>D</th>
                <th>BP</th>
                <th>BC</th>
                <th>Diff</th>
                <th>Pts</th>
              </tr>
            </thead>
            <tbody>
              {group.standings.map((standing, standingIdx) => {
                const rank = standingIdx + 1;
                let qualificationClass = '';
                if (rank <= 8) {
                  qualificationClass = 'qualified-direct';
                } else if (rank >= 9 && rank <= 24) {
                  qualificationClass = 'qualified-playoff';
                } else {
                  qualificationClass = standing.qualified ? 'qualified' : '';
                }
                
                return (
                  <tr 
                    key={standingIdx} 
                    className={qualificationClass}
                    onClick={(e) => handleTeamClick(standing.team, e)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{rank}</td>
                    <td className="team-name">{standing.team}</td>
                    <td>{standing.played}</td>
                    <td>{standing.won}</td>
                    <td>{standing.drawn}</td>
                    <td>{standing.lost}</td>
                    <td>{standing.goalsFor}</td>
                    <td>{standing.goalsAgainst}</td>
                    <td className={standing.goalDiff > 0 ? 'positive' : standing.goalDiff < 0 ? 'negative' : ''}>
                      {standing.goalDiff > 0 ? '+' : ''}{standing.goalDiff}
                    </td>
                    <td className="points">{standing.points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="group-table">
          <ul style={{listStyle: 'none', padding: 0}}>
            {group.teams.map((team, teamIdx) => (
              <li key={teamIdx} style={{
                padding: '10px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                color: '#e0e0e0'
              }}>{team}</li>
            ))}
          </ul>
        </div>
      )}
      </div>

      {showModal && selectedTeam && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setSelectedTeam(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Matchs de {selectedTeam}</h3>
              <button className="modal-close" onClick={() => { setShowModal(false); setSelectedTeam(null); }}>✕</button>
            </div>
            <div className="modal-body">
              {group.matches ? (
                <div className="scoreboard">
                  {getTeamMatches(selectedTeam).map((match, idx) => (
                    <div key={idx} className="match-row">
                      <div className="match-teams">
                        <span className={`team ${match.winner === match.team1 ? 'winner' : ''}`}>
                          {match.team1}
                        </span>
                        <span className="match-score">{match.score}</span>
                        <span className={`team ${match.winner === match.team2 ? 'winner' : ''}`}>
                          {match.team2}
                        </span>
                      </div>
                      {match.date && (
                        <div className="match-date">{match.date}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-matches">
                  <p>Aucun match disponible pour {selectedTeam}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupStageTable;
