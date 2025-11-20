import React, { useState, useMemo } from 'react';
import GroupStageTable from './GroupStageTable';
import KnockoutRound from './KnockoutRound';
import EditionPodium from './EditionPodium';
import EditionStats from './EditionStats';
import '../../Page/Sports/leagues/WorldCup.scss';

const TournamentWrapper = React.memo(({ 
  title, 
  subtitle,
  icon,
  data, 
  config 
}) => {
  const [activeTab, setActiveTab] = useState('current');
  const [selectedEdition, setSelectedEdition] = useState(null);

  const currentTournament = data[config.dataKeys.current];
  const pastTournaments = data[config.dataKeys.past];
  const detailedEditions = data.detailedEditions;
  const statistics = data.statistics;

  // Mémoiser les éditions triées
  const sortedEditionYears = useMemo(() => {
    return Object.keys(detailedEditions || {}).sort((a, b) => b - a);
  }, [detailedEditions]);

  const getEditionDetails = (year) => {
    if (detailedEditions && detailedEditions[year]) {
      return detailedEditions[year];
    }
    return pastTournaments.find(t => t.year === year);
  };

  return (
    <div className={`world-cup ${config.className || ''}`}>
      <div className="world-cup-header">
        <h1>{icon} {title}</h1>
        <p className="subtitle">{subtitle}</p>
      </div>

      <div className="tabs">
        
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

      {/* TAB: Current Tournament */}
      {activeTab === 'current' && (
        <div className="current-worldcup">
          <div className="current-header">
            <h2>{config.tournamentLabel} {currentTournament.year}</h2>
            <div className="hosts">
              <span className="hosts-label">Pays hôte{config.multipleHosts ? 's' : ''}:</span>
              {config.multipleHosts ? (
                <div className="hosts-list">
                  {currentTournament.hosts.map((host, idx) => (
                    <span key={idx} className="host-badge">{host}</span>
                  ))}
                </div>
              ) : (
                <span className="host-badge">{currentTournament.host}</span>
              )}
            </div>
          </div>

          <div className="current-info-grid">
            <div className="info-card">
              <span className="info-icon">📅</span>
              <div className="info-content">
                <span className="info-label">Dates</span>
                <span className="info-value">
                  {new Date(currentTournament.startDate).toLocaleDateString('fr-FR')} - 
                  {new Date(currentTournament.endDate).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>

            <div className="info-card">
              <span className="info-icon">⚽</span>
              <div className="info-content">
                <span className="info-label">Équipes</span>
                <span className="info-value">{currentTournament.totalTeams} équipes</span>
              </div>
            </div>

            <div className="info-card">
              <span className="info-icon">🎯</span>
              <div className="info-content">
                <span className="info-label">Phase actuelle</span>
                <span className="info-value">{currentTournament.phase}</span>
              </div>
            </div>

            <div className="info-card">
              <span className="info-icon">📺</span>
              <div className="info-content">
                <span className="info-label">Matchs</span>
                <span className="info-value">
                  {currentTournament.matchesPlayed} / {currentTournament.totalMatches}
                </span>
              </div>
            </div>
          </div>

          <div className="status-banner">
            <span className="status-badge">
              {currentTournament.status === 'à_venir' ? '⏳ À venir' : '🔴 En cours'}
            </span>
            <p className="status-text">
              {currentTournament.status === 'à_venir' 
                ? `${config.tournamentName} débutera le ${new Date(currentTournament.startDate).toLocaleDateString('fr-FR')}`
                : `Phase actuelle : ${currentTournament.phase}`
              }
            </p>
          </div>

          {/* Matchs en cours */}
          {currentTournament.currentMatches && currentTournament.currentMatches.length > 0 && (
            <div className="current-matches-section">
              <h3>🔴 Matchs de la journée {currentTournament.currentMatchday}</h3>
              <div className="matches-grid">
                {currentTournament.currentMatches.map((match, idx) => (
                  <div key={idx} className="match-card current">
                    <div className="match-date">
                      {new Date(match.date).toLocaleDateString('fr-FR')} - {match.time}
                    </div>
                    <div className="match-teams">
                      <div className="team">{match.team1}</div>
                      <div className="match-vs">VS</div>
                      <div className="team">{match.team2}</div>
                    </div>
                    <div className="match-status">{match.status}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prochains matchs */}
          {currentTournament.nextMatches && currentTournament.nextMatches.length > 0 && (
            <div className="next-matches-section">
              <h3>⏭️ Prochaine journée {currentTournament.currentMatchday + 1}</h3>
              <div className="matches-grid">
                {currentTournament.nextMatches.map((match, idx) => (
                  <div key={idx} className="match-card next">
                    <div className="match-date">
                      {new Date(match.date).toLocaleDateString('fr-FR')} - {match.time}
                    </div>
                    <div className="match-teams">
                      <div className="team">{match.team1}</div>
                      <div className="match-vs">VS</div>
                      <div className="team">{match.team2}</div>
                    </div>
                    <div className="match-status">{match.status}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Classement */}
          {currentTournament.standings && currentTournament.standings.length > 0 && (
            <div className="current-standings-section">
              <h3>📊 Classement des groupes</h3>
              
              {/* Check if standings is grouped format or flat format */}
              {currentTournament.standings[0].group ? (
                // Grouped standings (by group)
                <div className="groups-grid">
                  {currentTournament.standings.map((groupData, idx) => (
                    <GroupStageTable 
                      key={idx} 
                      group={{
                        name: groupData.group,
                        standings: groupData.teams
                      }}
                    />
                  ))}
                </div>
              ) : (
                // Flat standings (single table)
                <div className="standings-table">
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
                      {currentTournament.standings.map((team, idx) => {
                        let rowClass = '';
                        if (team.rank <= 8) rowClass = 'qualified-direct';
                        else if (team.rank <= 24) rowClass = 'qualified-playoff';
                        
                        return (
                          <tr key={idx} className={rowClass}>
                            <td className="position">{team.rank}</td>
                            <td className="team-name">{team.team}</td>
                            <td>{team.played}</td>
                            <td>{team.won}</td>
                            <td>{team.drawn}</td>
                            <td>{team.lost}</td>
                            <td>{team.goalsFor}</td>
                            <td>{team.goalsAgainst}</td>
                            <td className={team.goalDifference >= 0 ? 'positive' : 'negative'}>
                              {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                            </td>
                            <td className="points">{team.points}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="standings-legend">
                    <div className="legend-item">
                      <span className="legend-color qualified-direct"></span>
                      <span>1-8 : Qualifiés directs pour les 1/8</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color qualified-playoff"></span>
                      <span>9-24 : Barrages pour les 1/8</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="standings-legend" style={{ marginTop: '20px' }}>
                <div className="legend-item">
                  <span className="legend-color qualified-direct"></span>
                  <span>Top 2 de chaque groupe : Qualifiés pour les 1/8</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color qualified-playoff"></span>
                  <span>4 meilleurs 3èmes : Qualifiés pour les 1/8</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: Winners */}
      {activeTab === 'winners' && (
        <div className="history-section">
          <h2>🏆 Palmarès</h2>
          <div className="history-grid">
            {pastTournaments.map((tournament, index) => (
              <div key={index} className="history-card">
                <div className="history-year">{tournament.year}</div>
                <div className="history-host">
                  <span className="host-icon">📍</span> 
                  {config.multipleHosts && tournament.hosts 
                    ? tournament.hosts.join(', ') 
                    : tournament.host
                  }
                </div>
                
                <div className="podium">
                  <div className="podium-item winner">
                    <span className="medal">🥇</span>
                    <span className="team">{tournament.winner}</span>
                  </div>
                  <div className="podium-item runner-up">
                    <span className="medal">🥈</span>
                    <span className="team">{tournament.runnerUp}</span>
                  </div>
                  {!config.hideThirdPlace && (
                    <div className="podium-item third">
                      <span className="medal">🥉</span>
                      <span className="team">{tournament.third}</span>
                    </div>
                  )}
                </div>

                <div className="match-details">
                  <div className="detail-row">
                    <span className="detail-icon">⚽</span>
                    <span className="detail-text">Score final: {tournament.finalScore}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">👟</span>
                    <span className="detail-text">Meilleur buteur: {tournament.topScorer}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">⭐</span>
                    <span className="detail-text">Meilleur joueur: {tournament.bestPlayer}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">🏟️</span>
                    <span className="detail-text">{tournament.venue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Editions */}
      {activeTab === 'editions' && (
        <div className="editions-section">
          <h2>📜 Éditions détaillées</h2>
          
          {!selectedEdition && (
            <div className="editions-list">
              <div className="editions-grid">
                {sortedEditionYears.map((year) => (
                  <div
                    key={year}
                    className="edition-card has-details"
                    onClick={() => setSelectedEdition(year)}
                  >
                    <div className="edition-year">{year}</div>
                    <div className="edition-host-badge">
                      📍 {config.multipleHosts && detailedEditions[year].hosts 
                        ? detailedEditions[year].hosts.join(', ')
                        : detailedEditions[year].host
                      }
                    </div>
                    <div className="edition-winner">
                      <span className="winner-badge">🏆</span>
                      <span>{detailedEditions[year].winner}</span>
                    </div>
                    <div className="edition-cta">Voir les détails →</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedEdition && (() => {
            const edition = getEditionDetails(selectedEdition);
            if (!edition) return null;

            return (
              <div className="edition-detail">
                <button 
                  className="back-btn"
                  onClick={() => setSelectedEdition(null)}
                >
                  ← Retour
                </button>

                <div className="edition-header">
                  <h3>{config.tournamentLabel} {edition.year}</h3>
                  <div className="edition-host">
                    📍 {config.multipleHosts && edition.hosts 
                      ? edition.hosts.join(', ')
                      : edition.host
                    }
                  </div>
                </div>

                {edition.groupStage && (
                  <div className="group-stage">
                    <h4>Phase de groupes</h4>
                    <div className="groups-grid">
                      {edition.groupStage.map((group, idx) => (
                        <GroupStageTable key={idx} group={group} />
                      ))}
                    </div>
                  </div>
                )}

                {edition.knockoutMatches && (
                  <div className="knockout-stage">
                    <h4>Phase à élimination directe</h4>
                    <div className="knockout-rounds">
                      {edition.knockoutMatches.playOffs && (
                        <KnockoutRound title="Barrages" matches={edition.knockoutMatches.playOffs} />
                      )}
                      <KnockoutRound title="Huitièmes de finale" matches={edition.knockoutMatches.roundOf16} />
                      <KnockoutRound title="Quarts de finale" matches={edition.knockoutMatches.quarterFinals} />
                      <KnockoutRound title="Demi-finales" matches={edition.knockoutMatches.semiFinals} />
                      {!config.hideThirdPlace && edition.knockoutMatches.thirdPlace && (
                        <KnockoutRound title="Match pour la 3ème place" matches={edition.knockoutMatches.thirdPlace} />
                      )}
                      <KnockoutRound title="🏆 FINALE" matches={edition.knockoutMatches.final} isFinal={true} />
                    </div>

                    <EditionPodium 
                      winner={edition.winner}
                      runnerUp={edition.runnerUp}
                      third={!config.hideThirdPlace ? edition.third : null}
                    />

                    <EditionStats
                      topScorer={edition.topScorer}
                      bestPlayer={edition.bestPlayer}
                      venue={edition.venue}
                    />
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB: Statistics */}
      {activeTab === 'stats' && config.renderStats && (
        config.renderStats(statistics, pastTournaments)
      )}
    </div>
  );
});

TournamentWrapper.displayName = 'TournamentWrapper';

export default TournamentWrapper;
