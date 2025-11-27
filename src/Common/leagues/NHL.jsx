import React, { useState, useEffect } from 'react';
import Card from '../card';
import NHLStandings from '../components/NHLStandings';

const NHL = ({ view = 'matches' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/actu/data/data.json');
        const jsonData = await response.json();
        const nhlData = jsonData.sports?.nhl;
        
        setData(nhlData);
        setLoading(false);
      } catch (err) {
        console.error('Erreur chargement NHL:', err);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="loading"><h2>Chargement NHL...</h2></div>;
  }

  if (!data) {
    return <div className="error-message"><h2>⚠️ Données NHL indisponibles</h2></div>;
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
    const standings = data.standings || [];
    
    return <NHLStandings standingsData={standings} />;
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

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
          title="Aucun match NHL aujourd'hui" 
          subtitle="Revenez plus tard pour voir les prochains matchs." 
        />
      </div>
    );
  }

  return (
    <div className="games-grid">
      {allMatches.map((game) => {
        const isLive = game.status?.type === 'STATUS_IN_PROGRESS';
        const isFinished = game.status?.completed === true;
        const badgeContent = isLive ? 'LIVE' : isFinished ? 'TERMINÉ' : formatTime(game.date);
        const badgeClass = isLive ? 'live-badge' : isFinished ? 'finished-badge' : '';
        
        return (
          <Card 
            key={game.id} 
            variant="sport"
            className="game-card"
            badge={badgeContent}
            badgeClassName={badgeClass}
          >
            <div className="game-header">
              <span className="game-time">
                {game.status?.completed ? 
                  'FT' : 
                  isLive ? 
                    game.status?.detail :
                    formatTime(game.date)}
              </span>
            </div>
            {renderGame(game)}
          </Card>
        );
      })}
    </div>
  );
};

export default NHL;
