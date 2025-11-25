import React, { useState, useEffect } from 'react';
import { ligue2Config } from '../data/leaguesConfig';
import { currentLigue2Standings } from '../data/standingsData';
import './foot.scss';

const calculateStandings = (events, baseStandings) => {
  if (!events || events.length === 0 || !baseStandings) return baseStandings;
  const standings = JSON.parse(JSON.stringify(baseStandings));
  const completedMatches = events.filter(e => e.status?.completed === true);
  if (completedMatches.length === 0) return standings;
  
  const teamsMap = new Map();
  standings.forEach((team, index) => { if (team.abbr) teamsMap.set(team.abbr, index); });
  
  completedMatches.forEach(match => {
    const competition = match.competitions?.[0];
    if (!competition?.competitors) return;
    const homeComp = competition.competitors.find(c => c.homeAway === 'home');
    const awayComp = competition.competitors.find(c => c.homeAway === 'away');
    if (!homeComp || !awayComp) return;
    
    const homeScore = parseInt(homeComp.score || 0);
    const awayScore = parseInt(awayComp.score || 0);
    const homeIndex = teamsMap.get(homeComp.team?.abbreviation);
    const awayIndex = teamsMap.get(awayComp.team?.abbreviation);
    if (homeIndex === undefined || awayIndex === undefined) return;
    
    const homeTeam = standings[homeIndex];
    const awayTeam = standings[awayIndex];
    
    if (homeScore > awayScore) { homeTeam.wins++; homeTeam.points += 3; awayTeam.losses++; }
    else if (awayScore > homeScore) { awayTeam.wins++; awayTeam.points += 3; homeTeam.losses++; }
    else { homeTeam.draws++; homeTeam.points += 1; awayTeam.draws++; awayTeam.points += 1; }
    
    homeTeam.goalsFor += homeScore; homeTeam.goalsAgainst += awayScore;
    awayTeam.goalsFor += awayScore; awayTeam.goalsAgainst += homeScore;
    homeTeam.played++; awayTeam.played++;
  });
  
  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const diffA = a.goalsFor - a.goalsAgainst;
    const diffB = b.goalsFor - b.goalsAgainst;
    if (diffB !== diffA) return diffB - diffA;
    return b.goalsFor - a.goalsFor;
  });
  return standings;
};

const Ligue2 = ({ view = 'matches' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/actu/data/data.json');
        const jsonData = await response.json();
        const ligue2Data = jsonData.sports?.ligue2;
        
        setData(ligue2Data);
        setLoading(false);
      } catch (err) {
        console.error('Erreur chargement Ligue 2:', err);
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
    for (const rule of ligue2Config.positionRules) {
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
    return <div className="loading"><h2>Chargement Ligue 2...</h2></div>;
  }

  if (!data) {
    return <div className="error-message"><h2>⚠️ Données indisponibles</h2></div>;
  }

  const allMatches = data.scoreboard?.events || [];
  const standings = calculateStandings(allMatches, currentLigue2Standings);
  const matches = allMatches;

  // Vue Matchs
  if (view === 'matches') {
    return (
      <div className="football-league">
        <div className="league-header">
          <h2>{ligue2Config.icon} {ligue2Config.name}</h2>
        </div>

        <div className="games-grid">
          {matches.length === 0 ? (
            <div className="game-card">
              <p>Aucun match Ligue 2 disponible</p>
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
                    </div>

                    <div className="score-inline team-score">
                      {homeTeam.score || '0'}
                    </div>

                    <span className="vs-inline">vs</span>

                    <div className="score-inline team-score">
                      {awayTeam.score || '0'}
                    </div>

                    <div className="team-inline away">
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
          <h2>{ligue2Config.icon} Classement {ligue2Config.name}</h2>
        </div>

        <div className="legend-container">
          {ligue2Config.legend.map((item, index) => (
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
          <div className="foot-standings-table">
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
                  
                  const positionClass = getPositionClass(index + 1);
                  const getEmoji = (className) => {
                    if (className === 'champions-league') return '🏆 ';
                    if (className === 'champions-league-playoff') return '🎯 ';
                    if (className === 'europa-league') return '🥈 ';
                    if (className === 'conference-league') return '🥉 ';
                    if (className === 'promotion') return '⬆️ ';
                    if (className === 'playoff-relegation') return '⚠️ ';
                    if (className === 'relegation') return '⬇️ ';
                    return '';
                  };
                  
                  return (
                    <tr key={index} className={positionClass}>
                      <td className="foot-position">{index + 1}</td>
                      <td className="foot-team-name">
                        {teamLogo && (
                          <img src={teamLogo} alt="" className="foot-team-logo" />
                        )}
                        <span>{getEmoji(positionClass)}{teamName}</span>
                      </td>
                      <td className="foot-points"><strong>{stats.find(s => s.name === 'points')?.displayValue || '0'}</strong></td>
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

export default Ligue2;
