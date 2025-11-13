import React, { useState, useEffect } from 'react';
import NFLStandings from '../../../Common/components/NFLStandings';
import { currentNFLStandings } from '../../../Common/data/nflStandingsData';
import Card from '../../../Common/card';

const NFL = ({ view = 'matches' }) => {
  const [data, setData] = useState(null);
  const [standings, setStandings] = useState(currentNFLStandings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les matchs
        const matchesResponse = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard');
        const matchesData = await matchesResponse.json();
        console.log('NFL Matches Data:', matchesData);
        setData(matchesData);
        
        // Récupérer le classement
        try {
          const standingsResponse = await fetch('https://site.api.espn.com/apis/v2/sports/football/nfl/standings');
          const standingsData = await standingsResponse.json();
          
          console.log('NFL API Response:', standingsData);
          
          if (standingsData?.children) {
            const formattedData = {
              afc: { east: [], north: [], south: [], west: [] },
              nfc: { east: [], north: [], south: [], west: [] }
            };

            standingsData.children.forEach(conference => {
              console.log('Conference:', conference.name, conference.abbreviation);
              const confKey = conference.abbreviation.toLowerCase();
              
              // Les équipes sont directement dans standings.entries
              if (conference.standings?.entries) {
                conference.standings.entries.forEach(entry => {
                  const stats = entry.stats;
                  const wins = parseInt(stats.find(s => s.name === 'wins')?.value || 0);
                  const losses = parseInt(stats.find(s => s.name === 'losses')?.value || 0);
                  const ties = parseInt(stats.find(s => s.name === 'ties')?.value || 0);
                  
                  const teamData = {
                    team: entry.team.displayName,
                    wins: wins,
                    losses: losses,
                    ties: ties,
                    pct: ties > 0 ? (wins + ties * 0.5) / (wins + losses + ties) : (wins / (wins + losses || 1)),
                    pf: parseInt(stats.find(s => s.name === 'pointsFor')?.value || 0),
                    pa: parseInt(stats.find(s => s.name === 'pointsAgainst')?.value || 0),
                    home: stats.find(s => s.name === 'Home')?.displayValue || '0-0-0',
                    road: stats.find(s => s.name === 'Road')?.displayValue || '0-0-0',
                    div: stats.find(s => s.name === 'divisionRecord')?.displayValue || '0-0-0',
                    conf: stats.find(s => s.name === 'vs. Conf.')?.displayValue || '0-0-0',
                    strk: stats.find(s => s.name === 'streak')?.displayValue || '-'
                  };

                  // Déterminer la division à partir du nom de l'équipe
                  const teamName = entry.team.name.toLowerCase();
                  
                  // AFC East: Bills, Dolphins, Patriots, Jets
                  if (['bills', 'dolphins', 'patriots', 'jets'].includes(teamName)) {
                    formattedData[confKey].east.push(teamData);
                  }
                  // AFC North: Ravens, Bengals, Browns, Steelers
                  else if (['ravens', 'bengals', 'browns', 'steelers'].includes(teamName)) {
                    formattedData[confKey].north.push(teamData);
                  }
                  // AFC South: Colts, Texans, Jaguars, Titans
                  else if (['colts', 'texans', 'jaguars', 'titans'].includes(teamName)) {
                    formattedData[confKey].south.push(teamData);
                  }
                  // AFC West: Broncos, Chiefs, Raiders, Chargers
                  else if (['broncos', 'chiefs', 'raiders', 'chargers'].includes(teamName)) {
                    formattedData[confKey].west.push(teamData);
                  }
                  // NFC East: Cowboys, Giants, Eagles, Commanders
                  else if (['cowboys', 'giants', 'eagles', 'commanders'].includes(teamName)) {
                    formattedData[confKey].east.push(teamData);
                  }
                  // NFC North: Bears, Lions, Packers, Vikings
                  else if (['bears', 'lions', 'packers', 'vikings'].includes(teamName)) {
                    formattedData[confKey].north.push(teamData);
                  }
                  // NFC South: Falcons, Panthers, Saints, Buccaneers
                  else if (['falcons', 'panthers', 'saints', 'buccaneers'].includes(teamName)) {
                    formattedData[confKey].south.push(teamData);
                  }
                  // NFC West: Cardinals, Rams, 49ers, Seahawks
                  else if (['cardinals', 'rams', '49ers', 'seahawks'].includes(teamName)) {
                    formattedData[confKey].west.push(teamData);
                  }
                });
              }
            });
            
            console.log('Formatted standings:', formattedData);
            setStandings(formattedData);
          }
        } catch (standingsError) {
          console.error('Classement NFL API erreur:', standingsError);
        }
        
      } catch (error) {
        console.error('Erreur lors du chargement NFL:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="loading"><h2>Chargement...</h2></div>;

  if (view === 'classement') {
    return <NFLStandings standingsData={standings} />;
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
        <Card variant="sport" title="Aucun match NFL aujourd'hui" subtitle="Revenez plus tard pour voir les prochains matchs." />
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

export default NFL;
