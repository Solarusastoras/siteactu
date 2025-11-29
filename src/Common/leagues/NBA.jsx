import React, { useState, useEffect } from 'react';
import Card from '../card';
import NBAStandings from '../components/NBAStandings';
import { calculateNBAStandings } from '../../Utils/standingsCalculator';
import { formatTime, getMatchStatus } from './matchHelpers';

const NBA = ({ view = 'matches' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('./data/nba.json');
        const nbaData = await response.json();
        
        setData(nbaData);
        setLoading(false);
      } catch (err) {
        console.error('Erreur chargement NBA:', err);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="loading"><h2>Chargement NBA...</h2></div>;
  }

  if (!data) {
    return <div className="error-message"><h2>⚠️ Données NBA indisponibles</h2></div>;
  }

  // Support des deux formats de données
  const matches = data?.matches || {};
  const events = data?.scoreboard?.events || [];
  
  // Combiner les matchs des deux sources
  const allMatches = [
    ...(matches.completed || []),
    ...(matches.live || []),
    ...(matches.upcoming || []),
    ...events
  ];

  if (view === 'classement') {
    // Calculer les standings dynamiquement à partir des matchs
    const calculatedStandings = calculateNBAStandings(matches);
    
    return <NBAStandings standingsData={calculatedStandings} />;
  }

  const getTeamData = (competitor) => {
    if (!competitor) return null;
    const team = competitor.team || {};
    return {
      id: team.id,
      name: team.name || team.displayName || '',
      shortName: team.shortDisplayName || team.displayName || team.name || '',
      abbreviation: team.abbreviation || '',
      logo: team.logo || team.logos?.[0]?.href || '',
      score: competitor.score || '0',
      winner: competitor.winner || false
    };
  };

  const renderGame = (game) => {
    const competition = game.competitions?.[0];
    if (!competition || !competition.competitors) return null;

    const homeComp = competition.competitors.find(c => c.homeAway === 'home');
    const awayComp = competition.competitors.find(c => c.homeAway === 'away');
    
    if (!homeComp || !awayComp) return null;

    const homeTeam = getTeamData(homeComp);
    const awayTeam = getTeamData(awayComp);

    if (!homeTeam || !awayTeam) return null;

    const clock = competition.status?.displayClock || game.status?.displayClock || '';
    const isLive = game.status?.type === 'STATUS_IN_PROGRESS';
    
    return (
      <div className="match-inline">
        <div className="team-inline away">
          {awayTeam.logo && <img src={awayTeam.logo} alt={awayTeam.name} className="team-logo-inline" />}
          <div className="team-details-inline">
            <h3>{awayTeam.shortName}</h3>
          </div>
          <div className="score-inline team-score">{awayTeam.score}</div>
        </div>
        
        <div className="vs-section">
          {isLive && clock && <div className="period-indicator">{clock}</div>}
          <span className="vs-inline">vs</span>
        </div>
        
        <div className="team-inline home">
          <div className="score-inline team-score">{homeTeam.score}</div>
          <div className="team-details-inline">
            <h3>{homeTeam.shortName}</h3>
          </div>
          {homeTeam.logo && <img src={homeTeam.logo} alt={homeTeam.name} className="team-logo-inline" />}
        </div>
      </div>
    );
  };

  if (!allMatches || allMatches.length === 0) {
    return (
      <div className="games-grid">
        <Card 
          variant="sport" 
          title="Aucun match NBA aujourd'hui" 
          subtitle="Revenez plus tard pour voir les prochains matchs." 
        />
      </div>
    );
  }

  return (
    <div className="games-grid">
      {allMatches.map((game) => {
        const matchStatus = getMatchStatus(game, formatTime);
        const badgeClass = matchStatus.className === 'status-live' ? 'live-badge' : 
                          matchStatus.className === 'status-completed' ? 'finished-badge' : '';
        
        return (
          <Card 
            key={game.id} 
            variant="sport"
            className="game-card"
            badge={matchStatus.label}
            badgeClassName={badgeClass}
          >
            <div className="game-header">
              <span className="game-time">
                {matchStatus.time}
              </span>
            </div>
            {renderGame(game)}
          </Card>
        );
      })}
    </div>
  );
};

export default NBA;