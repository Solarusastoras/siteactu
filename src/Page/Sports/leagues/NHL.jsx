import React, { useState, useEffect } from 'react';
import NHLStandings from '../../../Common/components/NHLStandings';
import { currentNHLStandings } from '../../../Common/data/nhlStandingsData';
import Card from '../../../Common/card';

const NHL = ({ view = 'matches' }) => {
  const [data, setData] = useState(null);
  const [standings, setStandings] = useState(currentNHLStandings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les matchs
        const matchesResponse = await fetch('https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard');
        const matchesData = await matchesResponse.json();
        console.log('NHL Matches Data:', matchesData);
        setData(matchesData);
        
        // Récupérer le classement
        try {
          const standingsResponse = await fetch('https://site.api.espn.com/apis/v2/sports/hockey/nhl/standings');
          const standingsData = await standingsResponse.json();
          
          console.log('NHL API Response:', standingsData);
          
          if (standingsData?.children) {
            const formattedData = {
              eastern: { atlantic: [], metropolitan: [], wildcard: [] },
              western: { central: [], pacific: [], wildcard: [] }
            };

            standingsData.children.forEach(conference => {
              console.log('Conference:', conference.name);
              const confKey = conference.name.toLowerCase().includes('east') ? 'eastern' : 'western';
              
              if (conference.standings?.entries) {
                const allTeamsInConf = [];
                
                conference.standings.entries.forEach(entry => {
                  const stats = entry.stats;
                  const gp = parseInt(stats.find(s => s.name === 'gamesPlayed')?.value || 0);
                  const wins = parseInt(stats.find(s => s.name === 'wins')?.value || 0);
                  const losses = parseInt(stats.find(s => s.name === 'losses')?.value || 0);
                  const otl = parseInt(stats.find(s => s.name === 'otLosses')?.value || 0);
                  
                  const teamData = {
                    team: entry.team.displayName,
                    abbr: entry.team.abbreviation,
                    gp: gp,
                    wins: wins,
                    losses: losses,
                    otl: otl,
                    pts: wins * 2 + otl,
                    rw: parseInt(stats.find(s => s.name === 'regulationWins')?.value || 0),
                    row: parseInt(stats.find(s => s.name === 'regulationOvertimeWins')?.value || wins),
                    gf: parseInt(stats.find(s => s.name === 'pointsFor')?.value || 0),
                    ga: parseInt(stats.find(s => s.name === 'pointsAgainst')?.value || 0),
                    home: stats.find(s => s.name === 'Home')?.displayValue || '0-0-0',
                    away: stats.find(s => s.name === 'Road')?.displayValue || '0-0-0',
                    strk: stats.find(s => s.name === 'streak')?.displayValue || '-'
                  };
                  
                  allTeamsInConf.push(teamData);
                  
                  // Déterminer la division
                  const teamName = entry.team.name.toLowerCase();
                  console.log('Team:', teamName, 'Full name:', entry.team.displayName);
                  
                  // Atlantic: Bruins, Sabres, Red Wings, Panthers, Canadiens, Senators, Lightning, Maple Leafs
                  if (['bruins', 'sabres', 'red wings', 'panthers', 'canadiens', 'senators', 'lightning', 'maple leafs'].includes(teamName)) {
                    formattedData[confKey].atlantic.push(teamData);
                  }
                  // Metropolitan: Hurricanes, Blue Jackets, Devils, Islanders, Rangers, Flyers, Penguins, Capitals
                  else if (['hurricanes', 'blue jackets', 'devils', 'islanders', 'rangers', 'flyers', 'penguins', 'capitals'].includes(teamName)) {
                    formattedData[confKey].metropolitan.push(teamData);
                  }
                  // Central: Blackhawks, Avalanche, Stars, Wild, Predators, Blues, Jets
                  else if (['blackhawks', 'avalanche', 'stars', 'wild', 'predators', 'blues', 'jets'].includes(teamName)) {
                    formattedData[confKey].central.push(teamData);
                  }
                  // Pacific: Ducks, Flames, Oilers, Kings, Sharks, Kraken, Canucks, Golden Knights
                  else if (['ducks', 'flames', 'oilers', 'kings', 'sharks', 'kraken', 'canucks', 'golden knights'].includes(teamName)) {
                    formattedData[confKey].pacific.push(teamData);
                  }
                });

                // Calculer les wild cards
                allTeamsInConf.sort((a, b) => {
                  if (b.pts !== a.pts) return b.pts - a.pts;
                  if (b.row !== a.row) return b.row - a.row;
                  return b.gf - a.gf;
                });
                
                formattedData[confKey].wildcard = allTeamsInConf.slice(6, 8);
              }
            });
            
            console.log('Formatted NHL standings:', formattedData);
            setStandings(formattedData);
          }
        } catch (standingsError) {
          console.error('Classement NHL API erreur:', standingsError);
        }
        
      } catch (error) {
        console.error('Erreur lors du chargement NHL:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="loading"><h2>Chargement...</h2></div>;

  if (view === 'classement') {
    return <NHLStandings standingsData={standings} />;
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const renderGameLayout = (game) => {
    const competitors = game.competitions[0].competitors;
    const homeTeam = competitors.find(team => team.homeAway === 'home');
    const awayTeam = competitors.find(team => team.homeAway === 'away');

    return (
      <div className="match-inline">
        <div className="team-inline away">
          <img src={awayTeam.team.logo} alt={awayTeam.team.displayName} className="team-logo-inline" />
          <div className="team-details-inline">
            <h3>{awayTeam.team.abbreviation}</h3>
            {awayTeam.records && awayTeam.records[0] && (
              <div className="team-record-inline"><small>{awayTeam.records[0].summary}</small></div>
            )}
          </div>
          <div className="score-inline team-score">{awayTeam.score || '0'}</div>
        </div>
        
        <span className="vs-inline">vs</span>
        
        <div className="team-inline home">
          <div className="score-inline team-score">{homeTeam.score || '0'}</div>
          <div className="team-details-inline">
            <h3>{homeTeam.team.abbreviation}</h3>
            {homeTeam.records && homeTeam.records[0] && (
              <div className="team-record-inline"><small>{homeTeam.records[0].summary}</small></div>
            )}
          </div>
          <img src={homeTeam.team.logo} alt={homeTeam.team.displayName} className="team-logo-inline" />
        </div>
      </div>
    );
  };

  if (!data?.events || data.events.length === 0) {
    return (
      <div className="games-grid">
        <Card variant="sport" title="Aucun match NHL aujourd'hui" subtitle="Revenez plus tard pour voir les prochains matchs." />
      </div>
    );
  }

  return (
    <div className="games-grid">
      {data.events.map((game) => (
        <Card 
          key={game.id} 
          variant="sport"
          className="game-card"
          badge={game.status.type.state === 'in' ? 'LIVE' : !game.status.type.completed ? formatTime(game.date) : null}
        >
          <div className="game-header">
            <span className={`game-status ${game.status.type.state.toLowerCase()}`}>
              {game.status.type.description}
            </span>
            <span className="game-time">
              {game.status.type.completed ? 'Terminé' : 
                game.status.type.state === 'in' ? 
                  `${game.status.displayClock} ${game.status.period ? `- ${game.status.period}'` : ''}` :
                  formatTime(game.date)}
            </span>
          </div>
          {renderGameLayout(game)}
        </Card>
      ))}
    </div>
  );
};

export default NHL;
