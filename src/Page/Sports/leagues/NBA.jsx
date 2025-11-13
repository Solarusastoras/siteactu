import React, { useState, useEffect } from 'react';
import Card from '../../../Common/card';

const NBA = ({ view = 'matches' }) => {
  const [data, setData] = useState(null);
  const [standings, setStandings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les matchs
        const matchesResponse = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard');
        const matchesData = await matchesResponse.json();
        setData(matchesData);
        
        // Récupérer le classement
        try {
          const standingsResponse = await fetch('https://site.api.espn.com/apis/v2/sports/basketball/nba/standings');
          const standingsData = await standingsResponse.json();
          
          if (standingsData?.children) {
            const formattedData = {
              eastern: { atlantic: [], central: [], southeast: [] },
              western: { northwest: [], pacific: [], southwest: [] }
            };

            standingsData.children.forEach(conference => {
              const confKey = conference.name.toLowerCase().includes('east') ? 'eastern' : 'western';
              
              if (conference.standings?.entries) {
                conference.standings.entries.forEach(entry => {
                  const stats = entry.stats;
                  const wins = parseInt(stats.find(s => s.name === 'wins')?.value || 0);
                  const losses = parseInt(stats.find(s => s.name === 'losses')?.value || 0);
                  
                  const teamData = {
                    team: entry.team.name, // Surnom uniquement (Bulls, Spurs, etc.)
                    abbr: entry.team.abbreviation,
                    wins: wins,
                    losses: losses,
                    pct: (wins / (wins + losses || 1)).toFixed(3),
                    gb: stats.find(s => s.name === 'gamesBehind')?.displayValue || '-',
                    home: stats.find(s => s.name === 'Home')?.displayValue || '0-0',
                    road: stats.find(s => s.name === 'Road')?.displayValue || '0-0',
                    conf: stats.find(s => s.name === 'vs. Conf.')?.displayValue || '0-0',
                    div: stats.find(s => s.name === 'vs. Div.')?.displayValue || '0-0',
                    strk: stats.find(s => s.name === 'streak')?.displayValue || '-'
                  };

                  // Déterminer la division
                  const teamName = entry.team.name.toLowerCase();
                  
                  // Eastern Conference
                  // Atlantic: Celtics, Nets, Knicks, 76ers, Raptors
                  if (['celtics', 'nets', 'knicks', '76ers', 'raptors'].includes(teamName)) {
                    formattedData[confKey].atlantic.push(teamData);
                  }
                  // Central: Bulls, Cavaliers, Pistons, Pacers, Bucks
                  else if (['bulls', 'cavaliers', 'pistons', 'pacers', 'bucks'].includes(teamName)) {
                    formattedData[confKey].central.push(teamData);
                  }
                  // Southeast: Hawks, Hornets, Heat, Magic, Wizards
                  else if (['hawks', 'hornets', 'heat', 'magic', 'wizards'].includes(teamName)) {
                    formattedData[confKey].southeast.push(teamData);
                  }
                  
                  // Western Conference
                  // Northwest: Nuggets, Timberwolves, Thunder, Trail Blazers, Jazz
                  else if (['nuggets', 'timberwolves', 'thunder', 'trail blazers', 'jazz'].includes(teamName)) {
                    formattedData[confKey].northwest.push(teamData);
                  }
                  // Pacific: Warriors, Clippers, Lakers, Suns, Kings
                  else if (['warriors', 'clippers', 'lakers', 'suns', 'kings'].includes(teamName)) {
                    formattedData[confKey].pacific.push(teamData);
                  }
                  // Southwest: Mavericks, Rockets, Grizzlies, Pelicans, Spurs
                  else if (['mavericks', 'rockets', 'grizzlies', 'pelicans', 'spurs'].includes(teamName)) {
                    formattedData[confKey].southwest.push(teamData);
                  }
                });
              }
            });
            
            setStandings(formattedData);
          }
        } catch (standingsError) {
          console.error('Classement NBA API erreur:', standingsError);
        }
        
      } catch (error) {
        console.error('Erreur lors du chargement NBA:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="loading"><h2>Chargement...</h2></div>;

  if (view === 'classement' && standings) {
    return <NBAStandings standingsData={standings} />;
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
        <Card variant="sport" title="Aucun match NBA aujourd'hui" subtitle="Revenez plus tard pour voir les prochains matchs." />
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
                  `${game.status.displayClock} ${game.status.period ? `- Q${game.status.period}` : ''}` :
                  formatTime(game.date)}
            </span>
          </div>
          {renderGameLayout(game)}
        </Card>
      ))}
    </div>
  );
};

