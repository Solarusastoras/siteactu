import React, { useState, useEffect } from 'react';
import Card from '../card';
import NFLStandings from '../components/NFLStandings';
import { currentNFLStandings } from '../data/nflStandingsData';

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
  standings.forEach((conference, confIndex) => {
    conference.standings.forEach((team, teamIndex) => {
      teamsMap.set(team.abbr, { confIndex, teamIndex });
    });
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

    const homeTeamRef = teamsMap.get(homeAbbr);
    const awayTeamRef = teamsMap.get(awayAbbr);

    if (!homeTeamRef || !awayTeamRef) return;

    const homeTeam = standings[homeTeamRef.confIndex].standings[homeTeamRef.teamIndex];
    const awayTeam = standings[awayTeamRef.confIndex].standings[awayTeamRef.teamIndex];

    // Mise à jour des stats
    if (homeScore > awayScore) {
      homeTeam.wins++;
      awayTeam.losses++;
    } else if (awayScore > homeScore) {
      awayTeam.wins++;
      homeTeam.losses++;
    } else {
      homeTeam.ties = (homeTeam.ties || 0) + 1;
      awayTeam.ties = (awayTeam.ties || 0) + 1;
    }

    // Recalculer pourcentage et matchs joués
    const updateTeam = (team) => {
      team.gamesPlayed = team.wins + team.losses + (team.ties || 0);
      const total = team.gamesPlayed;
      team.pct = total > 0 ? (team.wins + (team.ties || 0) * 0.5) / total : 0;
    };

    updateTeam(homeTeam);
    updateTeam(awayTeam);
  });

  // Trier par pourcentage
  standings.forEach(conference => {
    conference.standings.sort((a, b) => b.pct - a.pct);
  });

  return standings;
};

const NFL = ({ view = 'matches' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.PUBLIC_URL}/data/data.json`);
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

  if (loading) {
    return <div className="loading"><h2>Chargement NFL...</h2></div>;
  }

  if (!data) {
    return <div className="error-message"><h2>⚠️ Données NFL indisponibles</h2></div>;
  }

  const events = data?.scoreboard?.events || [];

  if (view === 'classement') {
    // Calculer les standings mis à jour avec les matchs du scoreboard
    const updatedStandings = calculateStandings(events, currentNFLStandings);
    
    return <NFLStandings standingsData={updatedStandings} />;
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
