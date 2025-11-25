import React, { useState, useEffect } from 'react';
import { ligue1Config } from '../data/leaguesConfig';
import { currentLigue1Standings } from '../data/standingsData';
import './foot.scss';

/**
 * Calcule les standings à jour en fonction des résultats des matchs
 */
const calculateStandings = (events, baseStandings) => {
  if (!events || events.length === 0 || !baseStandings) {
    return baseStandings;
  }

  // Cloner les standings
  const standings = JSON.parse(JSON.stringify(baseStandings));
  
  // Filtrer les matchs terminés
  const completedMatches = events.filter(e => e.status?.completed === true);
  
  if (completedMatches.length === 0) {
    return standings;
  }

  // Créer une map des équipes par abréviation
  const teamsMap = new Map();
  standings.forEach((team, index) => {
    if (team.abbr) teamsMap.set(team.abbr, index);
  });

  // Traiter chaque match terminé
  completedMatches.forEach(match => {
    const competition = match.competitions?.[0];
    if (!competition?.competitors) return;

    const homeComp = competition.competitors.find(c => c.homeAway === 'home');
    const awayComp = competition.competitors.find(c => c.homeAway === 'away');
    
    if (!homeComp || !awayComp) return;

    const homeAbbr = homeComp.team?.abbreviation;
    const awayAbbr = awayComp.team?.abbreviation;
    const homeScore = parseInt(homeComp.score || 0);
    const awayScore = parseInt(awayComp.score || 0);

    const homeIndex = teamsMap.get(homeAbbr);
    const awayIndex = teamsMap.get(awayAbbr);

    if (homeIndex === undefined || awayIndex === undefined) return;

    const homeTeam = standings[homeIndex];
    const awayTeam = standings[awayIndex];

    // Mise à jour des stats
    if (homeScore > awayScore) {
      homeTeam.wins++;
      homeTeam.points += 3;
      awayTeam.losses++;
    } else if (awayScore > homeScore) {
      awayTeam.wins++;
      awayTeam.points += 3;
      homeTeam.losses++;
    } else {
      homeTeam.draws++;
      homeTeam.points += 1;
      awayTeam.draws++;
      awayTeam.points += 1;
    }

    // Mettre à jour les buts et matchs joués
    homeTeam.goalsFor += homeScore;
    homeTeam.goalsAgainst += awayScore;
    awayTeam.goalsFor += awayScore;
    awayTeam.goalsAgainst += homeScore;
    homeTeam.played++;
    awayTeam.played++;
  });

  // Trier par points, puis différence de buts, puis buts marqués
  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const diffA = a.goalsFor - a.goalsAgainst;
    const diffB = b.goalsFor - b.goalsAgainst;
    if (diffB !== diffA) return diffB - diffA;
    return b.goalsFor - a.goalsFor;
  });

  return standings;
};

