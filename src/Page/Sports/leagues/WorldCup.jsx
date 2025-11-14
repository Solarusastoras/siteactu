import React, { useState } from 'react';
import worldCupData from '../../../Data/Foot/dataworldcup.json';
import './WorldCup.scss';

const WorldCup = () => {
  const [activeTab, setActiveTab] = useState('current'); // current, winners, stats
  const [selectedEdition, setSelectedEdition] = useState(null);

  const { currentWorldCup, pastWorldCups, statistics, detailedEditions } = worldCupData;

  const getEditionDetails = (year) => {
    if (detailedEditions && detailedEditions[year]) {
      return detailedEditions[year];
    }
    return pastWorldCups.find(wc => wc.year === year);
  };

  return (
    <div className="world-cup">
      <div className="world-cup-header">
        <h1>🏆 Coupe du Monde de la FIFA</h1>
        <p className="subtitle">La plus grande compétition de football au monde</p>
      </div>

      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'current' ? 'active' : ''}`}
          onClick={() => setActiveTab('current')}
        >
          🔴 En cours (2026)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'winners' ? 'active' : ''}`}
          onClick={() => setActiveTab('winners')}
        >
          🏆 Vainqueurs
        </button>
        <button 
          className={`tab-btn ${activeTab === 'editions' ? 'active' : ''}`}
          onClick={() => setActiveTab('editions')}
        >
          📜 Éditions complètes
        </button>
        <button 
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Statistiques
        </button>
      </div>

      {activeTab === 'current' && (
        <div className="current-worldcup">
          <div className="current-header">
            <h2>Coupe du Monde {currentWorldCup.year}</h2>
            <div className="hosts">
              <span className="hosts-label">Pays hôtes :</span>
              {currentWorldCup.hosts.map((host, index) => (
                <span key={index} className="host-badge">{host}</span>
              ))}
            </div>
          </div>

          <div className="current-info-grid">
            <div className="info-card">
              <span className="info-icon">📅</span>
              <div className="info-content">
                <span className="info-label">Dates</span>
                <span className="info-value">
                  {new Date(currentWorldCup.startDate).toLocaleDateString('fr-FR')} - 
                  {new Date(currentWorldCup.endDate).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>

            <div className="info-card">
              <span className="info-icon">⚽</span>
              <div className="info-content">
                <span className="info-label">Équipes</span>
                <span className="info-value">{currentWorldCup.totalTeams} équipes</span>
              </div>
            </div>

            <div className="info-card">
              <span className="info-icon">🎯</span>
              <div className="info-content">
                <span className="info-label">Phase actuelle</span>
                <span className="info-value">{currentWorldCup.phase}</span>
              </div>
            </div>

            <div className="info-card">
              <span className="info-icon">📺</span>
              <div className="info-content">
                <span className="info-label">Matchs</span>
                <span className="info-value">
                  {currentWorldCup.matchesPlayed} / {currentWorldCup.totalMatches}
                </span>
              </div>
            </div>
          </div>

          <div className="status-banner">
            <span className="status-icon">🔴</span>
            <span className="status-text">Compétition en cours</span>
          </div>
        </div>
      )}

      {activeTab === 'winners' && (
        <div className="history-section">
          <h2>🏆 Tous les Vainqueurs</h2>
          <div className="history-grid">
            {pastWorldCups.map((wc) => (
              <div key={wc.year} className="history-card">
                <div className="history-year">{wc.year}</div>
                <div className="history-host">
                  <span className="host-icon">📍</span>
                  {wc.host}
                </div>

                <div className="podium">
                  <div className="podium-item winner">
                    <span className="medal">🥇</span>
                    <span className="team">{wc.winner}</span>
                    <span className="label">Champion</span>
                  </div>
                  <div className="podium-item runner-up">
                    <span className="medal">🥈</span>
                    <span className="team">{wc.runnerUp}</span>
                    <span className="label">Finaliste</span>
                  </div>
                  <div className="podium-item third">
                    <span className="medal">🥉</span>
                    <span className="team">{wc.third}</span>
                    <span className="label">3ème place</span>
                  </div>
                </div>

                <div className="match-details">
                  <div className="detail-row">
                    <span className="detail-icon">⚽</span>
                    <span className="detail-text">Score final : {wc.finalScore}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">👤</span>
                    <span className="detail-text">Meilleur joueur : {wc.bestPlayer}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">🎯</span>
                    <span className="detail-text">Meilleur buteur : {wc.topScorer}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">🏟️</span>
                    <span className="detail-text">{wc.venue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'editions' && (
        <div className="editions-section">
          <h2>📜 Éditions complètes - Phases de poules et Finales</h2>
          
          {selectedEdition ? (
            <div className="edition-detail">
              <button 
                className="back-btn"
                onClick={() => setSelectedEdition(null)}
              >
                ← Retour à la liste
              </button>
              
              <div className="edition-header">
                <h3>🏆 Coupe du Monde {selectedEdition.year}</h3>
                <p className="edition-host">📍 {selectedEdition.host}</p>
              </div>

              {selectedEdition.groupStage && (
                <div className="group-stage">
                  <h4>Phase de groupes</h4>
                  <div className="groups-grid">
                    {selectedEdition.groupStage.map((group, idx) => (
                      <div key={idx} className="group-card">
                        <h5>{group.name}</h5>
                        <div className="group-table">
                          <table>
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Équipe</th>
                                <th>J</th>
                                <th>V</th>
                                <th>N</th>
                                <th>D</th>
                                <th>BP</th>
                                <th>BC</th>
                                <th>Diff</th>
                                <th>Pts</th>
                              </tr>
                            </thead>
                            <tbody>
                              {group.standings.map((standing, teamIdx) => (
                                <tr key={teamIdx} className={standing.qualified ? 'qualified' : ''}>
                                  <td className="position">{teamIdx + 1}</td>
                                  <td className="team-name">{standing.team}</td>
                                  <td>{standing.played}</td>
                                  <td>{standing.won}</td>
                                  <td>{standing.drawn}</td>
                                  <td>{standing.lost}</td>
                                  <td>{standing.goalsFor}</td>
                                  <td>{standing.goalsAgainst}</td>
                                  <td className={standing.goalDiff > 0 ? 'positive' : standing.goalDiff < 0 ? 'negative' : ''}>
                                    {standing.goalDiff > 0 ? '+' : ''}{standing.goalDiff}
                                  </td>
                                  <td className="points">{standing.points}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="knockout-stage">
                <h4>Phase finale</h4>
                
                {selectedEdition.knockoutMatches && (
                  <div className="knockout-rounds">
                    {selectedEdition.knockoutMatches.roundOf16 && (
                      <div className="round-section">
                        <h5>Huitièmes de finale</h5>
                        <div className="matches-list">
                          {selectedEdition.knockoutMatches.roundOf16.map((match, idx) => (
                            <div key={idx} className="match-card">
                              <div className="match-teams">
                                <span className={match.winner === match.team1 ? 'winner' : ''}>{match.team1}</span>
                                <span className="vs">vs</span>
                                <span className={match.winner === match.team2 ? 'winner' : ''}>{match.team2}</span>
                              </div>
                              <div className="match-score">{match.score}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedEdition.knockoutMatches.quarterfinals && (
                      <div className="round-section">
                        <h5>Quarts de finale</h5>
                        <div className="matches-list">
                          {selectedEdition.knockoutMatches.quarterfinals.map((match, idx) => (
                            <div key={idx} className="match-card">
                              <div className="match-teams">
                                <span className={match.winner === match.team1 ? 'winner' : ''}>{match.team1}</span>
                                <span className="vs">vs</span>
                                <span className={match.winner === match.team2 ? 'winner' : ''}>{match.team2}</span>
                              </div>
                              <div className="match-score">{match.score}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedEdition.knockoutMatches.semifinals && (
                      <div className="round-section">
                        <h5>Demi-finales</h5>
                        <div className="matches-list">
                          {selectedEdition.knockoutMatches.semifinals.map((match, idx) => (
                            <div key={idx} className="match-card">
                              <div className="match-teams">
                                <span className={match.winner === match.team1 ? 'winner' : ''}>{match.team1}</span>
                                <span className="vs">vs</span>
                                <span className={match.winner === match.team2 ? 'winner' : ''}>{match.team2}</span>
                              </div>
                              <div className="match-score">{match.score}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedEdition.knockoutMatches.thirdPlace && (
                      <div className="round-section">
                        <h5>Match pour la 3ème place</h5>
                        <div className="matches-list">
                          <div className="match-card">
                            <div className="match-teams">
                              <span className={selectedEdition.knockoutMatches.thirdPlace.winner === selectedEdition.knockoutMatches.thirdPlace.team1 ? 'winner' : ''}>
                                {selectedEdition.knockoutMatches.thirdPlace.team1}
                              </span>
                              <span className="vs">vs</span>
                              <span className={selectedEdition.knockoutMatches.thirdPlace.winner === selectedEdition.knockoutMatches.thirdPlace.team2 ? 'winner' : ''}>
                                {selectedEdition.knockoutMatches.thirdPlace.team2}
                              </span>
                            </div>
                            <div className="match-score">{selectedEdition.knockoutMatches.thirdPlace.score}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedEdition.knockoutMatches.final && (
                      <div className="round-section final-round">
                        <h5>🏆 FINALE</h5>
                        <div className="matches-list">
                          <div className="match-card final-card">
                            <div className="match-teams">
                              <span className={selectedEdition.knockoutMatches.final.winner === selectedEdition.knockoutMatches.final.team1 ? 'winner' : ''}>
                                {selectedEdition.knockoutMatches.final.team1}
                              </span>
                              <span className="vs">vs</span>
                              <span className={selectedEdition.knockoutMatches.final.winner === selectedEdition.knockoutMatches.final.team2 ? 'winner' : ''}>
                                {selectedEdition.knockoutMatches.final.team2}
                              </span>
                            </div>
                            <div className="match-score">{selectedEdition.knockoutMatches.final.score}</div>
                            <div className="match-venue">📍 {selectedEdition.venue}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="edition-podium">
                  <div className="podium-final">
                    <div className="podium-item winner">
                      <span className="medal">🥇</span>
                      <span className="team">{selectedEdition.winner}</span>
                    </div>
                    <div className="podium-item runner-up">
                      <span className="medal">🥈</span>
                      <span className="team">{selectedEdition.runnerUp}</span>
                    </div>
                    <div className="podium-item third">
                      <span className="medal">🥉</span>
                      <span className="team">{selectedEdition.third}</span>
                    </div>
                  </div>
                </div>

                <div className="edition-stats">
                  <div className="stat-item">
                    <span className="stat-icon">🎯</span>
                    <span className="stat-label">Meilleur buteur:</span>
                    <span className="stat-value">{selectedEdition.topScorer}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">👤</span>
                    <span className="stat-label">Meilleur joueur:</span>
                    <span className="stat-value">{selectedEdition.bestPlayer}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="editions-list">
              <div className="editions-grid">
                {pastWorldCups.map((edition) => {
                  const hasDetails = detailedEditions && detailedEditions[edition.year];
                  return (
                    <div 
                      key={edition.year} 
                      className={`edition-card ${hasDetails ? 'has-details' : 'no-details'}`}
                      onClick={() => hasDetails ? setSelectedEdition(getEditionDetails(edition.year)) : null}
                    >
                      <div className="edition-year">{edition.year}</div>
                      <div className="edition-host-badge">📍 {edition.host}</div>
                      <div className="edition-winner">
                        <span className="winner-badge">🏆</span>
                        <span>{edition.winner}</span>
                      </div>
                      <div className="edition-cta">
                        {hasDetails ? 'Voir les détails →' : 'Détails à venir'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="stats-section">
          <h2>📊 Statistiques Mondiales</h2>
          
          <div className="stats-highlight">
            <div className="highlight-card champion-card">
              <div className="highlight-icon">👑</div>
              <div className="highlight-content">
                <h3>Nation la plus titrée</h3>
                <div className="champion-country">{statistics.mostWins.country}</div>
                <div className="champion-titles">{statistics.mostWins.titles} titres mondiaux</div>
                <div className="champion-years">
                  {statistics.mostWins.years.map((year, index) => (
                    <span key={index} className="year-badge">{year}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="highlight-card recent-card">
              <div className="highlight-icon">🏆</div>
              <div className="highlight-content">
                <h3>Champions récents</h3>
                <div className="recent-winners">
                  {statistics.recentChampions.map((champion, index) => (
                    <div key={index} className="recent-winner">
                      <span className="recent-year">{champion.year}</span>
                      <span className="recent-country">{champion.country}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="fun-facts">
            <h3>💡 Le saviez-vous ?</h3>
            <ul className="facts-list">
              <li>🇧🇷 Le Brésil est le seul pays à avoir participé à toutes les Coupes du Monde</li>
              <li>🏆 La première Coupe du Monde a eu lieu en 1930 en Uruguay</li>
              <li>⚽ Le record de buts en une édition : 171 buts (France 1998 & Brésil 2014)</li>
              <li>👤 Lionel Messi a remporté le Ballon d'Or de la Coupe du Monde à deux reprises</li>
              <li>🌍 2026 sera la première édition avec 48 équipes (au lieu de 32)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorldCup;
