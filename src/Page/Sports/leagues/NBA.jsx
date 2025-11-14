import React from 'react';
import AmericanSportLeague from '../../../Common/components/AmericanSportLeague';
import { nbaConfig } from '../../../Common/data/americanSportsConfig';

const NBA = ({ view = 'matches' }) => {
  return (
    <AmericanSportLeague 
      sportConfig={nbaConfig}
      StandingsComponent={NBAStandings}
      view={view}
    />
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