const Ligue1 = ({ view = 'matches' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/actu/data/data.json');
        const jsonData = await response.json();
        const ligue1Data = jsonData.sports?.ligue1;
        
        setData(ligue1Data);
        setLoading(false);
      } catch (err) {
        console.error('Erreur chargement Ligue 1:', err);
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
    for (const rule of ligue1Config.positionRules) {
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
    return <div className="loading"><h2>Chargement Ligue 1...</h2></div>;
  }

  if (!data) {
    return <div className="error-message"><h2>⚠️ Données indisponibles</h2></div>;
  }

  const allMatches = data.scoreboard?.events || [];
  
  // Calculer les standings mis à jour avec tous les matchs
  const standings = calculateStandings(allMatches, currentLigue1Standings);

  // Filtrer les matchs du week-end (vendredi à dimanche)
  const getWeekendMatches = (matches) => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = dimanche, 1 = lundi, ..., 6 = samedi
    
    // Calculer le vendredi le plus proche (passé ou futur)
    let fridayStart = new Date(now);
    
    if (currentDay === 5) {
      // On est vendredi
      fridayStart.setHours(0, 0, 0, 0);
    } else if (currentDay === 6 || currentDay === 0) {
      // On est samedi ou dimanche, prendre le vendredi de cette semaine
      const daysToSubtract = currentDay === 6 ? 1 : 2;
      fridayStart.setDate(now.getDate() - daysToSubtract);
      fridayStart.setHours(0, 0, 0, 0);
    } else if (currentDay < 5) {
      // On est lundi à jeudi, prendre le vendredi qui arrive
      fridayStart.setDate(now.getDate() + (5 - currentDay));
      fridayStart.setHours(0, 0, 0, 0);
    } else {
      // Autre cas (ne devrait pas arriver)
      fridayStart.setHours(0, 0, 0, 0);
    }
    
    // Dimanche soir 23h59
    const sundayEnd = new Date(fridayStart);
    sundayEnd.setDate(fridayStart.getDate() + 2);
    sundayEnd.setHours(23, 59, 59, 999);
    
    return matches.filter(match => {
      const matchDate = new Date(match.date);
      return matchDate >= fridayStart && matchDate <= sundayEnd;
    });
  };

  const matches = getWeekendMatches(allMatches);

  // Vue Matchs
  if (view === 'matches') {
    return (
      <div className="football-league">
        <div className="league-header">
          <h2>{ligue1Config.icon} {ligue1Config.name}</h2>
        </div>

        <div className="games-grid">
          {matches.length === 0 ? (
            <div className="game-card">
              <p>Aucun match Ligue 1 disponible</p>
            </div>
          ) : (
            matches.map((game) => {
              const competition = game.competitions?.[0];
              if (!competition || !competition.competitors) return null;

              const homeComp = competition.competitors.find(c => c.homeAway === 'home');
              const awayComp = competition.competitors.find(c => c.homeAway === 'away');
              
              if (!homeComp || !awayComp) return null;

              // Récupérer les logos et noms depuis l'objet team
              const homeLogo = homeComp.team?.logo || homeComp.team?.logos?.[0]?.href;
              const awayLogo = awayComp.team?.logo || awayComp.team?.logos?.[0]?.href;
              const homeName = homeComp.team?.displayName || homeComp.team?.name || 'Équipe';
              const awayName = awayComp.team?.displayName || awayComp.team?.name || 'Équipe';
              const homeScore = homeComp.score || '0';
              const awayScore = awayComp.score || '0';
              const clock = competition.status?.displayClock || game.status?.displayClock || '';
              const isLive = game.status?.type === 'STATUS_IN_PROGRESS';

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
                      {homeLogo && (
                        <img 
                          src={homeLogo} 
                          alt={homeName}
                          className="team-logo-inline"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <div className="team-details-inline">
                        <h3>{homeName}</h3>
                      </div>
                    </div>

                    <div className="score-inline team-score">{homeScore}</div>

                    <div className="vs-section">
                      {isLive && clock && <div className="period-indicator">{clock}</div>}
                      <span className="vs-inline">vs</span>
                    </div>

                    <div className="score-inline team-score">{awayScore}</div>

                    <div className="team-inline away">
                      <div className="team-details-inline">
                        <h3>{awayName}</h3>
                      </div>
                      {awayLogo && (
                        <img 
                          src={awayLogo} 
                          alt={awayName}
                          className="team-logo-inline"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                    </div>
                  </div>

                  {competition.venue?.fullName && (
                    <div className="game-venue">📍 {competition.venue.fullName}</div>
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
          <h2>{ligue1Config.icon} Classement {ligue1Config.name}</h2>
        </div>

        <div className="legend-container">
          {ligue1Config.legend.map((item, index) => (
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
          <>
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
                    const diff = team.goalsFor - team.goalsAgainst;
                    
                    const positionClass = getPositionClass(index + 1);
                    const getEmoji = (className) => {
                      if (className === 'champions-league') return '🏆 ';
                      if (className === 'champions-league-playoff') return '🎯 ';
                      if (className === 'europa-league') return '🥈 ';
                      if (className === 'conference-league') return '🥉 ';
                      if (className === 'playoff-relegation') return '⚠️ ';
                      if (className === 'relegation') return '⬇️ ';
                      return '';
                    };

                    return (
                      <tr key={index} className={positionClass}>
                        <td className="foot-position">{index + 1}</td>
                        <td className="foot-team-name">
                          {team.logo && (
                            <img src={team.logo} alt="" className="foot-team-logo" />
                          )}
                          <span>{getEmoji(positionClass)}{team.team}</span>
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
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="classification-visual-legend">
              {ligue1Config.legend.map((item, index) => (
                <div key={index} className={`legend-visual-item ${item.class}`}>
                  <span className="legend-text">{item.icon} {item.label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return null;
};

export default Ligue1;
