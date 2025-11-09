import React, { useState, useEffect } from 'react';
import './Home.scss';

const Home = () => {
  const [nhlData, setNhlData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNHLData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setNhlData(data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération des données NHL:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNHLData();
    
    // Actualiser les données toutes les 5 minutes
    const interval = setInterval(fetchNHLData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading">
          <h2>Chargement des données NHL...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <div className="error">
          <h2>Erreur</h2>
          <p>Impossible de charger les données NHL: {error}</p>
          <button onClick={() => window.location.reload()}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>NHL Scoreboard</h1>
        {nhlData?.day && (
          <p className="date">{formatDate(nhlData.day.date)}</p>
        )}
      </header>

      <main className="games-container">
        {nhlData?.events && nhlData.events.length > 0 ? (
          <div className="games-grid">
            {nhlData.events.map((game) => (
              <div key={game.id} className="game-card">
                <div className="game-header">
                  <span className="game-status">{game.status.type.description}</span>
                  <span className="game-time">
                    {game.status.type.completed ? 
                      'Terminé' : 
                      formatTime(game.date)
                    }
                  </span>
                </div>
                
                <div className="teams">
                  {game.competitions[0].competitors.map((team, index) => (
                    <div key={team.id} className={`team ${team.homeAway}`}>
                      <div className="team-info">
                        <img 
                          src={team.team.logo} 
                          alt={team.team.displayName}
                          className="team-logo"
                        />
                        <div className="team-details">
                          <h3>{team.team.abbreviation}</h3>
                          <p>{team.team.displayName}</p>
                        </div>
                      </div>
                      <div className="score">
                        {team.score || '0'}
                      </div>
                    </div>
                  ))}
                </div>

                {game.competitions[0].venue && (
                  <div className="venue">
                    <small>{game.competitions[0].venue.fullName}</small>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-games">
            <h3>Aucun match aujourd'hui</h3>
            <p>Revenez plus tard pour voir les prochains matchs NHL.</p>
          </div>
        )}
      </main>

      <footer className="home-footer">
        <p>Données fournies par ESPN API</p>
        <small>Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}</small>
      </footer>
    </div>
  );
};

export default Home;
