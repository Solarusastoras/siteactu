import React, { useState, useEffect } from 'react';
import { brasileiraoConfig } from '../data/leaguesConfig';

const Brasileirao = ({ view = 'matches' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/actu/data/data.json');
        const jsonData = await response.json();
        const brasileiraoData = jsonData.sports?.brasileirao;
        
        setData(brasileiraoData);
        setLoading(false);
      } catch (err) {
        console.error('Erreur chargement Brasileirão:', err);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const getPositionClass = (position) => {
    for (const rule of brasileiraoConfig.positionRules) {
      if (rule.range && position >= rule.range[0] && position <= rule.range[1]) {
        return rule.class;
      }
      if (rule.positions && rule.positions.includes(position)) {
        return rule.class;
      }
    }
    return '';
  };

  if (loading) {
    return <div className="loading"><h2>Chargement Brasileirão...</h2></div>;
  }

  if (!data) {
    return <div className="error-message"><h2>⚠️ Données indisponibles</h2></div>;
  }

  const matches = data.scoreboard?.events || [];
  const standings = data.standings || [];

  // Vue Matchs
  if (view === 'matches') {
    return (
      <div className="football-league">
        <div className="league-header">
          <h2>{brasileiraoConfig.icon} {brasileiraoConfig.name}</h2>
        </div>

        <div className="games-grid">
          {matches.length === 0 ? (
            <div className="game-card">
              <p>Aucun match Brasileirão disponible</p>
            </div>
          ) : (
            matches.map((game) => {
              const homeTeam = game.competitions?.homeTeam;
              const awayTeam = game.competitions?.awayTeam;

              if (!homeTeam || !awayTeam) return null;

              const homeLogo = homeTeam.team?.logo || homeTeam.logo;
              const awayLogo = awayTeam.team?.logo || awayTeam.logo;
              const homeName = homeTeam.team?.displayName || homeTeam.team?.name || homeTeam.displayName || homeTeam.name || 'Équipe';
              const awayName = awayTeam.team?.displayName || awayTeam.team?.name || awayTeam.displayName || awayTeam.name || 'Équipe';
              const homeRecord = homeTeam.team?.record || homeTeam.record;
              const awayRecord = awayTeam.team?.record || awayTeam.record;

              return (
                <div key={game.id} className="game-card">
                  <div className="game-header">
                    <span className={`game-status ${game.status?.completed ? 'completed' : 'scheduled'}`}>
                      {game.status?.detail || 'À venir'}
                    </span>
                    <span className="game-time">
                      {game.status?.completed ? 'Terminé' : formatTime(game.date)}
                    </span>
                  </div>

                  <div className="match-inline">
                    <div className="team-inline home">
                      <div className="logo-container">
                        {homeLogo && (
                          <img 
                            src={homeLogo} 
                            alt={homeName}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        )}
                      </div>
                      <div className="team-details-inline">
                        <h3>{homeName}</h3>
                        {homeRecord && (
                          <p className="team-record-inline">
                            <small>{homeRecord}</small>
                          </p>
                        )}
                      </div>
                      <div className="score-inline team-score">
                        {homeTeam.score || '0'}
                      </div>
                    </div>

                    <span className="vs-inline">vs</span>

                    <div className="team-inline away">
                      <div className="score-inline team-score">
                        {awayTeam.score || '0'}
                      </div>
                      <div className="team-details-inline">
                        <h3>{awayName}</h3>
                        {awayRecord && (
                          <p className="team-record-inline">
                            <small>{awayRecord}</small>
                          </p>
                        )}
                      </div>
                      <div className="logo-container">
                        {awayLogo && (
                          <img 
                            src={awayLogo} 
                            alt={awayName}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {game.competitions?.venue && (
                    <div className="game-venue">📍 {game.competitions.venue}</div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // Vue Classement
  if (view === 'classement') {
    return (
      <div className="football-league">
        <div className="league-header">
          <h2>{brasileiraoConfig.icon} Classement {brasileiraoConfig.name}</h2>
        </div>

        <div className="legend-container">
          {brasileiraoConfig.legend.map((item, index) => (
            <div key={index} className="legend-item">
              <span className={`legend-badge ${item.class}`}></span>
              <span>{item.icon} {item.label}</span>
            </div>
          ))}
        </div>

        {!standings || standings.length === 0 ? (
          <div className="no-standings">
            <p>Classement non disponible</p>
          </div>
        ) : (
          <div className="standings-table">
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
                {standings.map((team, index) => {
                  const teamLogo = team.team?.logo || team.logo;
                  const teamName = team.team?.displayName || team.team?.shortDisplayName || team.displayName || team.name;
                  const stats = team.stats || [];
                  
                  return (
                    <tr key={index} className={getPositionClass(index + 1)}>
                      <td className="position">{index + 1}</td>
                      <td className="team-name">
                        {teamLogo && (
                          <img src={teamLogo} alt="" className="team-logo-small" />
                        )}
                        <span>{teamName}</span>
                      </td>
                      <td className="points"><strong>{stats.find(s => s.name === 'points')?.displayValue || '0'}</strong></td>
                      <td>{stats.find(s => s.name === 'gamesPlayed')?.displayValue || '0'}</td>
                      <td>{stats.find(s => s.name === 'wins')?.displayValue || '0'}</td>
                      <td>{stats.find(s => s.name === 'ties')?.displayValue || '0'}</td>
                      <td>{stats.find(s => s.name === 'losses')?.displayValue || '0'}</td>
                      <td>{stats.find(s => s.name === 'pointDifferential')?.displayValue || '0'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default Brasileirao;
