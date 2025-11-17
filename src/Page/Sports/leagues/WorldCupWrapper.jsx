import React from 'react';
import TournamentWrapper from '../../../Common/components/TournamentWrapper';
import worldCupData from '../../../Data/Foot/dataworldcup.json';

const WorldCupWrapper = () => {
  const config = {
    className: 'world-cup-main',
    tournamentLabel: 'Coupe du Monde',
    tournamentName: 'La Coupe du Monde de la FIFA',
    multipleHosts: true,
    dataKeys: {
      current: 'currentWorldCup',
      past: 'pastWorldCups'
    },
    renderStats: (statistics, pastWorldCups) => (
      <div className="stats-section">
        <h2>📊 Statistiques</h2>

        <div className="stats-highlight">
          <div className="highlight-card">
            <div className="highlight-icon">👑</div>
            <h3>Nation la plus titrée</h3>
            <div className="highlight-value">{statistics.mostWins.team}</div>
            <div className="highlight-desc">
              {statistics.mostWins.wins} victoires
            </div>
            <div className="highlight-years">
              {statistics.mostWins.years.join(' • ')}
            </div>
          </div>
        </div>

        <div className="fun-facts">
          <div className="fact-card">
            <h3>🏆 Champions récents</h3>
            <div className="fact-list">
              {statistics.recentChampions.map((champion, idx) => (
                <div key={idx} className="fact-item">
                  <span className="fact-icon">🥇</span>
                  <span className="fact-text">{champion}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="fact-card">
            <h3>⚽ Records</h3>
            <div className="fact-list">
              <div className="fact-item">
                <span className="fact-icon">🎯</span>
                <span className="fact-label">Plus de buts (joueur):</span>
                <span className="fact-value">16 buts (Miroslav Klose)</span>
              </div>
              <div className="fact-item">
                <span className="fact-icon">🏃</span>
                <span className="fact-label">Plus de matchs:</span>
                <span className="fact-value">25 matchs (Lionel Messi)</span>
              </div>
              <div className="fact-item">
                <span className="fact-icon">👥</span>
                <span className="fact-label">Plus grande affluence:</span>
                <span className="fact-value">173,850 (1950, Maracanã)</span>
              </div>
            </div>
          </div>

          <div className="fact-card">
            <h3>📈 Évolution</h3>
            <div className="fact-list">
              <div className="fact-item">
                <span className="fact-icon">📅</span>
                <span className="fact-label">Première édition:</span>
                <span className="fact-value">1930 (Uruguay)</span>
              </div>
              <div className="fact-item">
                <span className="fact-icon">🔢</span>
                <span className="fact-label">Nombre d'éditions:</span>
                <span className="fact-value">{pastWorldCups.length + 1}</span>
              </div>
              <div className="fact-item">
                <span className="fact-icon">⚽</span>
                <span className="fact-label">Format actuel:</span>
                <span className="fact-value">32 équipes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  };

  return (
    <TournamentWrapper
      title="Coupe du Monde de la FIFA"
      subtitle="Le plus grand tournoi de football au monde"
      icon="🏆"
      data={worldCupData}
      config={config}
    />
  );
};

export default WorldCupWrapper;
