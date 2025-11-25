import React, { useMemo } from 'react';
import FootballLeague from '../components/FootballLeague';
import GroupStageTable from '../components/GroupStageTable';
import TournamentWrapper from '../components/TournamentWrapper';
import africanCupData from '../../Data/Foot/dataAfricNationCup.json';
import { useSportsData } from '../../hooks/useDataAPI';
import { africancupConfig as africanCupConfig } from '../data/leaguesConfig';

const AfricNationCup = ({ view = 'matches' }) => {
  const { sportData: canData, loading, error } = useSportsData('can2025');

  // Extraire les données du hook
  const data = canData?.leagueData || null;
  const allWeekendMatches = canData?.weekendMatches || [];
  const upcomingWeekendMatches = canData?.upcomingMatches || [];
  const standings = canData?.standings || [];

  // Fonction pour calculer le classement en temps réel à partir des matchs
  const calculateLiveStandings = useMemo(() => {
    const updatedStandings = JSON.parse(JSON.stringify(africanCupData.currentCAN.standings));
    const allMatchesWithScores = [
      ...(africanCupData.currentCAN.currentMatches || []),
      ...(africanCupData.currentCAN.completedMatches || [])
    ].filter(match => match.score && match.score.includes('-'));

    allMatchesWithScores.forEach(match => {
      const [score1, score2] = match.score.split('-').map(s => parseInt(s.trim()));
      
      updatedStandings.forEach(groupData => {
        const team1Index = groupData.teams.findIndex(t => 
          t.team === match.team1 || match.team1.includes(t.team.split(' ')[1])
        );
        const team2Index = groupData.teams.findIndex(t => 
          t.team === match.team2 || match.team2.includes(t.team.split(' ')[1])
        );

        if (team1Index !== -1 && team2Index !== -1) {
          const team1 = groupData.teams[team1Index];
          const team2 = groupData.teams[team2Index];

          team1.played += 1;
          team2.played += 1;
          team1.goalsFor += score1;
          team1.goalsAgainst += score2;
          team2.goalsFor += score2;
          team2.goalsAgainst += score1;
          
          if (score1 > score2) {
            team1.won += 1;
            team1.points += 3;
            team2.lost += 1;
          } else if (score2 > score1) {
            team2.won += 1;
            team2.points += 3;
            team1.lost += 1;
          } else {
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

    updatedStandings.forEach(groupData => {
      groupData.teams.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return 0;
      });
      
      groupData.teams.forEach((team, index) => {
        team.pos = index + 1;
      });
    });

    return updatedStandings;
  }, []);

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
            <div className="highlight-desc">{statistics.mostWins.wins} victoires</div>
            <div className="highlight-years">{statistics.mostWins.years.join(' • ')}</div>
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

  // Vue Phase éliminatoire
  if (view === 'eliminatoire') {
    return (
      <div className="can-knockout">
        <h2 className="section-title">🏆 Phase à élimination directe</h2>
        <div className="knockout-legend">
          <p>📌 <strong>Format:</strong> Les 16 équipes qualifiées (2 premiers de chaque groupe + 4 meilleurs 3èmes) s'affrontent en élimination directe</p>
          <p>⚽ <strong>Prolongations:</strong> En cas d'égalité après 90 minutes, prolongations de 30 minutes puis tirs au but si nécessaire</p>
        </div>
      </div>
    );
  }

  // Vue Matchs à venir
  if (view === 'avenir') {
    const matchesToShow = upcomingWeekendMatches.length > 0 
      ? upcomingWeekendMatches 
      : africanCupData.currentCAN.nextMatches || [];
    
    return (
      <div className="can-matches">
        {matchesToShow && matchesToShow.length > 0 ? (
          <div className="matches-section">
            <h2 className="section-title">📅 Matchs à venir</h2>
            <div className="matches-grid">
              {matchesToShow.map((match, idx) => {
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
    );
  }

  // Pour le classement, on utilise les données consolidées
  if (view === 'classement') {
    return (
      <div className="can-standings-wrapper">
        <div className="league-header">
          <h2>🦁 CAN 2025</h2>
          <p>Coupe d'Afrique des Nations - Maroc</p>
        </div>
        
        {error && (
          <div className="error-message">
            <p>⚠️ Impossible de charger le classement</p>
            <p>{error}</p>
          </div>
        )}
        
        {loading ? (
          <div className="loading-message">
            <p>Chargement du classement...</p>
          </div>
        ) : standings && standings.length > 0 ? (
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
        ) : (
          <div className="no-data">
            <p>Classement non disponible</p>
          </div>
        )}

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

  // Pour les matchs, on utilise FootballLeague avec les données de l'API
  return (
    <FootballLeague
      leagueData={data}
      weekendMatches={allWeekendMatches}
      upcomingMatches={upcomingWeekendMatches}
      standingsData={[]}
      leagueConfig={africanCupConfig}
      view={view}
    />
  );
};

export default AfricNationCup;
