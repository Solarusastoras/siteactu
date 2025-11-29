import React, { useState, useEffect } from 'react';
import { ligue1Config } from '../data/leaguesConfig';
import { currentLigue1Standings } from '../data/standingsData';
import FootballStandings from '../components/FootballStandings';
import { formatTime, getMatchStatus } from './matchHelpers';
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
        const response = await fetch('/actu/data/ligue1.json');
        const ligue1Data = await response.json();
        
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



  if (loading) {
    return <div className="loading"><h2>Chargement Ligue 1...</h2></div>;
  }

  if (!data) {
    return <div className="error-message"><h2>⚠️ Données indisponibles</h2></div>;
  }

  // Support des deux formats de données
  const allMatches = data.matches 
    ? [...(data.matches.completed || []), ...(data.matches.live || []), ...(data.matches.upcoming || [])]
    : (data.scoreboard?.events || []);
  
  const standings = calculateStandings(allMatches, currentLigue1Standings);
  
  // Grouper les matchs par jour de la semaine
  const groupMatchesByDay = (matches) => {
    const groups = {
      friday: [],
      saturday: [],
      sunday: []
    };

    matches.forEach(match => {
      const matchDate = new Date(match.date);
      const dayOfWeek = matchDate.getDay();
      
      if (dayOfWeek === 5) { // Vendredi
        groups.friday.push(match);
      } else if (dayOfWeek === 6) { // Samedi
        groups.saturday.push(match);
      } else if (dayOfWeek === 0) { // Dimanche
        groups.sunday.push(match);
      }
    });

    return groups;
  };

  const matchesByDay = groupMatchesByDay(allMatches);
  const nextDayMatches = data?.nextDayMatches || [];

  // Vue Matchs
  if (view === 'matches') {
    return (
      <div className="football-league">
        <div className="league-header">
          <h2>{ligue1Config.icon} {ligue1Config.name}</h2>
        </div>

        {/* Section Vendredi */}
        {matchesByDay.friday.length > 0 && (
          <div className="day-section">
            <h3 className="day-title">🗓️ Vendredi</h3>
            <div className="games-grid">
              {matchesByDay.friday.map((game) => {
                const competition = game.competitions?.[0];
                if (!competition || !competition.competitors) return null;

                const homeComp = competition.competitors.find(c => c.homeAway === 'home');
                const awayComp = competition.competitors.find(c => c.homeAway === 'away');
                
                if (!homeComp || !awayComp) return null;

                const homeLogo = homeComp.team?.logo || homeComp.team?.logos?.[0]?.href;
                const awayLogo = awayComp.team?.logo || awayComp.team?.logos?.[0]?.href;
                const homeName = homeComp.team?.displayName || homeComp.team?.name || 'Équipe';
                const awayName = awayComp.team?.displayName || awayComp.team?.name || 'Équipe';
                const homeScore = homeComp.score || '0';
                const awayScore = awayComp.score || '0';
                const clock = competition.status?.displayClock || game.status?.displayClock || '';
                const isLive = game.status?.type?.state === 'in' || game.status?.type === 'STATUS_IN_PROGRESS';
                const matchStatus = getMatchStatus(game, formatTime);

                return (
                  <div key={game.id} className="game-card">
                    <div className="game-header">
                      <span className="game-time">
                        {matchStatus.time}
                      </span>
                      <span className={`match-status-badge ${matchStatus.className}`}>
                        {matchStatus.label}
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
              })}
            </div>
          </div>
        )}

        {/* Section Samedi */}
        {matchesByDay.saturday.length > 0 && (
          <div className="day-section">
            <h3 className="day-title">🗓️ Samedi</h3>
            <div className="games-grid">
              {matchesByDay.saturday.map((game) => {
                const competition = game.competitions?.[0];
                if (!competition || !competition.competitors) return null;

                const homeComp = competition.competitors.find(c => c.homeAway === 'home');
                const awayComp = competition.competitors.find(c => c.homeAway === 'away');
                
                if (!homeComp || !awayComp) return null;

                const homeLogo = homeComp.team?.logo || homeComp.team?.logos?.[0]?.href;
                const awayLogo = awayComp.team?.logo || awayComp.team?.logos?.[0]?.href;
                const homeName = homeComp.team?.displayName || homeComp.team?.name || 'Équipe';
                const awayName = awayComp.team?.displayName || awayComp.team?.name || 'Équipe';
                const homeScore = homeComp.score || '0';
                const awayScore = awayComp.score || '0';
                const clock = competition.status?.displayClock || game.status?.displayClock || '';
                const isLive = game.status?.type?.state === 'in' || game.status?.type === 'STATUS_IN_PROGRESS';
                const matchStatus = getMatchStatus(game, formatTime);

                return (
                  <div key={game.id} className="game-card">
                    <div className="game-header">
                      <span className="game-time">
                        {matchStatus.time}
                      </span>
                      <span className={`match-status-badge ${matchStatus.className}`}>
                        {matchStatus.label}
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
              })}
            </div>
          </div>
        )}

        {/* Section Dimanche */}
        {matchesByDay.sunday.length > 0 && (
          <div className="day-section">
            <h3 className="day-title">🗓️ Dimanche</h3>
            <div className="games-grid">
              {matchesByDay.sunday.map((game) => {
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
              const isLive = game.status?.type?.state === 'in' || game.status?.type === 'STATUS_IN_PROGRESS';
              const matchStatus = getMatchStatus(game, formatTime);

              return (
                <div key={game.id} className="game-card">
                  <div className="game-header">
                    <span className="game-time">
                      {matchStatus.time}
                    </span>
                    <span className={`match-status-badge ${matchStatus.className}`}>
                      {matchStatus.label}
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
              })}
            </div>
          </div>
        )}

        {/* Message si aucun match */}
        {matchesByDay.friday.length === 0 && matchesByDay.saturday.length === 0 && matchesByDay.sunday.length === 0 && (
          <div className="game-card">
            <p>Aucun match Ligue 1 ce week-end</p>
          </div>
        )}
      </div>
    );
  }

  // Vue Classement
  if (view === 'classement') {
    return (
      <FootballStandings 
        standings={data?.standings || standings} 
        leagueName={ligue1Config.name}
        config={ligue1Config}
      />
    );
  }

  return null;
};

export default Ligue1;
