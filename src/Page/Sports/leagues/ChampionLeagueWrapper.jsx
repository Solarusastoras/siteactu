import React, { useState, useMemo } from 'react';
import TournamentWrapper from '../../../Common/components/TournamentWrapper';
import FootballLeagueContainer from '../../../Common/components/FootballLeagueContainer';
import championLeagueData from '../../../Data/Foot/dataChampionLeague.json';
import { championsLeagueConfig } from '../../../Common/data/footballLeaguesConfig';
import { leaguesConfig } from '../../../Common/data/leaguesConfig';

const ChampionLeagueWrapper = ({ view = 'matches' }) => {
  const [activeMode, setActiveMode] = useState('live'); // 'live' ou 'history'

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

  // Données de classement par défaut (sera remplacé par l'API)
  const defaultStandings = championLeagueData.currentChampionLeague.standings || [];

  return (
    <div className="champions-league-wrapper">
      {/* Sélecteur de mode */}
      <div className="mode-selector">
        <button 
          className={`mode-btn ${activeMode === 'live' ? 'active' : ''}`}
          onClick={() => setActiveMode('live')}
        >
          🔴 Matchs & Classement
        </button>
        <button 
          className={`mode-btn ${activeMode === 'history' ? 'active' : ''}`}
          onClick={() => setActiveMode('history')}
        >
          📜 Historique & Éditions
        </button>
      </div>

      {/* Mode Live : Matchs et classement en temps réel */}
      {activeMode === 'live' && (
        <FootballLeagueContainer 
          leagueConfig={{
            ...championsLeagueConfig,
            ...leaguesConfig.championsLeague
          }}
          standingsData={defaultStandings}
          view={view}
        />
      )}

      {/* Mode Historique : Éditions passées et statistiques */}
      {activeMode === 'history' && (
        <TournamentWrapper 
          title={config.title}
          subtitle={config.subtitle}
          icon={config.icon}
          data={championLeagueData}
          config={config}
        />
      )}
    </div>
  );
};

export default React.memo(ChampionLeagueWrapper);