import React, { useState, useEffect } from 'react';
import { bundesligaConfig } from '../data/leaguesConfig';
import { currentBundesligaStandings } from '../data/standingsData';

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

const Bundesliga = ({ view = 'matches' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/actu/data/data.json');
        const jsonData = await response.json();
        const bundesligaData = jsonData.sports?.bundesliga;
        
        setData(bundesligaData);
        setLoading(false);
      } catch (err) {
        console.error('Erreur chargement Bundesliga:', err);
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
    for (const rule of bundesligaConfig.positionRules) {
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
    return <div className="loading"><h2>Chargement Bundesliga...</h2></div>;
  }

  if (!data) {
    return <div className="error-message"><h2>⚠️ Données indisponibles</h2></div>;
  }

  const allMatches = data.scoreboard?.events || [];
  const standings = calculateStandings(allMatches, currentBundesligaStandings);

  // Vue Matchs
  if (view === 'matches') {
    return (
      <div className="football-league">
        <div className="league-header">
          <h2>{bundesligaConfig.icon} {bundesligaConfig.name}</h2>
        </div>

        <div className="games-grid">
          {allMatches.length === 0 ? (
            <div className="game-card">
              <p>Aucun match Bundesliga disponible</p>
            </div>
          ) : (
            allMatches.map((game) => {
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
          <h2>{bundesligaConfig.icon} Classement {bundesligaConfig.name}</h2>
        </div>

        <div className="legend-container">
          {bundesligaConfig.legend.map((item, index) => (
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
                  const goalDiff = team.goalsFor - team.goalsAgainst;
                  
                  return (
                    <tr key={index} className={getPositionClass(index + 1)}>
                      <td className="position">{index + 1}</td>
                      <td className="team-name">
                        {team.logo && (
                          <img src={team.logo} alt="" className="team-logo-small" />
                        )}
                        <span>{team.team}</span>
                      </td>
                      <td className="points"><strong>{team.points}</strong></td>
                      <td>{team.played}</td>
                      <td>{team.wins}</td>
                      <td>{team.draws}</td>
                      <td>{team.losses}</td>
                      <td>{goalDiff > 0 ? '+' : ''}{goalDiff}</td>
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

export default Bundesliga;
