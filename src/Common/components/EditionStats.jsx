import React from 'react';

const EditionStats = ({ topScorer, bestPlayer, venue }) => {
  return (
    <div className="edition-stats">
      {topScorer && (
        <div className="stat-item">
          <span className="stat-icon">⚽</span>
          <span className="stat-label">Meilleur buteur</span>
          <span className="stat-value">{topScorer}</span>
        </div>
      )}
      {bestPlayer && (
        <div className="stat-item">
          <span className="stat-icon">⭐</span>
          <span className="stat-label">Meilleur joueur</span>
          <span className="stat-value">{bestPlayer}</span>
        </div>
      )}
      {venue && (
        <div className="stat-item">
          <span className="stat-icon">🏟️</span>
          <span className="stat-label">Stade de la finale</span>
          <span className="stat-value">{venue}</span>
        </div>
      )}
    </div>
  );
};

export default EditionStats;
