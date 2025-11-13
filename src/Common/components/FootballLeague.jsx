import React from 'react';

/**
 * Composant générique pour afficher une ligue de football
 * Gère à la fois l'affichage des matchs et du classement
 */
const FootballLeague = ({ 
  leagueData,
  weekendMatches,
  upcomingMatches,
  standingsData, 
  leagueConfig, 
  view = 'matches' 
}) => {
  
  // Dictionnaire des abréviations pour la Ligue 1
  const teamAbbreviationsLigue1 = {
    'Paris Saint-Germain': 'PSG',
    'Marseille': 'OM',
    'Lyon': 'OL',
    'Monaco': 'ASM',
    'Lille': 'LOSC',
    'Nice': 'OGC Nice',
    'Lens': 'RC Lens',
    'Strasbourg': 'RC Strasbourg',
    'Montpellier': 'MHSC',
    'Nantes': 'FC Nantes',
    'Toulouse': 'TFC',
    'Reims': 'Stade de Reims',
    'Brest': 'Stade Brestois',
    'Lorient': 'FC Lorient',
    'Le Havre': 'Le Havre AC',
    'Clermont Foot': 'Clermont',
    'Auxerre': 'AJ Auxerre',
    'Angers': 'SCO Angers',
    'Metz': 'FC Metz',
    'Saint-Étienne': 'ASSE'
  };

  // Dictionnaire des abréviations pour la Ligue 2
  const teamAbbreviationsLigue2 = {
    'Paris FC': 'Paris FC',
    'Lorient': 'FC Lorient',
    'Dunkerque': 'USL Dunkerque',
    'Metz': 'FC Metz',
    'Laval': 'Stade Lavallois',
    'Guingamp': 'EA Guingamp',
    'Amiens': 'Amiens SC',
    'Annecy': 'FC Annecy',
    'Grenoble': 'Grenoble Foot 38',
    'Ajaccio': 'AC Ajaccio',
    'Pau': 'Pau FC',
    'Caen': 'SM Caen',
    'Bastia': 'SC Bastia',
    'Clermont Foot': 'Clermont Foot',
    'Rodez': 'Rodez AF',
    'Troyes': 'ES Troyes AC',
    'Red Star': 'Red Star FC',
    'Martigues': 'FC Martigues',
    'Boulogne-sur-Mer': 'US Boulogne'
  };

  // Dictionnaire des logos de secours (locaux)
  const fallbackLogos = {
    'Boulogne-sur-Mer': '/boulogne_mer.png',
    'US Boulogne': '/boulogne_mer.png'
  };

  // Fonction pour obtenir l'abréviation d'une équipe
  const getTeamAbbreviation = (teamName) => {
    // Vérifier d'abord Ligue 1, puis Ligue 2
    return teamAbbreviationsLigue1[teamName] || teamAbbreviationsLigue2[teamName] || teamName;
  };

  // Fonction pour obtenir le logo (API ou local)
  const getTeamLogo = (teamName, apiLogo) => {
    // Vérifier si le logo API est valide (non vide et non transparent)
    const hasValidApiLogo = apiLogo && apiLogo.trim() !== '' && !apiLogo.includes('transparent');
    
    // Chercher un logo local de secours
    const fallbackLogo = fallbackLogos[teamName] || fallbackLogos[getTeamAbbreviation(teamName)];
    
    // Si on a un logo de secours pour cette équipe, l'utiliser en priorité
    if (fallbackLogo) {
      console.log(`🔄 Utilisation logo local pour ${teamName}: ${fallbackLogo}`);
      return fallbackLogo;
    }
    
    // Sinon utiliser le logo de l'API s'il est valide
    if (hasValidApiLogo) {
      return apiLogo;
    }
    
    return null;
  };
  
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
    // Utiliser weekendMatches si disponible, sinon leagueData
    const matchesToDisplay = weekendMatches && weekendMatches.length > 0 ? weekendMatches : leagueData?.events || [];
    
    if (matchesToDisplay.length === 0) {
      return (
        <div className="games-grid">
          <div className="game-card">
            <p>Aucun match {leagueConfig.name} ce week-end</p>
          </div>
        </div>
      );
    }

    return (
      <div className="games-grid">
        {matchesToDisplay.map((game) => {
          const competitors = game.competitions[0].competitors;
          const homeTeam = competitors.find(team => team.homeAway === 'home');
          const awayTeam = competitors.find(team => team.homeAway === 'away');
          
          // Log pour déboguer les logos
          console.log('Match:', homeTeam.team.displayName, 'vs', awayTeam.team.displayName);
          console.log('Logo domicile:', homeTeam.team.logo);
          console.log('Logo extérieur:', awayTeam.team.logo);
          
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
                  <div className="logo-container">
                    {getTeamLogo(homeTeam.team.displayName, homeTeam.team.logo) && (
                      <img 
                        src={getTeamLogo(homeTeam.team.displayName, homeTeam.team.logo)} 
                        alt={homeTeam.team.displayName}
                        onError={(e) => { 
                          console.log(`Erreur chargement logo: ${homeTeam.team.displayName}`, getTeamLogo(homeTeam.team.displayName, homeTeam.team.logo));
                          e.target.style.display = 'none'; 
                        }}
                        onLoad={() => console.log(`Logo chargé: ${homeTeam.team.displayName}`)}
                      />
                    )}
                  </div>
                  <div className="team-details-inline">
                    <h3>{getTeamAbbreviation(homeTeam.team.displayName)}</h3>
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
                    <h3>{getTeamAbbreviation(awayTeam.team.displayName)}</h3>
                    {awayTeam.records && awayTeam.records[0] && (
                      <div className="team-record-inline">
                        <small>{awayTeam.records[0].summary}</small>
                      </div>
                    )}  
                  </div>
                  <div className="logo-container">
                    {getTeamLogo(awayTeam.team.displayName, awayTeam.team.logo) && (
                      <img 
                        src={getTeamLogo(awayTeam.team.displayName, awayTeam.team.logo)} 
                        alt={awayTeam.team.displayName}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ========================================
  // GESTION DES MATCHS À VENIR
  // ========================================
  
  const renderUpcomingMatches = () => {
    // Utiliser upcomingMatches (semaine suivante) si disponible
    const matchesToShow = upcomingMatches && upcomingMatches.length > 0 ? upcomingMatches : [];
    
    if (matchesToShow.length === 0) {
      return (
        <div className="games-grid">
          <div className="game-card">
            <p>Aucun match à venir pour {leagueConfig.name}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="games-grid">
        {matchesToShow.map((game) => {
          const competitors = game.competitions[0].competitors;
          const homeTeam = competitors.find(team => team.homeAway === 'home');
          const awayTeam = competitors.find(team => team.homeAway === 'away');

          return (
            <div key={game.id} className="game-card">
              <div className="game-header">
                <span className="game-status pre">
                  À venir
                </span>
                <span className="game-time">
                  {formatTime(game.date)}
                </span>
              </div>
              
              <div className="match-inline">
                <div className="team-inline home">
                  <div className="logo-container">
                    {getTeamLogo(homeTeam.team.displayName, homeTeam.team.logo) && (
                      <img 
                        src={getTeamLogo(homeTeam.team.displayName, homeTeam.team.logo)} 
                        alt={homeTeam.team.displayName}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                  </div>
                  <div className="team-details-inline">
                    <h3>{getTeamAbbreviation(homeTeam.team.displayName)}</h3>
                    {homeTeam.records && homeTeam.records[0] && (
                      <div className="team-record-inline">
                        <small>{homeTeam.records[0].summary}</small>
                      </div>
                    )}
                  </div>
                </div>
                
                <span className="vs-inline">VS</span>
                
                <div className="team-inline away">
                  <div className="team-details-inline">
                    <h3>{getTeamAbbreviation(awayTeam.team.displayName)}</h3>
                    {awayTeam.records && awayTeam.records[0] && (
                      <div className="team-record-inline">
                        <small>{awayTeam.records[0].summary}</small>
                      </div>
                    )}  </div>
                  <div className="logo-container">
                    {getTeamLogo(awayTeam.team.displayName, awayTeam.team.logo) && (
                      <img 
                        src={getTeamLogo(awayTeam.team.displayName, awayTeam.team.logo)} 
                        alt={awayTeam.team.displayName}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                  </div>
                </div>
              </div>

              {game.competitions[0].venue && (
                <div className="venue">
                  <small>📍 {game.competitions[0].venue.fullName}</small>
                </div>
              )}
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
    const date = new Date(dateString);
    const dayOfWeek = date.toLocaleDateString('fr-FR', { weekday: 'long' });
    const dayMonth = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    const time = date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)} ${dayMonth} - ${time}`;
  };

  // ========================================
  // RENDU
  // ========================================
  
  if (view === 'classement') return renderStandings();
  if (view === 'avenir') return renderUpcomingMatches();
  return renderMatches();
};

export default FootballLeague;
