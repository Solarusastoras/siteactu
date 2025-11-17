import React from 'react';

const EditionPodium = ({ winner, runnerUp, third }) => {
  return (
    <div className="edition-podium">
      <div className="podium-final">
        <div className="podium-item winner">
          <span className="medal">🥇</span>
          <span className="team">{winner}</span>
        </div>
        <div className="podium-item runner-up">
          <span className="medal">🥈</span>
          <span className="team">{runnerUp}</span>
        </div>
        <div className="podium-item third">
          <span className="medal">🥉</span>
          <span className="team">{third}</span>
        </div>
      </div>
    </div>
  );
};

export default EditionPodium;
