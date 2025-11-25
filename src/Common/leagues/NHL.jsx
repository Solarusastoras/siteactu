import React, { useState, useEffect } from 'react';
import Card from '../card';
import NHLStandings from '../components/NHLStandings';
import { currentNHLStandings } from '../data/nhlStandingsData';

/**
 * Calcule les standings à jour en fonction des résultats des matchs NHL
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

  // Créer une map des équipes par ID et abréviation
  const teamsMap = new Map();
  standings.forEach((conference, confIndex) => {
    conference.standings.forEach((team, teamIndex) => {
      const teamId = team.team?.id || team.team?.abbreviation;
      const teamAbbr = team.team?.abbreviation;
      if (teamId) teamsMap.set(teamId, { confIndex, teamIndex });
      if (teamAbbr) teamsMap.set(teamAbbr, { confIndex, teamIndex });
    });
  });

  // Traiter chaque match terminé
  completedMatches.forEach(match => {
    const competition = match.competitions?.[0];
    if (!competition?.competitors) return;

    const homeComp = competition.competitors.find(c => c.homeAway === 'home');
    const awayComp = competition.competitors.find(c => c.homeAway === 'away');
    
    if (!homeComp || !awayComp) return;

    const homeId = homeComp.team?.id;
    const homeAbbr = homeComp.team?.abbreviation;
    const awayId = awayComp.team?.id;
    const awayAbbr = awayComp.team?.abbreviation;
    const homeScore = parseInt(homeComp.score || 0);
    const awayScore = parseInt(awayComp.score || 0);

    const homeTeamRef = teamsMap.get(homeId) || teamsMap.get(homeAbbr);
    const awayTeamRef = teamsMap.get(awayId) || teamsMap.get(awayAbbr);

    if (!homeTeamRef || !awayTeamRef) return;

    const homeTeam = standings[homeTeamRef.confIndex].standings[homeTeamRef.teamIndex];
    const awayTeam = standings[awayTeamRef.confIndex].standings[awayTeamRef.teamIndex];

    if (!homeTeam.stats || !awayTeam.stats) return;

    // Vérifier si match en prolongation/fusillade
    const isOT = match.status?.type?.detail?.includes('OT') || 
                 match.status?.type?.detail?.includes('SO') ||
                 competition.notes?.some(note => 
                   note.headline?.includes('OT') || note.headline?.includes('SO')
                 );

    // Mise à jour des stats
    if (homeScore > awayScore) {
      // Victoire domicile
      homeTeam.stats.wins++;
      homeTeam.stats.points += 2;
      if (isOT) {
        awayTeam.stats.otLosses++;
        awayTeam.stats.points += 1;
      } else {
        awayTeam.stats.losses++;
      }
    } else if (awayScore > homeScore) {
      // Victoire visiteur
      awayTeam.stats.wins++;
      awayTeam.stats.points += 2;
      if (isOT) {
        homeTeam.stats.otLosses++;
        homeTeam.stats.points += 1;
      } else {
        homeTeam.stats.losses++;
      }
    }

    // Mettre à jour matchs joués
    homeTeam.stats.gamesPlayed++;
    awayTeam.stats.gamesPlayed++;
  });

  // Trier par points
  standings.forEach(conference => {
    conference.standings.sort((a, b) => (b.stats?.points || 0) - (a.stats?.points || 0));
  });

  return standings;
};

const NHL = ({ view = 'matches' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.PUBLIC_URL}/data/data.json`);
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

  const events = data?.scoreboard?.events || [];

  if (view === 'classement') {
    // Calculer les standings mis à jour avec les matchs du scoreboard
    const updatedStandings = calculateStandings(events, currentNHLStandings);
    
    return <NHLStandings standingsData={updatedStandings} />;
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
          title="Aucun match NHL aujourd'hui" 
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

export default NHL;
