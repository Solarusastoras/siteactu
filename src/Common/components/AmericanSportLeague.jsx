import React, { useState, useEffect } from 'react';
import Card from '../card';
import StandingsTable from './StandingsTable';

/**
 * Calcule et met à jour les standings à partir des résultats des matchs
 */
const calculateStandingsFromMatches = (events, baseStandings, sportKey) => {
  if (!events || events.length === 0 || !baseStandings || baseStandings.length === 0) {
    return baseStandings;
  }

  // Cloner les standings de base
  const updatedStandings = JSON.parse(JSON.stringify(baseStandings));
  
  // Filtrer uniquement les matchs terminés
  const completedMatches = events.filter(event => event.status?.completed === true);
  
  if (completedMatches.length === 0) {
    return baseStandings;
  }

  // Créer un map des équipes pour accès rapide
  const teamsMap = new Map();
  updatedStandings.forEach((conference, confIndex) => {
    conference.standings?.forEach((entry, teamIndex) => {
      // Gérer les différentes structures de données (NHL vs NBA/NFL)
      const teamId = entry.team?.id || entry.team?.abbreviation || entry.abbr || entry.team;
      const teamAbbr = entry.team?.abbreviation || entry.abbr;
      
      if (teamId) {
        teamsMap.set(teamId, { confIndex, teamIndex, entry });
      }
      // Ajouter aussi l'abréviation comme clé alternative
      if (teamAbbr && teamAbbr !== teamId) {
        teamsMap.set(teamAbbr, { confIndex, teamIndex, entry });
      }
    });
  });

  // Traiter chaque match terminé
  completedMatches.forEach(match => {
    const competition = match.competitions?.[0];
    if (!competition || !competition.competitors) return;

    const homeComp = competition.competitors.find(c => c.homeAway === 'home');
    const awayComp = competition.competitors.find(c => c.homeAway === 'away');
    
    if (!homeComp || !awayComp) return;

    const homeTeamId = homeComp.team?.id;
    const homeTeamAbbr = homeComp.team?.abbreviation;
    const awayTeamId = awayComp.team?.id;
    const awayTeamAbbr = awayComp.team?.abbreviation;
    const homeScore = parseInt(homeComp.score || 0);
    const awayScore = parseInt(awayComp.score || 0);

    // Essayer de trouver l'équipe par ID d'abord, puis par abréviation
    let homeTeamData = teamsMap.get(homeTeamId) || teamsMap.get(homeTeamAbbr);
    let awayTeamData = teamsMap.get(awayTeamId) || teamsMap.get(awayTeamAbbr);

    if (!homeTeamData || !awayTeamData) return;

    const homeEntry = updatedStandings[homeTeamData.confIndex].standings[homeTeamData.teamIndex];
    const awayEntry = updatedStandings[awayTeamData.confIndex].standings[awayTeamData.teamIndex];

    // Déterminer le vainqueur
    const homeWon = homeScore > awayScore;
    const awayWon = awayScore > homeScore;
    const tie = homeScore === awayScore;

    if (sportKey === 'nhl') {
      // NHL: vérifier si victoire en prolongation/fusillade
      const isOT = competition.notes?.some(note => 
        note.headline?.includes('OT') || note.headline?.includes('SO')
      ) || match.status?.type?.detail?.includes('OT') || match.status?.type?.detail?.includes('SO');
      
      if (homeEntry.stats) {
        if (homeWon) {
          homeEntry.stats.wins = (homeEntry.stats.wins || 0) + 1;
          homeEntry.stats.points = (homeEntry.stats.points || 0) + 2;
        } else {
          if (isOT) {
            homeEntry.stats.otLosses = (homeEntry.stats.otLosses || 0) + 1;
            homeEntry.stats.points = (homeEntry.stats.points || 0) + 1;
          } else {
            homeEntry.stats.losses = (homeEntry.stats.losses || 0) + 1;
          }
        }
        homeEntry.stats.gamesPlayed = (homeEntry.stats.gamesPlayed || 0) + 1;
      }

      if (awayEntry.stats) {
        if (awayWon) {
          awayEntry.stats.wins = (awayEntry.stats.wins || 0) + 1;
          awayEntry.stats.points = (awayEntry.stats.points || 0) + 2;
        } else {
          if (isOT) {
            awayEntry.stats.otLosses = (awayEntry.stats.otLosses || 0) + 1;
            awayEntry.stats.points = (awayEntry.stats.points || 0) + 1;
          } else {
            awayEntry.stats.losses = (awayEntry.stats.losses || 0) + 1;
          }
        }
        awayEntry.stats.gamesPlayed = (awayEntry.stats.gamesPlayed || 0) + 1;
      }
    } else if (sportKey === 'nba') {
      // NBA: simple victoires/défaites
      if (homeWon) {
        homeEntry.wins = (homeEntry.wins || 0) + 1;
      } else {
        homeEntry.losses = (homeEntry.losses || 0) + 1;
      }
      
      if (awayWon) {
        awayEntry.wins = (awayEntry.wins || 0) + 1;
      } else {
        awayEntry.losses = (awayEntry.losses || 0) + 1;
      }
      
      // Recalculer le pourcentage
      const calcPct = (entry) => {
        const total = (entry.wins || 0) + (entry.losses || 0);
        entry.pct = total > 0 ? entry.wins / total : 0;
      };
      calcPct(homeEntry);
      calcPct(awayEntry);
    } else if (sportKey === 'nfl') {
      // NFL: victoires/défaites/nuls
      if (tie) {
        homeEntry.ties = (homeEntry.ties || 0) + 1;
        awayEntry.ties = (awayEntry.ties || 0) + 1;
      } else if (homeWon) {
        homeEntry.wins = (homeEntry.wins || 0) + 1;
        awayEntry.losses = (awayEntry.losses || 0) + 1;
      } else {
        awayEntry.wins = (awayEntry.wins || 0) + 1;
        homeEntry.losses = (homeEntry.losses || 0) + 1;
      }
      
      // Recalculer le pourcentage
      const calcPct = (entry) => {
        const total = (entry.wins || 0) + (entry.losses || 0) + (entry.ties || 0);
        entry.pct = total > 0 ? ((entry.wins || 0) + (entry.ties || 0) * 0.5) / total : 0;
      };
      calcPct(homeEntry);
      calcPct(awayEntry);
    }
  });

  // Trier les standings
  updatedStandings.forEach(conference => {
    if (conference.standings) {
      conference.standings.sort((a, b) => {
        if (sportKey === 'nhl') {
          return (b.stats?.points || 0) - (a.stats?.points || 0);
        } else {
          return (b.pct || 0) - (a.pct || 0);
        }
      });
    }
  });

  return updatedStandings;
};

