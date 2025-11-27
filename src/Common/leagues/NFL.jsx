import React, { useState, useEffect } from 'react';
import Card from '../card';
import NFLStandings from '../components/NFLStandings';

const NFL = ({ view = 'matches' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/actu/data/data.json');
        const jsonData = await response.json();
        const nflData = jsonData.sports?.nfl;
        
        setData(nflData);
        setLoading(false);
      } catch (err) {
        console.error('Erreur chargement NFL:', err);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filtrer les matchs de jeudi à mardi (semaine NFL)
  const filterNFLWeekMatches = (events) => {
    if (!events || events.length === 0) return [];

    const now = new Date();
    const currentDay = now.getDay(); // 0=Dimanche, 1=Lundi, ..., 6=Samedi

    // Calculer le jeudi de la semaine en cours ou précédente
    let thursdayStart = new Date(now);
    
    if (currentDay === 0) { // Dimanche
      thursdayStart.setDate(now.getDate() - 3); // Jeudi précédent
    } else if (currentDay === 1) { // Lundi
      thursdayStart.setDate(now.getDate() - 4); // Jeudi précédent
    } else if (currentDay === 2) { // Mardi
      thursdayStart.setDate(now.getDate() - 5); // Jeudi précédent
    } else if (currentDay === 3) { // Mercredi
      thursdayStart.setDate(now.getDate() + 1); // Jeudi prochain
    } else if (currentDay === 4) { // Jeudi
      thursdayStart.setDate(now.getDate()); // Aujourd'hui
    } else if (currentDay === 5) { // Vendredi
      thursdayStart.setDate(now.getDate() - 1); // Jeudi précédent
    } else { // Samedi
      thursdayStart.setDate(now.getDate() - 2); // Jeudi précédent
    }
    
    thursdayStart.setHours(0, 0, 0, 0);

    // Le mardi suivant à 23h59
    const tuesdayEnd = new Date(thursdayStart);
    tuesdayEnd.setDate(thursdayStart.getDate() + 5); // +5 jours = Mardi
    tuesdayEnd.setHours(23, 59, 59, 999);

    return events.filter(event => {
      const matchDate = new Date(event.date);
      return matchDate >= thursdayStart && matchDate <= tuesdayEnd;
    });
  };

  if (loading) {
    return <div className="loading"><h2>Chargement NFL...</h2></div>;
  }

  if (!data) {
    return <div className="error-message"><h2>⚠️ Données NFL indisponibles</h2></div>;
  }

  // Support des deux formats de données
  const matches = data?.matches || {};
  const scoreboardEvents = data?.scoreboard?.events || [];
  
  // Combiner les matchs des deux sources
  const combinedMatches = [
    ...(matches.completed || []),
    ...(matches.live || []),
    ...(matches.upcoming || []),
    ...scoreboardEvents
  ];
  
  const events = filterNFLWeekMatches(combinedMatches);

  if (view === 'classement') {
    const standings = data.standings || [];
    
    return <NFLStandings standingsData={standings} />;
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

  if (!events || events.length === 0) {
    return (
      <div className="games-grid">
        <Card 
          variant="sport" 
          title="Aucun match NFL aujourd'hui" 
          subtitle="Revenez plus tard pour voir les prochains matchs." 
        />
      </div>
    );
  }

  return (
    <div className="games-grid">
      {events.map((game) => {
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

export default NFL;
