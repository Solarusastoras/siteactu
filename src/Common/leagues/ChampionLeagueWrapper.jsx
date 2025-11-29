import React, { useState, useEffect, useMemo } from 'react';
import TournamentWrapper from '../components/TournamentWrapper';
import championLeagueData from '../../Data/Foot/dataChampionLeague.json';
import { championsLeagueConfig } from '../data/leaguesConfig';
import FootballStandings from '../components/FootballStandings';
import { formatTime, getMatchStatus } from './matchHelpers';
import './foot.scss';

const ChampionLeagueWrapper = ({ view = 'matches' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Si view='editions', afficher directement l'historique, sinon afficher live
  const activeMode = view === 'editions' ? 'history' : 'live';

  useEffect(() => {
    if (activeMode === 'live') {
      const fetchData = async () => {
        try {
          const response = await fetch('/actu/data/data.json');
          const jsonData = await response.json();
          const clData = jsonData.sports?.championsleague;
          
          setData(clData);
          setLoading(false);
        } catch (err) {
          console.error('Erreur chargement Champions League:', err);
          setLoading(false);
        }
      };

      fetchData();
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [activeMode]);

  const config = useMemo(() => ({
    title: 'UEFA Champions League',
    subtitle: 'La plus prestigieuse compétition européenne de clubs',
    icon: '🏆',
    className: 'champion-league',
    tournamentLabel: 'Saison',
    tournamentName: 'La Ligue des Champions',
    multipleHosts: false,
    hideThirdPlace: true,
    dataKeys: {
      current: 'currentChampionLeague',
      past: 'pastChampionLeagues'
    },
    renderStats: (statistics, pastTournaments) => (
      <div className="stats-section">
        <h2>📊 Statistiques</h2>
        <div className="stats-grid">
          <div className="stat-card highlight">
            <h3>🏆 Plus de victoires</h3>
            <div className="stat-value">{statistics.mostWins.team}</div>
            <div className="stat-detail">{statistics.mostWins.wins} titres</div>
          </div>
          <div className="stat-card">
            <h3>🎯 Champions récents</h3>
            <ul className="recent-champions-list">
              {statistics.recentChampions.map((champion, idx) => (
                <li key={idx}>{champion}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  }), []);

  // Mode Historique
  if (activeMode === 'history') {
    return (
      <div className="champions-league-wrapper">
        <TournamentWrapper 
          title={config.title}
          subtitle={config.subtitle}
          icon={config.icon}
          data={championLeagueData}
          config={config}
        />
      </div>
    );
  }

  // Mode Live
  if (loading) {
    return <div className="loading"><h2>Chargement Champions League...</h2></div>;
  }

  if (!data) {
    return <div className="error-message"><h2>⚠️ Données indisponibles</h2></div>;
  }

  // Support des deux formats de données
  const allMatches = data.matches 
    ? [...(data.matches.completed || []), ...(data.matches.live || []), ...(data.matches.upcoming || [])]
    : (data.scoreboard?.events || []);
  
  const standings = data.standings || [];

  // Fonction pour obtenir les matchs de la dernière journée ou les prochains matchs
  const getRecentOrUpcomingMatches = (matches) => {
    if (matches.length === 0) return [];

    const now = new Date();
    
    // Trier les matchs par date
    const sortedMatches = [...matches].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    // Trouver les matchs futurs
    const upcomingMatches = sortedMatches.filter(m => new Date(m.date) > now);
    
    // S'il y a des matchs à venir, afficher les 10 prochains
    if (upcomingMatches.length > 0) {
      return upcomingMatches.slice(0, 10);
    }

    // Sinon, afficher les 10 derniers matchs terminés
    const completedMatches = sortedMatches.filter(m => 
      m.competitions?.[0]?.status?.type?.completed || 
      new Date(m.date) <= now
    );
    
    return completedMatches.slice(-10);
  };

  const matches = getRecentOrUpcomingMatches(allMatches);

  // Vue Matchs
  if (view === 'matches') {
    return (
      <div className="football-league">
        <div className="league-header">
          <h2>{championsLeagueConfig.icon} {championsLeagueConfig.name}</h2>
        </div>

        <div className="games-grid">
          {matches.length === 0 ? (
            <div className="game-card">
              <p>Aucun match Champions League disponible</p>
            </div>
          ) : (
            matches.map((game) => {
              const competition = game.competitions?.[0];
              if (!competition || !competition.competitors) return null;

              const homeComp = competition.competitors.find(c => c.homeAway === 'home');
              const awayComp = competition.competitors.find(c => c.homeAway === 'away');
              
              if (!homeComp || !awayComp) return null;

              const homeLogo = homeComp.team?.logo || homeComp.team?.logos?.[0]?.href;
              const awayLogo = awayComp.team?.logo || awayComp.team?.logos?.[0]?.href;
              const homeName = homeComp.team?.displayName || homeComp.team?.name || 'Équipe';
              const awayName = awayComp.team?.displayName || awayComp.team?.name || 'Équipe';
              const homeScore = homeComp.score || '0';
              const awayScore = awayComp.score || '0';
              const clock = competition.status?.displayClock || game.status?.displayClock || '';
              const isLive = competition.status?.type?.state === 'in' || game.status?.type?.state === 'in';
              const matchStatus = getMatchStatus(game, formatTime);

              return (
                <div key={game.id} className="game-card">
                  <div className="game-header">
                    <span className="game-time">
                      {matchStatus.time}
                    </span>
                    <span className={`match-status-badge ${matchStatus.className}`}>
                      {matchStatus.label}
                    </span>
                  </div>

                  <div className="match-inline">
                    <div className="team-inline home">
                      {homeLogo && (
                        <img 
                          src={homeLogo} 
                          alt={homeName}
                          className="team-logo-inline"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <div className="team-details-inline">
                        <h3>{homeName}</h3>
                      </div>
                    </div>

                    <div className="score-inline team-score">{homeScore}</div>

                    <div className="vs-section">
                      {isLive && clock && <div className="period-indicator">{clock}</div>}
                      <span className="vs-inline">vs</span>
                    </div>

                    <div className="score-inline team-score">{awayScore}</div>

                    <div className="team-inline away">
                      <div className="team-details-inline">
                        <h3>{awayName}</h3>
                      </div>
                      {awayLogo && (
                        <img 
                          src={awayLogo} 
                          alt={awayName}
                          className="team-logo-inline"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                    </div>
                  </div>

                  {competition.venue?.fullName && (
                    <div className="game-venue">📍 {competition.venue.fullName}</div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // Vue Classement
  if (view === 'classement') {
    return (
      <FootballStandings 
        standings={standings} 
        leagueName={championsLeagueConfig.name}
        config={championsLeagueConfig}
      />
    );
  }

  return null;
};

export default React.memo(ChampionLeagueWrapper);