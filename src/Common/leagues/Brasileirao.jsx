import React, { useState, useEffect } from 'react';
import { brasileiraoConfig } from '../data/leaguesConfig';
import FootballStandings from '../components/FootballStandings';
import { formatTime, getMatchStatus } from './matchHelpers';
import './foot.scss';

const Brasileirao = ({ view = 'matches' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/actu/data/data.json');
        const jsonData = await response.json();
        const brasileiraoData = jsonData.sports?.brasileirao;
        
        setData(brasileiraoData);
        setLoading(false);
      } catch (err) {
        console.error('Erreur chargement Brasileirão:', err);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="loading"><h2>Chargement Brasileirão...</h2></div>;
  }

  if (!data) {
    return <div className="error-message"><h2>⚠️ Données indisponibles</h2></div>;
  }

  // Support des deux formats de données
  const allMatches = data.matches 
    ? [...(data.matches.completed || []), ...(data.matches.live || []), ...(data.matches.upcoming || [])]
    : (data.scoreboard?.events || []);
  
  const matches = allMatches;
  const standings = data.standings || [];

  // Vue Matchs
  if (view === 'matches') {
    return (
      <div className="football-league">
        <div className="league-header">
          <h2>{brasileiraoConfig.icon} {brasileiraoConfig.name}</h2>
        </div>

        <div className="games-grid">
          {matches.length === 0 ? (
            <div className="game-card">
              <p>Aucun match Brasileirão disponible</p>
            </div>
          ) : (
            matches.map((game) => {
              const competition = game.competitions?.[0];
              if (!competition || !competition.competitors) return null;

              const homeComp = competition.competitors?.find(c => c.homeAway === 'home');
              const awayComp = competition.competitors?.find(c => c.homeAway === 'away');
              
              if (!homeComp || !awayComp) return null;

              const homeLogo = homeComp.team?.logo || homeComp.team?.logos?.[0]?.href;
              const awayLogo = awayComp.team?.logo || awayComp.team?.logos?.[0]?.href;
              const homeName = homeComp.team?.displayName || homeComp.team?.name || 'Équipe';
              const awayName = awayComp.team?.displayName || awayComp.team?.name || 'Équipe';
              const homeScore = homeComp.score || '0';
              const awayScore = awayComp.score || '0';
              const clock = competition.status?.displayClock || game.status?.displayClock || '';
              const isLive = game.status?.type?.state === 'in' || game.status?.type === 'STATUS_IN_PROGRESS';
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
        leagueName={brasileiraoConfig.name}
        config={brasileiraoConfig}
      />
    );
  }

  return null;
};

export default Brasileirao;
