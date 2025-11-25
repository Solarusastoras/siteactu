import React, { useMemo } from 'react';
import TournamentWrapper from '../components/TournamentWrapper';
import europeCupData from '../../Data/Foot/dataEuropeCup.json';

const EuropeCupWrapper = React.memo(() => {
  const config = useMemo(() => ({
    className: 'euro-cup',
    tournamentLabel: 'EURO',
    tournamentName: "Le Championnat d'Europe de football",
    multipleHosts: true,
    dataKeys: {
      current: 'currentEuro',
      past: 'pastEuros'
    },
    renderStats: (statistics, pastEuros) => (
      <div className="stats-section">
        <h2>📊 Statistiques</h2>

        <div className="stats-highlight">
          <div className="highlight-card">
            <div className="highlight-icon">👑</div>
            <h3>Nations les plus titrées</h3>
            <div className="highlight-value">{statistics.mostWins.team}</div>
            <div className="highlight-desc">
              {statistics.mostWins.wins} victoires chacune
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
                <span className="fact-value">1960 (France)</span>
              </div>
              <div className="fact-item">
                <span className="fact-icon">🔢</span>
                <span className="fact-label">Nombre d'éditions:</span>
                <span className="fact-value">{pastEuros.length + 1}</span>
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
                <span className="fact-value">🇩🇪 Allemagne (6 finales)</span>
              </div>
              <div className="fact-item">
                <span className="fact-icon">⚽</span>
                <span className="fact-label">Plus de buts (édition):</span>
                <span className="fact-value">9 buts (M. Platini, 1984)</span>
              </div>
              <div className="fact-item">
                <span className="fact-icon">👥</span>
                <span className="fact-label">Plus grande affluence:</span>
                <span className="fact-value">85,000 (Italie 1968)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }), []);

  return (
    <TournamentWrapper
      title="Championnat d'Europe de football"
      subtitle="L'EURO - Le tournoi des nations européennes"
      icon="🏆"
      data={europeCupData}
      config={config}
    />
  );
});

EuropeCupWrapper.displayName = 'EuropeCupWrapper';

export default EuropeCupWrapper;
