import React from 'react';

const KnockoutRound = ({ title, matches, isFinal = false }) => {
  if (!matches || matches.length === 0) return null;

  const renderMatch = (match, idx) => {
    // Si c'est un objet avec team1/team2 (format WorldCup)
    if (match.team1 && match.team2) {
      return (
        <div key={idx} className={`match-card ${isFinal ? 'final-card' : ''}`}>
          <div className="match-teams">
            <span className={match.winner === match.team1 ? 'winner' : ''}>{match.team1}</span>
            <span className="vs">vs</span>
            <span className={match.winner === match.team2 ? 'winner' : ''}>{match.team2}</span>
          </div>
          <div className="match-score">{match.score}</div>
        </div>
      );
    }
    
    // Si c'est une chaîne de caractères (format AfricNationCup)
    return (
      <div key={idx} className={`match-card ${isFinal ? 'final-card' : ''}`}>
        <div className="match-score">{match}</div>
      </div>
    );
  };

  return (
    <div className={`round-section ${isFinal ? 'final-round' : ''}`}>
      <h5>{title}</h5>
      <div className="matches-list">
        {Array.isArray(matches) 
          ? matches.map((match, idx) => renderMatch(match, idx))
          : renderMatch(matches, 0)
        }
      </div>
    </div>
  );
};

export default KnockoutRound;
