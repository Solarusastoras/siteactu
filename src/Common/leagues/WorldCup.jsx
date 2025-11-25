import React from 'react';
import FootballLeague from '../components/FootballLeague';
import GroupStageTable from '../components/GroupStageTable';
import TournamentWrapper from '../components/TournamentWrapper';
import worldCupData from '../../Data/Foot/dataworldcup.json';
import { useSportsData } from '../../hooks/useDataAPI';
import { worldcupConfig as worldCupConfig } from '../data/leaguesConfig';
import './coupemonde.scss';

const WorldCup = ({ view = 'matches' }) => {
  const { sportData, loading, error } = useSportsData('worldcup');

  // Extraire les données du hook
  const data = sportData?.leagueData || null;
  const allWeekendMatches = sportData?.weekendMatches || [];
  const upcomingWeekendMatches = sportData?.upcomingMatches || [];
  const standings = sportData?.standings || [];
  const newsArticles = sportData?.news || [];

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

  // Vue Historique & Éditions
  if (view === 'editions') {
    return (
      <TournamentWrapper
        title="Coupe du Monde de la FIFA"
        subtitle="Le plus grand tournoi de football au monde"
        icon="🏆"
        data={worldCupData}
        config={config}
      />
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <h2>⚠️ Impossible de charger les données Coupe du Monde</h2>
        <p>{error}</p>
      </div>
    );
  }

  // Vue Actualités
  if (view === 'news') {
    return (
      <div className="world-cup-news">
        <div className="news-header">
          <h2>🏆 Actualités Coupe du Monde 2026</h2>
          <p>Les dernières informations sur les qualifications et la préparation du Mondial</p>
        </div>
        
        {loading ? (
          <div className="loading-message">
            <p>Chargement des actualités...</p>
          </div>
        ) : newsArticles && newsArticles.length > 0 ? (
          <div className="news-grid">
            {newsArticles.map((article, idx) => (
              <a 
                key={idx} 
                href={article.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="news-card"
              >
                {article.image && (
                  <div className="news-image">
                    <img src={article.image} alt={article.title} />
                  </div>
                )}
                <div className="news-content">
                  <h3 className="news-title">{article.title}</h3>
                  <p className="news-description">{article.description.substring(0, 150)}...</p>
                  <div className="news-footer">
                    <span className="news-date">
                      {new Date(article.pubDate).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="news-source">RMC Sport</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="no-data">
            <p>Aucune actualité disponible</p>
          </div>
        )}
      </div>
    );
  }

  // Vue Classement avec GroupStageTable
  if (view === 'classement') {
    if (!standings || standings.length === 0) {
      return (
        <div className="can-standings-wrapper">
          <div className="league-header">
            <h2>{worldCupConfig.emoji} {worldCupConfig.name}</h2>
            <p>Classement de la phase de groupes</p>
          </div>
          <div className="no-data">
            <p>⏳ En attente des données...</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="can-standings-wrapper">
        <div className="league-header">
          <h2>{worldCupConfig.emoji} {worldCupConfig.name}</h2>
          <p>Classement de la phase de groupes</p>
        </div>

        <div className="groups-grid">
          {standings.map((groupData, idx) => (
            <GroupStageTable 
              key={idx} 
              group={{
                name: groupData.name,
                standings: groupData.standings
              }} 
            />
          ))}
        </div>

        <div className="standings-legend">
          <div className="legend-item">
            <span className="legend-badge qualified-direct"></span>
            <span>Top 2 : Qualifiés pour les 1/8 de finale</span>
          </div>
          <div className="legend-item">
            <span className="legend-badge best-third"></span>
            <span>4 meilleurs 3èmes : Qualifiés pour les 1/8 de finale</span>
          </div>
        </div>
      </div>
    );
  }

  // Pour les matchs, utiliser FootballLeague
  return (
    <FootballLeague
      leagueData={data}
      weekendMatches={allWeekendMatches}
      upcomingMatches={upcomingWeekendMatches}
      standingsData={[]}
      leagueConfig={worldCupConfig}
      view={view}
    />
  );
};

export default WorldCup;
