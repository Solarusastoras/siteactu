import React, { useState, useEffect } from 'react';
import FootballLeague from '../../../Common/components/FootballLeague';
import GroupStageTable from '../../../Common/components/GroupStageTable';
import WorldCupWrapper from './WorldCupWrapper';
import {
  getApiUrl,
  formatDateForApi,
  isInMatchTime,
  worldCupConfig
} from '../../../Common/data/footballLeaguesConfig';
import './WorldCup.scss';

const WorldCup = ({ view = 'matches' }) => {
  const [data, setData] = useState(null);
  const [allWeekendMatches, setAllWeekendMatches] = useState(() => {
    const cached = localStorage.getItem('worldcup_weekend_matches');
    return cached ? JSON.parse(cached) : [];
  });
  const [upcomingWeekendMatches, setUpcomingWeekendMatches] = useState(() => {
    const cached = localStorage.getItem('worldcup_upcoming_matches');
    return cached ? JSON.parse(cached) : [];
  });
  const [newsArticles, setNewsArticles] = useState(() => {
    const cached = localStorage.getItem('worldcup_news');
    return cached ? JSON.parse(cached) : [];
  });
  const [standings, setStandings] = useState(() => {
    const cached = localStorage.getItem('worldcup_standings');
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const now = new Date();
        const dayOfWeek = now.getDay();
        const hours = now.getHours();
        
        const lastUpdate = localStorage.getItem('worldcup_last_update');
        const lastUpdateDate = lastUpdate ? new Date(lastUpdate) : null;
        
        const shouldFetchWeekend = dayOfWeek === 1 && hours === 1;
        const neverFetched = !lastUpdateDate;
        const isOutdated = lastUpdateDate && (now - lastUpdateDate) > 7 * 24 * 60 * 60 * 1000;
        const forceUpdate = !localStorage.getItem('worldcup_upcoming_matches') || 
                           JSON.parse(localStorage.getItem('worldcup_upcoming_matches') || '[]').length === 0;
        
        const currentTime = hours * 60 + now.getMinutes();
        const isMatchTime = isInMatchTime(dayOfWeek, currentTime, worldCupConfig.matchTimeRanges);
        
        if (isMatchTime) {
          const matchesResponse = await fetch(getApiUrl(worldCupConfig.apiCode));
          const matchesData = await matchesResponse.json();
          setData(matchesData);
          console.log('🏆 Coupe du Monde - Actualisation matchs en cours');
        }
        
        if (shouldFetchWeekend || neverFetched || isOutdated || forceUpdate) {
          console.log('🏆 Coupe du Monde - Mise à jour des matchs...');
          
          if (!isMatchTime) {
            const matchesResponse = await fetch(getApiUrl(worldCupConfig.apiCode));
            const matchesData = await matchesResponse.json();
            setData(matchesData);
          }
          
          try {
            const allFetches = [];
            const today = new Date();
            
            for (let i = -30; i < 30; i++) {
              const date = new Date(today);
              date.setDate(today.getDate() + i);
              allFetches.push(fetch(getApiUrl(worldCupConfig.apiCode, formatDateForApi(date))));
            }
            
            const responses = await Promise.all(allFetches);
            const allData = await Promise.all(responses.map(r => r.json()));
            
            let allMatches = allData
              .reduce((acc, data) => [...acc, ...(data.events || [])], [])
              .sort((a, b) => new Date(a.date) - new Date(b.date));
            
            if (allMatches.length > 0) {
              const todayEnd = new Date(now);
              todayEnd.setHours(23, 59, 59, 999);
              
              const currentWeekendMatches = allMatches.filter(match => {
                const matchDate = new Date(match.date);
                return matchDate <= todayEnd;
              });
              
              const nextWeekendMatches = allMatches.filter(match => {
                const matchDate = new Date(match.date);
                return matchDate > todayEnd;
              });
              
              setAllWeekendMatches(currentWeekendMatches);
              setUpcomingWeekendMatches(nextWeekendMatches);
              
              localStorage.setItem('worldcup_weekend_matches', JSON.stringify(currentWeekendMatches));
              localStorage.setItem('worldcup_upcoming_matches', JSON.stringify(nextWeekendMatches));
              localStorage.setItem('worldcup_last_update', now.toISOString());
              console.log('✅ Coupe du Monde - Matchs sauvegardés dans le cache');
            }
          } catch (error) {
            console.log('Erreur récupération matchs Coupe du Monde:', error);
          }
        }

        // Récupérer le classement
        try {
          const lastStandingsUpdate = localStorage.getItem('worldcup_standings_last_update');
          const lastStandingsDate = lastStandingsUpdate ? new Date(lastStandingsUpdate) : null;
          const standingsOutdated = !lastStandingsDate || (now - lastStandingsDate) > 24 * 60 * 60 * 1000; // 24 heures
          
          if (standingsOutdated || standings.length === 0) {
            const standingsUrl = `https://site.api.espn.com/apis/v2/sports/soccer/${worldCupConfig.apiCode}/standings`;
            const standingsResponse = await fetch(standingsUrl);
            const standingsData = await standingsResponse.json();
            
            console.log('🔍 Données API standings:', standingsData);
            
            if (standingsData.children && standingsData.children.length > 0) {
              console.log('🔍 Nombre de groupes:', standingsData.children.length);
              console.log('🔍 Premier groupe:', standingsData.children[0]);
              
              const groupedStandings = standingsData.children.map(group => {
                console.log('🔍 Traitement groupe:', group.name);
                console.log('🔍 Entries du groupe:', group.standings?.entries);
                
                return {
                  name: group.name,
                  standings: group.standings.entries.map(entry => {
                    console.log('🔍 Entry team:', entry.team);
                    return {
                      team: entry.team.displayName,
                      logo: entry.team.logos?.[0]?.href || '',
                      played: entry.stats.find(s => s.name === 'gamesPlayed')?.value || 0,
                      wins: entry.stats.find(s => s.name === 'wins')?.value || 0,
                      draws: entry.stats.find(s => s.name === 'ties')?.value || 0,
                      losses: entry.stats.find(s => s.name === 'losses')?.value || 0,
                      goalsFor: entry.stats.find(s => s.name === 'pointsFor')?.value || 0,
                      goalsAgainst: entry.stats.find(s => s.name === 'pointsAgainst')?.value || 0,
                      goalDifference: entry.stats.find(s => s.name === 'pointDifferential')?.value || 0,
                      points: entry.stats.find(s => s.name === 'points')?.value || 0
                    };
                  })
                };
              });
              
              console.log('✅ Classement formaté:', groupedStandings);
              setStandings(groupedStandings);
              localStorage.setItem('worldcup_standings', JSON.stringify(groupedStandings));
              localStorage.setItem('worldcup_standings_last_update', now.toISOString());
              console.log('✅ Classement Coupe du Monde récupéré');
            } else {
              console.log('⚠️ Pas de données children dans l\'API');
            }
          }
        } catch (error) {
          console.log('Erreur récupération classement Coupe du Monde:', error);
        }

        // Récupérer les actualités du flux RSS
        try {
          const lastNewsUpdate = localStorage.getItem('worldcup_news_last_update');
          const lastNewsDate = lastNewsUpdate ? new Date(lastNewsUpdate) : null;
          const newsOutdated = !lastNewsDate || (now - lastNewsDate) > 60 * 60 * 1000; // 1 heure
          
          if (newsOutdated || newsArticles.length === 0) {
            // Utiliser un proxy CORS pour récupérer le flux RSS
            const rssUrl = 'https://rmcsport.bfmtv.com/football/coupe-du-monde/flux-rss/';
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`;
            
            const rssResponse = await fetch(proxyUrl);
            const rssText = await rssResponse.text();
            
            // Parser le XML
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(rssText, 'text/xml');
            const items = xmlDoc.querySelectorAll('item');
            
            const articles = Array.from(items).slice(0, 10).map(item => ({
              title: item.querySelector('title')?.textContent || '',
              link: item.querySelector('link')?.textContent || '',
              description: item.querySelector('description')?.textContent?.replace(/<[^>]*>/g, '') || '',
              pubDate: item.querySelector('pubDate')?.textContent || '',
              image: item.querySelector('enclosure')?.getAttribute('url') || ''
            }));
            
            setNewsArticles(articles);
            localStorage.setItem('worldcup_news', JSON.stringify(articles));
            localStorage.setItem('worldcup_news_last_update', now.toISOString());
            console.log('✅ Actualités Coupe du Monde récupérées');
          }
        } catch (error) {
          console.log('Erreur récupération actualités:', error);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erreur chargement données Coupe du Monde:', error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [newsArticles.length, standings.length]);

  // Vue Historique & Éditions
  if (view === 'editions') {
    return <WorldCupWrapper />;
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
    console.log('🔍 WorldCup classement - standings:', standings);
    
    // Si les données ne sont pas encore chargées
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
  console.log('🔍 WorldCup render - view:', view);
  
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
