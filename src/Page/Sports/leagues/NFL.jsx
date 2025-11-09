import React, { useState, useEffect } from 'react';
import NFLStandings from '../../../Common/components/NFLStandings';
import { currentNFLStandings } from '../../../Common/data/nflStandingsData';
import Card from '../../../Common/card';

const NFL = ({ view = 'matches' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Erreur lors du chargement NFL:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="loading"><h2>Chargement...</h2></div>;

  if (view === 'classement') {
    return <NFLStandings standingsData={currentNFLStandings} />;
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const renderGameLayout = (game) => {
    const competitors = game.competitions[0].competitors;
    const homeTeam = competitors.find(team => team.homeAway === 'home');
    const awayTeam = competitors.find(team => team.homeAway === 'away');

    return (
      <div className="match-inline">
        <div className="team-inline away">
          <img src={awayTeam.team.logo} alt={awayTeam.team.displayName} className="team-logo-inline" />
          <div className="team-details-inline">
            <h3>{awayTeam.team.abbreviation}</h3>
            {awayTeam.records && awayTeam.records[0] && (
              <div className="team-record-inline"><small>{awayTeam.records[0].summary}</small></div>
            )}
          </div>
          <div className="score-inline team-score">{awayTeam.score || '0'}</div>
        </div>
        
        <span className="vs-inline">vs</span>
        
        <div className="team-inline home">
          <div className="score-inline team-score">{homeTeam.score || '0'}</div>
          <div className="team-details-inline">
            <h3>{homeTeam.team.abbreviation}</h3>
            {homeTeam.records && homeTeam.records[0] && (
              <div className="team-record-inline"><small>{homeTeam.records[0].summary}</small></div>
            )}
          </div>
          <img src={homeTeam.team.logo} alt={homeTeam.team.displayName} className="team-logo-inline" />
        </div>
      </div>
    );
  };

  if (!data?.events || data.events.length === 0) {
    return (
      <div className="games-grid">
        <Card variant="sport" title="Aucun match NFL aujourd'hui" subtitle="Revenez plus tard pour voir les prochains matchs." />
      </div>
    );
  }

  return (
    <div className="games-grid">
      {data.events.map((game) => (
        <Card 
          key={game.id} 
          variant="sport"
          className="game-card"
          badge={game.status.type.state === 'in' ? 'LIVE' : !game.status.type.completed ? formatTime(game.date) : null}
        >
          <div className="game-header">
            <span className={`game-status ${game.status.type.state.toLowerCase()}`}>
              {game.status.type.description}
            </span>
            <span className="game-time">
              {game.status.type.completed ? 'Terminé' : 
                game.status.type.state === 'in' ? 
                  `${game.status.displayClock} ${game.status.period ? `- ${game.status.period}'` : ''}` :
                  formatTime(game.date)}
            </span>
          </div>
          {renderGameLayout(game)}
        </Card>
      ))}
    </div>
  );
};

export default NFL;
