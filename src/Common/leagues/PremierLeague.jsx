import React, { useState, useEffect } from 'react';
import { premierConfig } from '../data/leaguesConfig';
import { currentPremierLeagueStandings } from '../data/standingsData';
import FootballStandings from '../components/FootballStandings';
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

const PremierLeague = ({ view = 'matches' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/actu/data/data.json');
        const jsonData = await response.json();
        const premierData = jsonData.sports?.premierleague;
        
        setData(premierData);
        setLoading(false);
      } catch (err) {
        console.error('Erreur chargement Premier League:', err);
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

  if (loading) {
    return <div className="loading"><h2>Chargement Premier League...</h2></div>;
  }

  if (!data) {
    return <div className="error-message"><h2>⚠️ Données indisponibles</h2></div>;
  }

  // Support des deux formats de données
  const allMatches = data.matches 
    ? [...(data.matches.completed || []), ...(data.matches.live || []), ...(data.matches.upcoming || [])]
    : (data.scoreboard?.events || []);
  
  const standings = calculateStandings(allMatches, currentPremierLeagueStandings);

  // Filtrer les matchs du week-end (vendredi à dimanche)
  const getWeekendMatches = (matches) => {
    const now = new Date();
    const currentDay = now.getDay();
    
    let fridayStart = new Date(now);
    
    if (currentDay === 5) {
      fridayStart.setHours(0, 0, 0, 0);
    } else if (currentDay === 6 || currentDay === 0) {
      const daysToSubtract = currentDay === 6 ? 1 : 2;
      fridayStart.setDate(now.getDate() - daysToSubtract);
      fridayStart.setHours(0, 0, 0, 0);
    } else if (currentDay < 5) {
      fridayStart.setDate(now.getDate() + (5 - currentDay));
      fridayStart.setHours(0, 0, 0, 0);
    } else {
      fridayStart.setHours(0, 0, 0, 0);
    }
    
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
          <h2>{premierConfig.icon} {premierConfig.name}</h2>
        </div>

        <div className="games-grid">
          {matches.length === 0 ? (
            <div className="game-card">
              <p>Aucun match Premier League disponible</p>
            </div>
          ) : (
            matches.map((game) => {
              const competition = game.competitions?.[0];
              if (!competition || !competition.competitors) return null;

              const homeComp = competition.competitors?.find(c => c.homeAway === 'home');
              const awayComp = competition.competitors?.find(c => c.homeAway === 'away');
              
              if (!homeComp || !awayComp) return null;

              const homeLogo = homeComp.team?.logo || homeComp.team?.logos?.[0]?.href;
              const awayLogo = awayComp.team?.logo || awayComp.team?.logos?.[0]?.href;
              const homeName = homeComp.team?.displayName || homeComp.team?.name || 'Équipe';
              const awayName = awayComp.team?.displayName || awayComp.team?.name || 'Équipe';
              const homeScore = homeComp.score || '0';
              const awayScore = awayComp.score || '0';
              const clock = competition.status?.displayClock || game.status?.displayClock || '';
              const isLive = game.status?.type?.state === 'in' || game.status?.type === 'STATUS_IN_PROGRESS';

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
      <FootballStandings 
        standings={data?.standings || standings} 
        leagueName={premierConfig.name}
        config={premierConfig}
      />
    );
  }

  return null;
};

export default PremierLeague;
