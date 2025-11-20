import React, { useMemo } from 'react';
import TournamentWrapper from '../../../Common/components/TournamentWrapper';
import africanCupData from '../../../Data/Foot/dataAfricNationCup.json';

const AfricNationCupWrapper = React.memo(({ view = 'classement', upcomingMatches = [] }) => {

  // Fonction pour calculer le classement en temps réel à partir des matchs
  const calculateLiveStandings = useMemo(() => {
    // Clone des classements initiaux
    const updatedStandings = JSON.parse(JSON.stringify(africanCupData.currentCAN.standings));
    
    // Récupérer tous les matchs avec des scores
    const allMatchesWithScores = [
      ...(africanCupData.currentCAN.currentMatches || []),
      ...(africanCupData.currentCAN.completedMatches || [])
    ].filter(match => match.score && match.score.includes('-'));

    // Mettre à jour les statistiques pour chaque match
    allMatchesWithScores.forEach(match => {
      const [score1, score2] = match.score.split('-').map(s => parseInt(s.trim()));
      
      // Trouver le groupe du match
      updatedStandings.forEach(groupData => {
        // Trouver les équipes dans ce groupe
        const team1Index = groupData.teams.findIndex(t => 
          t.team === match.team1 || match.team1.includes(t.team.split(' ')[1])
        );
        const team2Index = groupData.teams.findIndex(t => 
          t.team === match.team2 || match.team2.includes(t.team.split(' ')[1])
        );

        // Si les deux équipes sont dans ce groupe, mettre à jour les stats
        if (team1Index !== -1 && team2Index !== -1) {
          const team1 = groupData.teams[team1Index];
          const team2 = groupData.teams[team2Index];

          // Ne mettre à jour que si le match n'a pas déjà été comptabilisé
          // (vérifier si played a changé)
          
          team1.played += 1;
          team2.played += 1;
          
          team1.goalsFor += score1;
          team1.goalsAgainst += score2;
          team2.goalsFor += score2;
          team2.goalsAgainst += score1;
          
          if (score1 > score2) {
            // Équipe 1 gagne
            team1.won += 1;
            team1.points += 3;
            team2.lost += 1;
          } else if (score2 > score1) {
            // Équipe 2 gagne
            team2.won += 1;
            team2.points += 3;
            team1.lost += 1;
          } else {
            // Match nul
            team1.drawn += 1;
            team2.drawn += 1;
            team1.points += 1;
            team2.points += 1;
          }
          
          team1.goalDiff = team1.goalsFor - team1.goalsAgainst;
          team2.goalDiff = team2.goalsFor - team2.goalsAgainst;
        }
      });
    });

    // Trier chaque groupe par points, différence de buts, puis buts marqués
    updatedStandings.forEach(groupData => {
      groupData.teams.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return 0;
      });
      
      // Mettre à jour les positions
      groupData.teams.forEach((team, index) => {
        team.pos = index + 1;
      });
    });

    return updatedStandings;
  }, []);

  // Fonction pour obtenir les stats d'une équipe (V-N-D)
  const getTeamStats = (teamName) => {
    for (const groupData of calculateLiveStandings) {
      const team = groupData.teams.find(t => 
        t.team === teamName || 
        teamName.includes(t.team.split(' ')[1]) ||
        t.team.includes(teamName.split(' ')[1])
      );
      if (team) {
        return `${team.won}-${team.drawn}-${team.lost}`;
      }
    }
    return '0-0-0';
  };

  // Fonction pour calculer les équipes qualifiées et les matchs des 8èmes
  const calculateQualifiedTeams = useMemo(() => {
    const standings = calculateLiveStandings;
    
    // Vérifier si au moins 1 match a été joué par chaque équipe (1ère journée complète)
    const firstRoundComplete = standings.every(groupData => 
      groupData.teams.every(team => team.played >= 1)
    );
    
    // Récupérer les 1ers et 2èmes de chaque groupe
    const groupWinners = {};
    const groupRunners = {};
    const thirdPlaced = [];
    
    standings.forEach(groupData => {
      const groupLetter = groupData.group.replace('Groupe ', '');
      const sortedTeams = [...groupData.teams].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return 0;
      });
      
      // N'afficher les vraies équipes qu'après la 1ère journée
      if (firstRoundComplete && sortedTeams.length >= 1) {
        groupWinners[groupLetter] = sortedTeams[0].team;
      }
      if (firstRoundComplete && sortedTeams.length >= 2) {
        groupRunners[groupLetter] = sortedTeams[1].team;
      }
      if (firstRoundComplete && sortedTeams.length >= 3) {
        thirdPlaced.push({
          team: sortedTeams[2].team,
          group: groupLetter,
          points: sortedTeams[2].points,
          goalDiff: sortedTeams[2].goalDiff,
          goalsFor: sortedTeams[2].goalsFor
        });
      }
    });
    
    // Trier les 3èmes pour trouver les 4 meilleurs
    const bestThirds = thirdPlaced
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return 0;
      })
      .slice(0, 4);
    
    // Créer les matchs des 8èmes selon le règlement de la CAN
    const knockoutMatches = [
      {
        id: 37,
        team1: groupWinners['D'] || '1er Groupe D',
        team2: bestThirds[2]?.team || '3e Groupe B/E/F',
        date: '3 janvier 2026',
        time: '18h00',
        venue: 'Stade Ibn Batouta, Tanger'
      },
      {
        id: 38,
        team1: groupRunners['A'] || '2e Groupe A',
        team2: groupRunners['C'] || '2e Groupe C',
        date: '3 janvier 2026',
        time: 'À déterminer',
        venue: 'Stade Mohammed V, Casablanca'
      },
      {
        id: 39,
        team1: groupWinners['A'] || '1er Groupe A',
        team2: bestThirds[1]?.team || '3e Groupe C/D/E',
        date: '4 janvier 2026',
        time: '18h00',
        venue: 'Stade Prince Moulay Abdellah, Rabat'
      },
      {
        id: 40,
        team1: groupRunners['B'] || '2e Groupe B',
        team2: groupRunners['F'] || '2e Groupe F',
        date: '4 janvier 2026',
        time: '20h30',
        venue: 'Stade Al Barid, Rabat'
      },
      {
        id: 41,
        team1: groupWinners['B'] || '1er Groupe B',
        team2: bestThirds[0]?.team || '3e Groupe A/C/D',
        date: '5 janvier 2026',
        time: '18h00',
        venue: 'Stade Adrar, Agadir'
      },
      {
        id: 42,
        team1: groupWinners['C'] || '1er Groupe C',
        team2: bestThirds[3]?.team || '3e Groupe A/B/F',
        date: '5 janvier 2026',
        time: '20h30',
        venue: 'Complexe sportif de Fès, Fès'
      },
      {
        id: 43,
        team1: groupRunners['D'] || '2e Groupe D',
        team2: groupWinners['E'] || '1er Groupe E',
        date: '6 janvier 2026',
        time: 'À déterminer',
        venue: 'Stade Moulay Hassan, Rabat'
      },
      {
        id: 44,
        team1: groupWinners['F'] || '1er Groupe F',
        team2: groupRunners['E'] || '2e Groupe E',
        date: '6 janvier 2026',
        time: '20h30',
        venue: 'Stade de Marrakech, Marrakech'
      }
    ];
    
    return knockoutMatches;
  }, [calculateLiveStandings]);

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

  // Vue Historique & Éditions
  if (view === 'editions') {
    return (
      <TournamentWrapper 
        title="Coupe d'Afrique des Nations"
        subtitle="Le championnat d'Afrique de football"
        icon="🦁"
        data={africanCupData}
        config={config}
      />
    );
  }

  return (
    <div className="african-cup-wrapper">
      {/* Tournoi en cours avec matchs et classement */}
      {(
        <div className="can-live-container">
          <div className="can-header">
            <h1>🦁 CAN {africanCupData.currentCAN.year}</h1>
            <p className="can-subtitle">Coupe d'Afrique des Nations - {africanCupData.currentCAN.host}</p>
          </div>

          {/* Affichage du classement */}
          {view === 'classement' && africanCupData.currentCAN.standings && (
            <div className="can-standings">
              {/* Indicateur de classement en direct */}
              {(africanCupData.currentCAN.currentMatches?.length > 0 || 
                africanCupData.currentCAN.completedMatches?.length > 0) && (
                <div className="live-standings-indicator">
                  <span className="live-dot">🔴</span>
                  <span>Classement mis à jour en temps réel</span>
                </div>
              )}
              
              <div className="tournament-info-banner">
                <div className="info-item">
                  <span className="info-icon">📅</span>
                  <span>{new Date(africanCupData.currentCAN.startDate).toLocaleDateString('fr-FR')} - {new Date(africanCupData.currentCAN.endDate).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="info-item">
                  <span className="info-icon">⚽</span>
                  <span>{africanCupData.currentCAN.totalTeams} équipes</span>
                </div>
                <div className="info-item">
                  <span className="info-icon">🎯</span>
                  <span>{africanCupData.currentCAN.phase}</span>
                </div>
                <div className="info-item">
                  <span className="info-icon">📺</span>
                  <span>{africanCupData.currentCAN.matchesPlayed} / {africanCupData.currentCAN.totalMatches} matchs</span>
                </div>
              </div>

              <div className="groups-standings-grid">
                {calculateLiveStandings.map((groupData, idx) => (
                  <div key={idx} className="group-standings-card">
                    <h3 className="group-name">{groupData.group}</h3>
                    <div className="standings-table-wrapper">
                      <table className="standings-table">
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
                          {groupData.teams.map((team, teamIdx) => {
                            const isQualified = teamIdx < 2;
                            const isBestThird = teamIdx === 2;
                            return (
                              <tr 
                                key={teamIdx} 
                                className={isQualified ? 'qualified' : isBestThird ? 'best-third' : ''}
                              >
                                <td className="pos">{team.pos}</td>
                                <td className="team">{team.team}</td>
                                <td>{team.played}</td>
                                <td>{team.won}</td>
                                <td>{team.drawn}</td>
                                <td>{team.lost}</td>
                                <td>{team.goalsFor}</td>
                                <td>{team.goalsAgainst}</td>
                                <td className={team.goalDiff > 0 ? 'positive' : team.goalDiff < 0 ? 'negative' : ''}>
                                  {team.goalDiff > 0 ? '+' : ''}{team.goalDiff}
                                </td>
                                <td className="points">{team.points}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
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
          )}

          {/* Affichage des matchs en cours */}
          {view === 'matches' && (
            <div className="can-matches">
              {africanCupData.currentCAN.currentMatches && africanCupData.currentCAN.currentMatches.length > 0 ? (
                <div className="matches-section">
                  <h2 className="section-title">🔴 Matchs en direct</h2>
                  <div className="matches-grid">
                    {africanCupData.currentCAN.currentMatches.map((match, idx) => (
                      <div key={idx} className="match-card live">
                        <div className="match-header">
                          <span className="match-date">{new Date(match.date).toLocaleDateString('fr-FR')}</span>
                          <span className="match-time">{match.time}</span>
                        </div>
                        <div className="match-body">
                          <div className="team home">
                            <span className="team-name">{match.team1}</span>
                          </div>
                          <div className="match-score-container">
                            <div className="score">{match.score}</div>
                            <div className="match-status-live">{match.status}</div>
                          </div>
                          <div className="team away">
                            <span className="team-name">{match.team2}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="no-matches-message">
                  <div className="message-card">
                    <span className="message-icon">⏳</span>
                    <h3>Aucun match en direct</h3>
                    <p>La compétition débutera le {new Date(africanCupData.currentCAN.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Affichage de la phase éliminatoire */}
          {view === 'eliminatoire' && (
            <div className="can-knockout">
              <h2 className="section-title">🏆 Phase à élimination directe</h2>
              
              <div className="knockout-bracket">
                {/* Huitièmes de finale */}
                <div className="knockout-round">
                  <h3 className="round-title">⚽ Huitièmes de finale</h3>
                  <div className="knockout-matches-grid">
                    {calculateQualifiedTeams.map((match) => (
                      <div key={match.id} className="scoreboard-match">
                        <div className="scoreboard-header">
                          <span className="match-number">Match {match.id}</span>
                          <span className="match-datetime">{match.date} • {match.time}</span>
                        </div>
                        <div className="scoreboard-body">
                          <div className="scoreboard-team team-home">
                            <span className="team-name">{match.team1}</span>
                            <span className="team-score">-</span>
                          </div>
                          <div className="scoreboard-separator">
                            <span className="vs-badge">VS</span>
                          </div>
                          <div className="scoreboard-team team-away">
                            <span className="team-score">-</span>
                            <span className="team-name">{match.team2}</span>
                          </div>
                        </div>
                        <div className="scoreboard-footer">
                          <span className="venue-icon">📍</span>
                          <span className="venue-name">{match.venue}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quarts de finale */}
                <div className="knockout-round">
                  <h3 className="round-title">🏅 Quarts de finale</h3>
                  <div className="knockout-matches-grid">
                    {/* Match 45 */}
                    <div className="scoreboard-match">
                      <div className="scoreboard-header">
                        <span className="match-number">Match 45</span>
                        <span className="match-datetime">9 janvier 2026 • 18h00</span>
                      </div>
                      <div className="scoreboard-body">
                        <div className="scoreboard-team team-home">
                          <span className="team-name">Vainqueur Match 38</span>
                          <span className="team-score">-</span>
                        </div>
                        <div className="scoreboard-separator">
                          <span className="vs-badge">VS</span>
                        </div>
                        <div className="scoreboard-team team-away">
                          <span className="team-score">-</span>
                          <span className="team-name">Vainqueur Match 37</span>
                        </div>
                      </div>
                      <div className="scoreboard-footer">
                        <span className="venue-icon">📍</span>
                        <span className="venue-name">Stade Ibn-Batouta, Tanger</span>
                      </div>
                    </div>

                    {/* Match 46 */}
                    <div className="scoreboard-match">
                      <div className="scoreboard-header">
                        <span className="match-number">Match 46</span>
                        <span className="match-datetime">9 janvier 2026 • 20h30</span>
                      </div>
                      <div className="scoreboard-body">
                        <div className="scoreboard-team team-home">
                          <span className="team-name">Vainqueur Match 43</span>
                          <span className="team-score">-</span>
                        </div>
                        <div className="scoreboard-separator">
                          <span className="vs-badge">VS</span>
                        </div>
                        <div className="scoreboard-team team-away">
                          <span className="team-score">-</span>
                          <span className="team-name">Vainqueur Match 42</span>
                        </div>
                      </div>
                      <div className="scoreboard-footer">
                        <span className="venue-icon">📍</span>
                        <span className="venue-name">Stade de Marrakech, Marrakech</span>
                      </div>
                    </div>

                    {/* Match 47 */}
                    <div className="scoreboard-match">
                      <div className="scoreboard-header">
                        <span className="match-number">Match 47</span>
                        <span className="match-datetime">9 janvier 2026 • 20h30</span>
                      </div>
                      <div className="scoreboard-body">
                        <div className="scoreboard-team team-home">
                          <span className="team-name">Vainqueur Match 40</span>
                          <span className="team-score">-</span>
                        </div>
                        <div className="scoreboard-separator">
                          <span className="vs-badge">VS</span>
                        </div>
                        <div className="scoreboard-team team-away">
                          <span className="team-score">-</span>
                          <span className="team-name">Vainqueur Match 39</span>
                        </div>
                      </div>
                      <div className="scoreboard-footer">
                        <span className="venue-icon">📍</span>
                        <span className="venue-name">Stade Prince Moulay Abdellah, Rabat</span>
                      </div>
                    </div>

                    {/* Match 48 */}
                    <div className="scoreboard-match">
                      <div className="scoreboard-header">
                        <span className="match-number">Match 48</span>
                        <span className="match-datetime">10 janvier 2026 • 18h00</span>
                      </div>
                      <div className="scoreboard-body">
                        <div className="scoreboard-team team-home">
                          <span className="team-name">Vainqueur Match 41</span>
                          <span className="team-score">-</span>
                        </div>
                        <div className="scoreboard-separator">
                          <span className="vs-badge">VS</span>
                        </div>
                        <div className="scoreboard-team team-away">
                          <span className="team-score">-</span>
                          <span className="team-name">Vainqueur Match 44</span>
                        </div>
                      </div>
                      <div className="scoreboard-footer">
                        <span className="venue-icon">📍</span>
                        <span className="venue-name">Stade Adrar, Agadir</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Demi-finales */}
                <div className="knockout-round">
                  <h3 className="round-title">🌟 Demi-finales</h3>
                  <div className="knockout-matches-grid semifinals">
                    {/* Match 49 */}
                    <div className="scoreboard-match">
                      <div className="scoreboard-header">
                        <span className="match-number">Match 49</span>
                        <span className="match-datetime">14 janvier 2026 • 18h00</span>
                      </div>
                      <div className="scoreboard-body">
                        <div className="scoreboard-team team-home">
                          <span className="team-name">Vainqueur Match 45</span>
                          <span className="team-score">-</span>
                        </div>
                        <div className="scoreboard-separator">
                          <span className="vs-badge">VS</span>
                        </div>
                        <div className="scoreboard-team team-away">
                          <span className="team-score">-</span>
                          <span className="team-name">Vainqueur Match 48</span>
                        </div>
                      </div>
                      <div className="scoreboard-footer">
                        <span className="venue-icon">📍</span>
                        <span className="venue-name">Stade Ibn-Batouta, Tanger</span>
                      </div>
                    </div>

                    {/* Match 50 */}
                    <div className="scoreboard-match">
                      <div className="scoreboard-header">
                        <span className="match-number">Match 50</span>
                        <span className="match-datetime">14 janvier 2026 • 20h30</span>
                      </div>
                      <div className="scoreboard-body">
                        <div className="scoreboard-team team-home">
                          <span className="team-name">Vainqueur Match 47</span>
                          <span className="team-score">-</span>
                        </div>
                        <div className="scoreboard-separator">
                          <span className="vs-badge">VS</span>
                        </div>
                        <div className="scoreboard-team team-away">
                          <span className="team-score">-</span>
                          <span className="team-name">Vainqueur Match 46</span>
                        </div>
                      </div>
                      <div className="scoreboard-footer">
                        <span className="venue-icon">📍</span>
                        <span className="venue-name">Stade Prince Moulay Abdellah, Rabat</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Match pour la 3e place */}
                <div className="knockout-round">
                  <h3 className="round-title">🥉 Match pour la troisième place</h3>
                  <div className="knockout-matches-grid finals">
                    {/* Match 51 */}
                    <div className="scoreboard-match third-place">
                      <div className="scoreboard-header">
                        <span className="match-number">Match 51</span>
                        <span className="match-datetime">17 janvier 2026 • 20h00</span>
                      </div>
                      <div className="scoreboard-body">
                        <div className="scoreboard-team team-home">
                          <span className="team-name">Perdant Match 49</span>
                          <span className="team-score">-</span>
                        </div>
                        <div className="scoreboard-separator">
                          <span className="vs-badge">VS</span>
                        </div>
                        <div className="scoreboard-team team-away">
                          <span className="team-score">-</span>
                          <span className="team-name">Perdant Match 50</span>
                        </div>
                      </div>
                      <div className="scoreboard-footer">
                        <span className="venue-icon">📍</span>
                        <span className="venue-name">Stade Mohammed V, Casablanca</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FINALE */}
                <div className="knockout-round">
                  <h3 className="round-title final-title">🏆 FINALE</h3>
                  <div className="knockout-matches-grid finals">
                    {/* Match 52 */}
                    <div className="scoreboard-match final-match">
                      <div className="scoreboard-header">
                        <span className="match-number">Match 52 - FINALE</span>
                        <span className="match-datetime">18 janvier 2026 • 20h00</span>
                      </div>
                      <div className="scoreboard-body">
                        <div className="scoreboard-team team-home">
                          <span className="team-name">Vainqueur Match 49</span>
                          <span className="team-score">-</span>
                        </div>
                        <div className="scoreboard-separator">
                          <span className="vs-badge trophy">🏆</span>
                        </div>
                        <div className="scoreboard-team team-away">
                          <span className="team-score">-</span>
                          <span className="team-name">Vainqueur Match 50</span>
                        </div>
                      </div>
                      <div className="scoreboard-footer final-footer">
                        <span className="venue-icon">🏟️</span>
                        <span className="venue-name">Stade Prince Moulay Abdellah, Rabat</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="knockout-legend">
                <p>📌 <strong>Format:</strong> Les 16 équipes qualifiées (2 premiers de chaque groupe + 4 meilleurs 3èmes) s'affrontent en élimination directe</p>
                <p>⚽ <strong>Prolongations:</strong> En cas d'égalité après 90 minutes, prolongations de 30 minutes puis tirs au but si nécessaire</p>
              </div>
            </div>
          )}

          {/* Affichage des matchs à venir */}
          {view === 'avenir' && (
            <div className="can-matches">
              {upcomingMatches && upcomingMatches.length > 0 ? (
                <div className="matches-section">
                  <h2 className="section-title">� Matchs à venir</h2>
                  <div className="matches-grid">
                    {upcomingMatches.map((match, idx) => {
                      const isApiData = match.competitions !== undefined;
                      const team1 = isApiData ? match.competitions?.[0]?.competitors?.[0]?.team?.displayName : match.team1;
                      const team2 = isApiData ? match.competitions?.[0]?.competitors?.[1]?.team?.displayName : match.team2;
                      const matchDate = new Date(match.date);
                      const matchTime = isApiData ? matchDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : match.time;
                      const matchStatus = isApiData ? (match.competitions?.[0]?.status?.type?.detail || 'À venir') : match.status;
                      return (
                        <div key={idx} className="match-card upcoming">
                          <div className="match-header">
                            <span className="match-date">{matchDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                            <span className="match-time">{matchTime}</span>
                          </div>
                          <div className="match-body">
                            <div className="team home">
                              <span className="team-name">{team1}</span>
                            </div>
                            <div className="match-vs">
                              <span className="vs-text">VS</span>
                            </div>
                            <div className="team away">
                              <span className="team-name">{team2}</span>
                            </div>
                          </div>
                          <div className="match-footer">
                            <span className="match-group">{matchStatus}</span>
                            {match.venue && <span className="match-venue"> • {match.venue}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="no-matches-message">
                  <div className="message-card">
                    <span className="message-icon">📅</span>
                    <h3>Aucun match à venir</h3>
                    <p>Les matchs seront disponibles via l'API ESPN</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

AfricNationCupWrapper.displayName = 'AfricNationCupWrapper';

export default AfricNationCupWrapper;