/**
 * Composant générique pour les sports américains (NBA, NFL, NHL)
 * Accède directement aux données depuis data.json
 */
const AmericanSportLeague = ({ 
  sportConfig,  // Configuration du sport (API, nom, emoji, etc.)
  view = 'matches',
  StandingsComponent // Composant de classement personnalisé (optionnel)
}) => {
  const sportKey = sportConfig.storageKey; // 'nba', 'nfl', 'nhl'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.PUBLIC_URL}/data/data.json`);
        const jsonData = await response.json();
        const sportData = jsonData.sports?.[sportKey];
        
        setData(sportData);
        setLoading(false);
      } catch (err) {
        console.error(`Erreur chargement ${sportConfig.name}:`, err);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [sportKey, sportConfig.name]);

  const events = data?.scoreboard?.events || [];
  let standings = data?.standings || [];

  // Si standings vides mais qu'on a une config avec defaultStandings, les utiliser
  if ((!standings || standings.length === 0) && sportConfig.defaultStandings) {
    standings = sportConfig.defaultStandings;
  }

  // Calculer les standings mis à jour à partir des résultats des matchs
  const updatedStandings = calculateStandingsFromMatches(events, standings, sportKey);

  if (loading) {
    return <div className="loading"><h2>Chargement {sportConfig.name}...</h2></div>;
  }

  if (!data) {
    return <div className="error-message"><h2>⚠️ Données {sportConfig.name} indisponibles</h2></div>;
  }

  if (view === 'classement') {
    // Utiliser le composant de classement personnalisé si fourni, sinon utiliser StandingsTable
    if (StandingsComponent) {
      return <StandingsComponent standingsData={updatedStandings} />;
    }
    return <StandingsTable standingsData={updatedStandings} sportType={sportKey} />;
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const renderGameLayout = (game) => {
    const homeTeam = game.competitions.homeTeam;
    const awayTeam = game.competitions.awayTeam;

    // L'API ESPN ne fournit pas les records dans les événements
    // Les records ne seront pas affichés sous les noms d'équipes

    return (
      <div className="match-inline">
        <div className="team-inline away">
          <img src={awayTeam.logo} alt={awayTeam.name} className="team-logo-inline" />
          <div className="team-details-inline">
            <h3>{awayTeam.shortName}</h3>
          </div>
          <div className="score-inline team-score">{awayTeam.score || '0'}</div>
        </div>
        
        <span className="vs-inline">vs</span>
        
        <div className="team-inline home">
          <div className="score-inline team-score">{homeTeam.score || '0'}</div>
          <div className="team-details-inline">
            <h3>{homeTeam.shortName}</h3>
          </div>
          <img src={homeTeam.logo} alt={homeTeam.name} className="team-logo-inline" />
        </div>
      </div>
    );
  };

  if (!events || events.length === 0) {
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
      {events.map((game) => {
        const isLive = game.status.type === 'STATUS_IN_PROGRESS';
        const isFinished = game.status.completed === true;
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
                {game.status.completed ? 
                  'FT' : 
                  isLive ? 
                    game.status.detail :
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