// Composant pour afficher le classement NBA
const NBAStandings = ({ standingsData }) => {
  const renderDivision = (divisionName, teams, conference) => {
    const sortedTeams = [...teams].sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.losses - b.losses;
    });

    const divisionTitles = {
      atlantic: 'Atlantic',
      central: 'Central',
      southeast: 'Southeast',
      northwest: 'Northwest',
      pacific: 'Pacific',
      southwest: 'Southwest'
    };

    return (
      <div className="nba-division" key={`${conference}-${divisionName}`}>
        <h3 className="division-title">{divisionTitles[divisionName]}</h3>
        <div className="standings-table nba-table">
          <div className="standings-header">
            <div className="team-col">Équipe</div>
            <div>V</div>
            <div>D</div>
            <div>%</div>
            <div>GB</div>
            <div>HOME</div>
            <div>ROAD</div>
          </div>
          {sortedTeams.map((team, index) => (
            <div key={team.abbr} className="standings-row">
              <div className="team-info team-col">
                <span className="position-indicator">{index + 1}</span>
                <span className="team-name">{team.team}</span>
              </div>
              <div className="stat-wins">{team.wins}</div>
              <div className="stat-losses">{team.losses}</div>
              <div className="stat-pct">{team.pct}</div>
              <div className="stat-gb">{team.gb}</div>
              <div className="stat-home">{team.home}</div>
              <div className="stat-road">{team.road}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderConference = (conferenceName, conferenceData) => {
    return (
      <div className="nba-conference" key={conferenceName}>
        <h2 className="conference-title">
          {conferenceName === 'eastern' ? '🏀 EASTERN CONFERENCE' : '🏀 WESTERN CONFERENCE'}
        </h2>
        <div className="divisions-grid">
          {conferenceName === 'eastern' ? (
            <>
              {renderDivision('atlantic', conferenceData.atlantic, conferenceName)}
              {renderDivision('central', conferenceData.central, conferenceName)}
              {renderDivision('southeast', conferenceData.southeast, conferenceName)}
            </>
          ) : (
            <>
              {renderDivision('northwest', conferenceData.northwest, conferenceName)}
              {renderDivision('pacific', conferenceData.pacific, conferenceName)}
              {renderDivision('southwest', conferenceData.southwest, conferenceName)}
            </>
          )}
        </div>
      </div>
    );
  };

  if (!standingsData) {
    return (
      <div className="standings-container">
        <p>Chargement des classements NBA...</p>
      </div>
    );
  }

  return (
    <div className="standings-container nba-standings">
      {renderConference('eastern', standingsData.eastern)}
      {renderConference('western', standingsData.western)}
      
      <div className="standings-legend nba-legend">
        <div className="legend-note">
          <strong>Note:</strong> En NBA, les 6 premiers de chaque conférence + 2 équipes play-in se qualifient pour les playoffs (16 équipes au total)
        </div>
        <div className="legend-abbreviations">
          <p><strong>Abréviations:</strong></p>
          <p>V = Victoires | D = Défaites | % = Pourcentage de victoires | GB = Games Behind (retard)</p>
          <p>HOME = Record à domicile | ROAD = Record à l'extérieur</p>
        </div>
      </div>
    </div>
  );
};

export default NBA;