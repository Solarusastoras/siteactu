import React, { useState, useEffect, useMemo } from 'react';
import TournamentWrapper from '../components/TournamentWrapper';
import championLeagueData from '../../Data/Foot/dataChampionLeague.json';
import { championsLeagueConfig } from '../data/leaguesConfig';

const ChampionLeagueWrapper = ({ view = 'matches' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Si view='editions', afficher directement l'historique, sinon afficher live
  const activeMode = view === 'editions' ? 'history' : 'live';

  useEffect(() => {
    if (activeMode === 'live') {
      const fetchData = async () => {
        try {
          const response = await fetch('/actu/data/data.json');
          const jsonData = await response.json();
          const clData = jsonData.sports?.championsleague;
          
          setData(clData);
          setLoading(false);
        } catch (err) {
          console.error('Erreur chargement Champions League:', err);
          setLoading(false);
        }
      };

      fetchData();
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [activeMode]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const getPositionClass = (position) => {
    for (const rule of championsLeagueConfig.positionRules) {
      if (rule.range && position >= rule.range[0] && position <= rule.range[1]) {
        return rule.class;
      }
      if (rule.positions && rule.positions.includes(position)) {
        return rule.class;
      }
    }
    return '';
  };

  const config = useMemo(() => ({
    title: 'UEFA Champions League',
    subtitle: 'La plus prestigieuse compétition européenne de clubs',
    icon: '🏆',
    className: 'champion-league',
    tournamentLabel: 'Saison',
    tournamentName: 'La Ligue des Champions',
    multipleHosts: false,
    hideThirdPlace: true,
    dataKeys: {
      current: 'currentChampionLeague',
      past: 'pastChampionLeagues'
    },
    renderStats: (statistics, pastTournaments) => (
      <div className="stats-section">
        <h2>📊 Statistiques</h2>
        <div className="stats-grid">
          <div className="stat-card highlight">
            <h3>🏆 Plus de victoires</h3>
            <div className="stat-value">{statistics.mostWins.team}</div>
            <div className="stat-detail">{statistics.mostWins.wins} titres</div>
          </div>
          <div className="stat-card">
            <h3>🎯 Champions récents</h3>
            <ul className="recent-champions-list">
              {statistics.recentChampions.map((champion, idx) => (
                <li key={idx}>{champion}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  }), []);

  // Mode Historique
  if (activeMode === 'history') {
    return (
      <div className="champions-league-wrapper">
        <TournamentWrapper 
          title={config.title}
          subtitle={config.subtitle}
          icon={config.icon}
          data={championLeagueData}
          config={config}
        />
      </div>
    );
  }

  // Mode Live
  if (loading) {
    return <div className="loading"><h2>Chargement Champions League...</h2></div>;
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
          <h2>{championsLeagueConfig.icon} {championsLeagueConfig.name}</h2>
        </div>

        <div className="games-grid">
          {matches.length === 0 ? (
            <div className="game-card">
              <p>Aucun match Champions League disponible</p>
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
          <h2>{championsLeagueConfig.icon} Classement {championsLeagueConfig.name}</h2>
        </div>

        <div className="legend-container">
          {championsLeagueConfig.legend.map((item, index) => (
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

export default React.memo(ChampionLeagueWrapper);