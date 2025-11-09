import React from 'react';

/**
 * Composant générique pour afficher une ligue de football
 * Gère à la fois l'affichage des matchs et du classement
 */
const FootballLeague = ({ 
  leagueData, 
  standingsData, 
  leagueConfig, 
  view = 'matches' 
}) => {
  
  // Vérifications de sécurité
  if (!leagueConfig) {
    return <div className="error-message">Configuration de la ligue manquante</div>;
  }
  
  if (view === 'classement' && !standingsData) {
    return <div className="error-message">Données de classement manquantes</div>;
  }
  
  // ========================================
  // GESTION DU CLASSEMENT
  // ========================================
  
  const renderStandings = () => {
    // Créer une copie profonde et indépendante de standingsData
    const baseStandings = JSON.parse(JSON.stringify(standingsData)).map(team => ({
      team: { 
        id: team.team.toLowerCase().replace(/\s+/g, '-'),
        displayName: team.team,
        name: team.team
      },
      played: team.played,
      wins: team.wins,
      draws: team.draws,
      losses: team.losses,
      goalsFor: team.goalsFor,
      goalsAgainst: team.goalsAgainst,
      goalDifference: team.goalsFor - team.goalsAgainst,
      calculatedPoints: team.points
    }));

    // Mettre à jour avec les matchs terminés
    if (leagueData?.events) {
      leagueData.events.forEach(event => {
        const competition = event.competitions[0];
        const status = event.status.type.name;
        
        // Ne traiter que les matchs terminés (STATUS_FINAL)
        if (status === 'STATUS_FINAL') {
          const homeTeam = competition.competitors.find(c => c.homeAway === 'home');
          const awayTeam = competition.competitors.find(c => c.homeAway === 'away');
          
          if (homeTeam && awayTeam) {
            const homeScore = parseInt(homeTeam.score) || 0;
            const awayScore = parseInt(awayTeam.score) || 0;
            
            // Trouver les équipes dans le classement
            const homeEntry = baseStandings.find(s => 
              s.team.displayName.toLowerCase().includes(homeTeam.team.displayName.toLowerCase()) ||
              homeTeam.team.displayName.toLowerCase().includes(s.team.displayName.toLowerCase())
            );
            const awayEntry = baseStandings.find(s => 
              s.team.displayName.toLowerCase().includes(awayTeam.team.displayName.toLowerCase()) ||
              awayTeam.team.displayName.toLowerCase().includes(s.team.displayName.toLowerCase())
            );
            
            if (homeEntry && awayEntry) {
              // Mise à jour des statistiques
              homeEntry.played += 1;
              awayEntry.played += 1;
              homeEntry.goalsFor += homeScore;
              homeEntry.goalsAgainst += awayScore;
              awayEntry.goalsFor += awayScore;
              awayEntry.goalsAgainst += homeScore;
              
              // Attribution des points
              if (homeScore > awayScore) {
                homeEntry.wins += 1;
                homeEntry.calculatedPoints += 3;
                awayEntry.losses += 1;
              } else if (homeScore < awayScore) {
                awayEntry.wins += 1;
                awayEntry.calculatedPoints += 3;
                homeEntry.losses += 1;
              } else {
                homeEntry.draws += 1;
                awayEntry.draws += 1;
                homeEntry.calculatedPoints += 1;
                awayEntry.calculatedPoints += 1;
              }
              
              homeEntry.goalDifference = homeEntry.goalsFor - homeEntry.goalsAgainst;
              awayEntry.goalDifference = awayEntry.goalsFor - awayEntry.goalsAgainst;
            }
          }
        }
      });
    }

    // Trier le classement
    const sortedStandings = baseStandings.sort((a, b) => {
      if (b.calculatedPoints !== a.calculatedPoints) {
        return b.calculatedPoints - a.calculatedPoints;
      }
      if (b.goalDifference !== a.goalDifference) {
        return b.goalDifference - a.goalDifference;
      }
      return b.goalsFor - a.goalsFor;
    });

    return (
      <div className="standings-container">
        <h2>{leagueConfig.icon} {leagueConfig.name}</h2>
        <div className="standings-table">
          <div className="standings-header">
            <div>Pos</div>
            <div>Équipe</div>
            <div>MJ</div>
            <div>Pts</div>
            <div>V</div>
            <div>N</div>
            <div>D</div>
            <div>+/-</div>
            <div>Buts</div>
          </div>
          {sortedStandings.map((entry, index) => {
            const position = index + 1;
            const positionClass = getPositionClass(position);
            
            return (
              <div key={entry.team.id} className={`standings-row ${positionClass}`}>
                <div className="position">{position}</div>
                <div className="team-info">
                  <span className="team-name">{entry.team.displayName}</span>
                </div>
                <div className="matches">{entry.played}</div>
                <div className="points">{entry.calculatedPoints}</div>
                <div className="wins">{entry.wins}</div>
                <div className="draws">{entry.draws}</div>
                <div className="losses">{entry.losses}</div>
                <div className="goals">{entry.goalDifference > 0 ? '+' : ''}{entry.goalDifference}</div>
                <div className="goals">{entry.goalsFor}:{entry.goalsAgainst}</div>
              </div>
            );
          })}
        </div>
        <div className="standings-legend">
          {leagueConfig.legend.map((item, index) => (
            <div key={index} className={`legend-item ${item.class}`}>
              {item.icon} {item.label}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ========================================
  // GESTION DES MATCHS
  // ========================================
  
  const renderMatches = () => {
    if (!leagueData?.events || leagueData.events.length === 0) {
      return (
        <div className="games-grid">
          <div className="game-card">
            <p>Aucun match {leagueConfig.name} aujourd'hui</p>
          </div>
        </div>
      );
    }

    return (
      <div className="games-grid">
        {leagueData.events.map((game) => {
          const competitors = game.competitions[0].competitors;
          const homeTeam = competitors.find(team => team.homeAway === 'home');
          const awayTeam = competitors.find(team => team.homeAway === 'away');
          
          const getMatchStatus = () => {
            if (game.status.type.completed) return 'TERMINÉ';
            if (game.status.type.state === 'in') return 'EN COURS';
            return formatTime(game.date);
          };

          return (
            <div key={game.id} className="game-card">
              <div className="game-header">
                <span className={`game-status ${game.status.type.state.toLowerCase()}`}>
                  {game.status.type.description}
                </span>
                <span className="game-time">
                  {game.status.type.completed ? 
                    'Terminé' : 
                    game.status.type.state === 'in' ? 
                      `${game.status.displayClock} ${game.status.period ? `- ${game.status.period}'` : ''}` :
                      formatTime(game.date)
                  }
                </span>
              </div>
              
              <div className="match-inline" data-status={getMatchStatus()}>
                <div className="team-inline home">
                  <img 
                    src={homeTeam.team.logo} 
                    alt={homeTeam.team.displayName}
                    className="team-logo-inline"
                  />
                  <div className="team-details-inline">
                    <h3>{homeTeam.team.displayName}</h3>
                    {homeTeam.records && homeTeam.records[0] && (
                      <div className="team-record-inline">
                        <small>{homeTeam.records[0].summary}</small>
                      </div>
                    )}
                  </div>
                  <div className="score-inline team-score">
                    {homeTeam.score || '0'}
                  </div>
                </div>
                
                <span className="vs-inline">vs</span>
                
                <div className="team-inline away">
                  <div className="score-inline team-score">
                    {awayTeam.score || '0'}
                  </div>
                  <div className="team-details-inline">
                    <h3>{awayTeam.team.displayName}</h3>
                    {awayTeam.records && awayTeam.records[0] && (
                      <div className="team-record-inline">
                        <small>{awayTeam.records[0].summary}</small>
                      </div>
                    )}
                  </div>
                  <img 
                    src={awayTeam.team.logo} 
                    alt={awayTeam.team.displayName}
                    className="team-logo-inline"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ========================================
  // UTILITAIRES
  // ========================================
  
  const getPositionClass = (position) => {
    if (!leagueConfig?.positionRules) return '';
    
    for (const rule of leagueConfig.positionRules) {
      if (rule.positions?.includes(position) || 
          (rule.range && position >= rule.range[0] && position <= rule.range[1])) {
        return rule.class;
      }
    }
    return '';
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ========================================
  // RENDU
  // ========================================
  
  return view === 'classement' ? renderStandings() : renderMatches();
};

export default FootballLeague;
