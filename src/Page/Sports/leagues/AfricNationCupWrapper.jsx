import React, { useMemo } from 'react';
import TournamentWrapper from '../../../Common/components/TournamentWrapper';
import africanCupData from '../../../Data/Foot/dataAfricNationCup.json';

const AfricNationCupWrapper = React.memo(() => {
  const config = useMemo(() => ({
    className: 'african-cup',
    tournamentLabel: 'CAN',
    tournamentName: 'La Coupe d\'Afrique des Nations',
    multipleHosts: false,
    dataKeys: {
      current: 'currentCAN',
      past: 'pastCANs'
    },
    renderStats: (statistics, pastCANs) => (
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
            <h3>📈 Évolution du tournoi</h3>
            <div className="fact-list">
              <div className="fact-item">
                <span className="fact-icon">📅</span>
                <span className="fact-label">Première édition:</span>
                <span className="fact-value">1957 (Soudan)</span>
              </div>
              <div className="fact-item">
                <span className="fact-icon">🔢</span>
                <span className="fact-label">Nombre d'éditions:</span>
                <span className="fact-value">{pastCANs.length + 1}</span>
              </div>
              <div className="fact-item">
                <span className="fact-icon">⚽</span>
                <span className="fact-label">Format actuel:</span>
                <span className="fact-value">24 équipes</span>
              </div>
            </div>
          </div>

          <div className="fact-card">
            <h3>🎯 Records</h3>
            <div className="fact-list">
              <div className="fact-item">
                <span className="fact-icon">🏆</span>
                <span className="fact-label">Plus de finales:</span>
                <span className="fact-value">🇪🇬 Égypte (10 finales)</span>
              </div>
              <div className="fact-item">
                <span className="fact-icon">👥</span>
                <span className="fact-label">Plus grande affluence:</span>
                <span className="fact-value">85,000 (2013, FNB Stadium)</span>
              </div>
              <div className="fact-item">
                <span className="fact-icon">⚽</span>
                <span className="fact-label">Plus de buts (édition):</span>
                <span className="fact-value">8 buts (V. Aboubakar, 2021)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }), []);

  return (
    <TournamentWrapper
      title="Coupe d'Afrique des Nations"
      subtitle="Le championnat d'Afrique de football"
      icon="🦁"
      data={africanCupData}
      config={config}
    />
  );
});

AfricNationCupWrapper.displayName = 'AfricNationCupWrapper';

export default AfricNationCupWrapper;
