import React, { useState, useEffect } from 'react';
import Card from '../card';

/**
 * Composant générique pour les sports américains (NBA, NFL, NHL)
 * Gère la récupération des matchs, le classement et l'affichage
 */
const AmericanSportLeague = ({ 
  sportConfig,  // Configuration du sport (API, nom, emoji, etc.)
  StandingsComponent,  // Composant de classement spécifique
  view = 'matches' 
}) => {
  const [data, setData] = useState(null);
  const [standings, setStandings] = useState(sportConfig.defaultStandings || null);
  const [loading, setLoading] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);
  const [matchTimeRange, setMatchTimeRange] = useState(() => {
    const cached = localStorage.getItem(`${sportConfig.storageKey}_match_time_range`);
    return cached ? JSON.parse(cached) : sportConfig.defaultTimeRange;
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Loading uniquement au premier chargement
        if (firstLoad) {
          setLoading(true);
        }
        
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const currentTime = hours * 60 + minutes;
        
        // Premier chargement : récupérer toujours les matchs
        if (firstLoad) {
          setFirstLoad(false);
          console.log(`${sportConfig.emoji} ${sportConfig.name} - Premier chargement...`);
          const matchesResponse = await fetch(sportConfig.matchesUrl);
          const matchesData = await matchesResponse.json();
          setData(matchesData);
          
          // Calculer la plage horaire si on a des matchs
          if (matchesData?.events && matchesData.events.length > 0) {
            const firstMatchTime = new Date(matchesData.events[0].date);
            const firstMatchMinutes = firstMatchTime.getHours() * 60 + firstMatchTime.getMinutes();
            
            const lastMatchTime = new Date(matchesData.events[matchesData.events.length - 1].date);
            const lastMatchMinutes = (lastMatchTime.getHours() + sportConfig.matchDuration) * 60 + lastMatchTime.getMinutes();
            
            const newTimeRange = {
              start: firstMatchMinutes,
              end: lastMatchMinutes > 24 * 60 ? lastMatchMinutes - 24 * 60 : lastMatchMinutes
            };
            
            console.log(`${sportConfig.emoji} ${sportConfig.name} - Plage: ${Math.floor(newTimeRange.start / 60)}h${newTimeRange.start % 60} - ${Math.floor(newTimeRange.end / 60)}h${newTimeRange.end % 60}`);
            
            setMatchTimeRange(newTimeRange);
            localStorage.setItem(`${sportConfig.storageKey}_match_time_range`, JSON.stringify(newTimeRange));
          }
        }
        // Après le premier chargement : utiliser la plage horaire
        else if (matchTimeRange && !firstLoad) {
          const isMatchTime = sportConfig.checkMatchTime 
            ? sportConfig.checkMatchTime(currentTime, matchTimeRange)
            : currentTime >= matchTimeRange.start && currentTime <= matchTimeRange.end;
          
          if (isMatchTime) {
            console.log(`${sportConfig.emoji} ${sportConfig.name} - Actualisation...`);
            const matchesResponse = await fetch(sportConfig.matchesUrl);
            const matchesData = await matchesResponse.json();
            setData(matchesData);
          } else {
            console.log(`📦 ${sportConfig.name} - Hors plage horaire`);
          }
        }
        
        // Récupérer le classement si une fonction est fournie
        if (sportConfig.fetchStandings) {
          try {
            const standingsData = await sportConfig.fetchStandings();
            setStandings(standingsData);
          } catch (standingsError) {
            console.error(`Classement ${sportConfig.name} API erreur:`, standingsError);
          }
        }
        
      } catch (error) {
        console.error(`Erreur lors du chargement ${sportConfig.name}:`, error);
      } finally {
        // Désactiver le loading après le premier chargement seulement
        if (loading) {
          setLoading(false);
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Vérifier toutes les 10 secondes
    return () => clearInterval(interval);
  }, [matchTimeRange, firstLoad, loading, sportConfig]);

  if (loading) return <div className="loading"><h2>Chargement...</h2></div>;

  if (view === 'classement' && StandingsComponent) {
    return <StandingsComponent standingsData={standings} />;
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
        <Card 
          variant="sport" 
          title={`Aucun match ${sportConfig.name} aujourd'hui`} 
          subtitle="Revenez plus tard pour voir les prochains matchs." 
        />
      </div>
    );
  }

  return (
    <div className="games-grid">
      {data.events.map((game) => {
        const isLive = game.status.type.state === 'in';
        const isFinished = game.status.type.completed;
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
                {game.status.type.completed ? 
                  'FT' : 
                  game.status.type.state === 'in' ? 
                    `${sportConfig.formatPeriod(game.status.period)} - ${game.status.displayClock}` :
                    formatTime(game.date)}
              </span>
            </div>
            {renderGameLayout(game)}
          </Card>
        );
      })}
    </div>
  );
};

export default AmericanSportLeague;
