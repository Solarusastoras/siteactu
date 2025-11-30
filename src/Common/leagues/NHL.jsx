import React, { useState, useEffect, useRef } from 'react';
import Card from '../card';
import NHLStandings from '../components/NHLStandings';
import { calculateNHLStandings } from '../../Utils/standingsCalculator';
import { formatTime, getMatchStatus } from './matchHelpers';

const NHL = ({ view = 'matches' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timeoutId;
    const fetchData = async () => {
      try {
        const response = await fetch('./data/nhl.json');
        const nhlData = await response.json();
        setData(nhlData);
        setLoading(false);
      } catch (err) {
        console.error('Erreur chargement NHL:', err);
        setLoading(false);
      }
    };

    // Calcule le temps (en ms) jusqu'à la prochaine exécution (8h ou 23h59min59s)
    const getNextUpdateDelay = () => {
      const now = new Date();
      const today8 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0, 0);
      const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 0);
      let next;
      if (now < today8) {
        next = today8;
      } else if (now < todayMidnight) {
        next = todayMidnight;
      } else {
        // Si après 23h59:59, prochaine maj à 8h le lendemain
        next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 8, 0, 0, 0);
      }
      return next - now;
    };

    const scheduleNextFetch = () => {
      const delay = getNextUpdateDelay();
      timeoutId = setTimeout(async () => {
        await fetchData();
        scheduleNextFetch();
      }, delay);
    };

    fetchData(); // Premier chargement immédiat
    scheduleNextFetch();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
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
  

  // Filtrer les matchs pour n'afficher que ceux du jour courant (00h00 à 23h59)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(today);
  start.setHours(0, 0, 0, 0); // 00h00 aujourd'hui
  const end = new Date(today);
  end.setHours(23, 59, 59, 999); // 23h59 aujourd'hui

  // Fonction utilitaire pour extraire la date de début d'un match
  function getMatchDate(game) {
    // ESPN/SoFaScore: game.date ou game.startDate ou game.competitions[0]?.date
    let dateStr = game.date || game.startDate || (game.competitions && game.competitions[0]?.date);
    if (!dateStr) return null;
    // Format ISO ou timestamp
    return new Date(dateStr);
  }

  // Fusionner et filtrer les matchs
  const allMatches = [
    ...(matches.completed || []),
    ...(matches.live || []),
    ...(matches.upcoming || []),
    ...events
  ].filter(game => {
    const matchDate = getMatchDate(game);
    if (!matchDate || isNaN(matchDate)) return false;
    // Si le match est en live, toujours afficher
    if (game.status?.type === 'STATUS_IN_PROGRESS') return true;
    // Afficher si le match commence entre 18h aujourd'hui et 8h demain
    return matchDate >= start && matchDate < end;
  });

  if (view === 'classement') {
    // Calculer les standings dynamiquement à partir des matchs
    const calculatedStandings = calculateNHLStandings(matches);
    
    return <NHLStandings standingsData={calculatedStandings} />;
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
          title="Aucun match NHL aujourd'hui" 
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

export default NHL;
