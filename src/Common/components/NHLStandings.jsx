
import React from 'react';
import './NHLStandings.scss';

/**
 * Composant pour afficher le classement NHL
 * Support des formats: SofaScore (conferences avec name/standings) et ESPN (conferences)
 */
const NHLStandings = ({ standingsData }) => {
    // Si standingsData est un tableau de conférences (ex: [{name, standings: [...]}, ...]), on le transforme en tableau plat d'équipes
    let normalizedStandings = standingsData;
    // Cas 1 : format [{name, standings: [...]}, ...] (SofaScore/ESPN)
    if (
      Array.isArray(standingsData) &&
      standingsData.length > 0 &&
      standingsData[0]?.standings &&
      Array.isArray(standingsData[0].standings)
    ) {
      normalizedStandings = standingsData.flatMap(conf => conf.standings);
    }
    // Cas 2 : format {eastern: [...], western: [...]} (comme nhl-initial-standings.js)
    else if (
      standingsData &&
      typeof standingsData === 'object' &&
      Array.isArray(standingsData.eastern) &&
      Array.isArray(standingsData.western)
    ) {
      normalizedStandings = [...standingsData.eastern, ...standingsData.western];
    }
    // Si ce n'est pas un tableau, on force un tableau vide pour éviter les erreurs
    if (!Array.isArray(normalizedStandings)) {
      normalizedStandings = [];
    }

    // Debug : afficher la liste des noms d'équipes détectés
    if (normalizedStandings.length > 0) {
      console.log('Noms d\'équipes détectés :', normalizedStandings.map(t => t.team));
    }
  
  if (!standingsData || !Array.isArray(standingsData) || standingsData.length === 0) {
    return (
      <div className="standings-container">
        <p className="no-data">Classements NHL non disponibles pour le moment</p>
      </div>
    );
  }

  // Fonction pour extraire le surnom (dernier mot)
  const getTeamNickname = (fullName) => {
    if (!fullName) return '';
    const words = fullName.trim().split(' ');
    return words[words.length - 1];
  };


    // Mapping équipe → division (2025-2026, à adapter si besoin)
    const divisionMap = {
      // Atlantique
      "Lightning de Tampa Bay": "Atlantic",
      "Tampa Bay Lightning": "Atlantic",
      "Canadiens de Montréal": "Atlantic",
      "Montreal Canadiens": "Atlantic",
      "Sénateurs d'Ottawa": "Atlantic",
      "Ottawa Senators": "Atlantic",
      "Bruins de Boston": "Atlantic",
      "Boston Bruins": "Atlantic",
      "Red Wings de Detroit": "Atlantic",
      "Detroit Red Wings": "Atlantic",
      "Panthers de la Floride": "Atlantic",
      "Florida Panthers": "Atlantic",
      "Maple Leafs de Toronto": "Atlantic",
      "Toronto Maple Leafs": "Atlantic",
      "Sabres de Buffalo": "Atlantic",
      "Buffalo Sabres": "Atlantic",
      // Métropolitaine
      "Devils du New Jersey": "Metropolitan",
      "New Jersey Devils": "Metropolitan",
      "Hurricanes de la Caroline": "Metropolitan",
      "Carolina Hurricanes": "Metropolitan",
      "Capitals de Washington": "Metropolitan",
      "Washington Capitals": "Metropolitan",
      "Penguins de Pittsburgh": "Metropolitan",
      "Pittsburgh Penguins": "Metropolitan",
      "Flyers de Philadelphie": "Metropolitan",
      "Philadelphia Flyers": "Metropolitan",
      "Islanders de New York": "Metropolitan",
      "New York Islanders": "Metropolitan",
      "Rangers de New York": "Metropolitan",
      "New York Rangers": "Metropolitan",
      "Blue Jackets de Columbus": "Metropolitan",
      "Columbus Blue Jackets": "Metropolitan",
      // Centrale
      "Avalanche du Colorado": "Central",
      "Colorado Avalanche": "Central",
      "Stars de Dallas": "Central",
      "Dallas Stars": "Central",
      "Wild du Minnesota": "Central",
      "Minnesota Wild": "Central",
      "Mammoth de l'Utah": "Central",
      "Utah Mammoth": "Central",
      "Blackhawks de Chicago": "Central",
      "Chicago Blackhawks": "Central",
      "Jets de Winnipeg": "Central",
      "Winnipeg Jets": "Central",
      "Blues de St. Louis": "Central",
      "St. Louis Blues": "Central",
      "Predators de Nashville": "Central",
      "Nashville Predators": "Central",
      // Pacifique
      "Ducks d'Anaheim": "Pacific",
      "Anaheim Ducks": "Pacific",
      "Kings de Los Angeles": "Pacific",
      "Los Angeles Kings": "Pacific",
      "Kraken de Seattle": "Pacific",
      "Seattle Kraken": "Pacific",
      "Golden Knights de Vegas": "Pacific",
      "Vegas Golden Knights": "Pacific",
      "Sharks de San Jose": "Pacific",
      "San Jose Sharks": "Pacific",
      "Oilers d'Edmonton": "Pacific",
      "Edmonton Oilers": "Pacific",
      "Canucks de Vancouver": "Pacific",
      "Vancouver Canucks": "Pacific",
      "Flames de Calgary": "Pacific",
      "Calgary Flames": "Pacific"
    };

    // Debug temporaire : afficher les équipes non reconnues par le mapping
    const unknownTeams = Array.isArray(normalizedStandings)
      ? normalizedStandings.filter(t => t.team && !divisionMap[t.team])
      : [];

    if (unknownTeams.length > 0) {
      console.warn('Équipes non reconnues par le mapping divisionMap:', unknownTeams.map(t => t.team));
    }

    // Utilitaire pour classement par division et wild cards
    // Affiche les valeurs du fichier telles quelles (pas de calcul dynamique)
    function getNHLDivisionsAndWildcards(teams, conferenceDivisions) {
      // Regroupe par division
      const divisions = {};
      for (const div of conferenceDivisions) divisions[div] = [];
      teams.forEach(team => {
        const div = divisionMap[team.team] || team.division;
        if (div && divisions[div]) divisions[div].push(team);
      });
      // Trie chaque division par points
      for (const div of conferenceDivisions) {
        divisions[div].sort((a, b) => b.points - a.points);
      }
      // Sélectionne les 3 premiers de chaque division
      const qualified = [];
      const wildCardPool = [];
      for (const div of conferenceDivisions) {
        qualified.push(...divisions[div].slice(0, 3).map((t, i) => ({...t, playoffType: 'division1-playoff', division: div, divisionRank: i+1})));
        wildCardPool.push(...divisions[div].slice(3));
      }
      // Trie le pool wild card par points et prend les 2 meilleurs
      wildCardPool.sort((a, b) => b.points - a.points);
      const wildcards = wildCardPool.slice(0, 2).map((t, i) => ({...t, playoffType: 'wildcard-playoff', wildcardRank: i+1, division: divisionMap[t.team] }));
      // Marque les autres comme non qualifiés
      const notQualified = wildCardPool.slice(2).map(t => ({...t, playoffType: '', division: divisionMap[t.team]}));
      // Retourne la structure pour affichage
      return {
        divisions,
        qualified,
        wildcards,
        notQualified
      };
    }

    // Classe CSS selon le type playoff
    const getPlayoffClass = (playoffType) => {
      if (playoffType === 'division1-playoff') return 'standings-row division1-playoff';
      if (playoffType === 'wildcard-playoff') return 'standings-row wildcard-playoff';
      return 'standings-row';
    };


  // Si données brutes (tableau plat), on applique la logique division/wildcard
  if (Array.isArray(normalizedStandings) && normalizedStandings[0]?.team) {
    // Séparation Est/Ouest
    const eastDivisions = ["Atlantic", "Metropolitan"];
    const westDivisions = ["Central", "Pacific"];
    // Filtrage par conférence (à adapter si besoin)
    const eastTeams = normalizedStandings.filter(t => eastDivisions.includes(divisionMap[t.team]));
    const westTeams = normalizedStandings.filter(t => westDivisions.includes(divisionMap[t.team]));
    const east = getNHLDivisionsAndWildcards(eastTeams, eastDivisions);
    const west = getNHLDivisionsAndWildcards(westTeams, westDivisions);

    // Affiche SEULEMENT les 3 premiers de la division
    const renderDivisionTable = (divisionName, teams) => (
      <div className="nhl-division-block" key={divisionName}>
        <h3 className="division-title">{divisionName}</h3>
        <div className="standings-table nhl-table">
          <div className="standings-header">
            <div className="position-col">#</div>
            <div className="team-col">Équipe</div>
            <div>J</div>
            <div>V</div>
            <div>D</div>
            <div>DP</div>
            <div>PTS</div>
          </div>
          {teams.slice(0, 3).map((entry, idx) => (
            <div key={entry.team} className={getPlayoffClass(entry.playoffType)}>
              <div className="position-col">{idx + 1}</div>
              <div className="team-info team-col">
                <span className="team-name">{getTeamNickname(entry.team)}</span>
              </div>
              <div className="stat-gp">{entry.played}</div>
              <div className="stat-wins">{entry.wins}</div>
              <div className="stat-losses">{entry.losses}</div>
              <div className="stat-ties">{entry.otLosses}</div>
              <div className="stat-pts">{entry.points}</div>
            </div>
          ))}
        </div>
      </div>
    );

    // Affiche les wild cards avec position 7 et 8
    const renderWildCardTable = (title, teams, offset = 6) => (
      <div className="nhl-division-block" key={title}>
        <h3 className="division-title">{title}</h3>
        <div className="standings-table nhl-table">
          <div className="standings-header">
            <div className="position-col">#</div>
            <div className="team-col">Équipe</div>
            <div>J</div>
            <div>V</div>
            <div>D</div>
            <div>DP</div>
            <div>PTS</div>
          </div>
          {teams.map((entry, idx) => (
            <div key={entry.team} className={getPlayoffClass(entry.playoffType)}>
              <div className="position-col">{offset + idx + 1}</div>
              <div className="team-info team-col">
                <span className="team-name">{getTeamNickname(entry.team)}</span>
              </div>
              <div className="stat-gp">{entry.played}</div>
              <div className="stat-wins">{entry.wins}</div>
              <div className="stat-losses">{entry.losses}</div>
              <div className="stat-ties">{entry.otLosses}</div>
              <div className="stat-pts">{entry.points}</div>
            </div>
          ))}
        </div>
      </div>
    );

    // Tableau pour le reste du classement (hors top 3 division et wild cards), positions 9 à 16
    const renderRestTable = (title, teams, offset = 8) => (
      <div className="nhl-division-block" key={title}>
        <h3 className="division-title">{title}</h3>
        <div className="standings-table nhl-table">
          <div className="standings-header">
            <div className="position-col">#</div>
            <div className="team-col">Équipe</div>
            <div>J</div>
            <div>V</div>
            <div>D</div>
            <div>DP</div>
            <div>PTS</div>
          </div>
          {teams.map((entry, idx) => (
            <div key={entry.team} className="standings-row">
              <div className="position-col">{offset + idx + 1}</div>
              <div className="team-info team-col">
                <span className="team-name">{getTeamNickname(entry.team)}</span>
              </div>
              <div className="stat-gp">{entry.played}</div>
              <div className="stat-wins">{entry.wins}</div>
              <div className="stat-losses">{entry.losses}</div>
              <div className="stat-ties">{entry.otLosses}</div>
              <div className="stat-pts">{entry.points}</div>
            </div>
          ))}
        </div>
      </div>
    );

    // Construction du "reste du classement" (hors top 3 division et wild cards)
    function getRestOfConference(conference, divisions, wildcards) {
      // Récupère tous les top 3 division et wild cards (par team)
      const qualifiedTeams = new Set([
        ...divisions.flatMap(div => conference.divisions[div].slice(0, 3).map(t => t.team)),
        ...conference.wildcards.map(t => t.team)
      ]);
      // Prend toutes les équipes de la conférence qui ne sont pas qualifiées
      const allTeams = divisions.flatMap(div => conference.divisions[div]);
      return allTeams.filter(t => !qualifiedTeams.has(t.team)).sort((a, b) => b.points - a.points);
    }

    return (
      <div className="standings-container nhl-standings">
        <h2 className="conference-title">Conférence Est</h2>
        {eastDivisions.map(div => renderDivisionTable(div, east.divisions[div]))}
        {renderWildCardTable('Wild Cards', east.wildcards, 6)}
        {renderRestTable('Le reste du classement', getRestOfConference(east, eastDivisions, east.wildcards), 8)}
        <h2 className="conference-title">Conférence Ouest</h2>
        {westDivisions.map(div => renderDivisionTable(div, west.divisions[div]))}
        {renderWildCardTable('Wild Cards', west.wildcards, 6)}
        {renderRestTable('Le reste du classement', getRestOfConference(west, westDivisions, west.wildcards), 8)}
        <div className="standings-legend nhl-legend">
          <>
            <div className="legend-item division1-playoff">🏆 Top 3 division - Qualifié automatiquement</div>
            <div className="legend-item wildcard-playoff">🎟️ Wild Card - Qualifié (2 meilleurs restants par conférence)</div>
            <div className="legend-note">
              <strong>Système de qualification:</strong> 16 équipes aux playoffs - 3 meilleures de chaque division (12) + 2 wild cards par conférence (4)
            </div>
            <div className="legend-abbreviations">
              <p><strong>Abréviations:</strong></p>
              <p>J = Matchs joués | V = Victoires | D = Défaites | DP = Défaites prolongation | PTS = Points</p>
            </div>
          </>
        </div>
      </div>
    );
  }


  // Détection du format de données SofaScore flat (ancien format)
  const isSofaScoreFormat = standingsData[0]?.position !== undefined && 
    typeof standingsData[0].position === 'number';

  // Format SofaScore (flat array)
  if (isSofaScoreFormat) {
    return (
      <div className="standings-container nhl-standings">
        <h2 className="conference-title">🏒 NHL</h2>
        <div className="standings-table nhl-table">
          <div className="standings-header">
            <div className="position-col">#</div>
            <div className="team-col">Équipe</div>
            <div>J</div>
            <div>V</div>
            <div>D</div>
            <div>N</div>
            <div>PTS</div>
          </div>
          {standingsData.map((entry) => {
            const isPlayoffSpot = entry.position <= 16; // Top 16
            
            return (
              <div 
                key={entry.teamId} 
                className={`standings-row ${isPlayoffSpot ? 'playoff-spot' : ''}`}
              >
                <div className="position-col">{entry.position}</div>
                <div className="team-info team-col">
                  {entry.logo && (
                    <img 
                      src={entry.logo} 
                      alt={entry.team} 
                      className="team-logo-small"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <span className="team-name">{getTeamNickname(entry.team)}</span>
                </div>
                <div className="stat-gp">{entry.played}</div>
                <div className="stat-wins">{entry.wins}</div>
                <div className="stat-losses">{entry.losses}</div>
                <div className="stat-ties">{entry.draws || 0}</div>
                <div className="stat-pts">{entry.points}</div>
                <div className={`stat-diff ${entry.goalDifference > 0 ? 'positive' : entry.goalDifference < 0 ? 'negative' : ''}`}>
                  {entry.goalDifference > 0 ? '+' : ''}{entry.goalDifference}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="standings-legend nhl-legend">
          <div className="legend-item playoff-spot">🏆 Qualifié pour les playoffs (Top 8 par conférence)</div>
          <div className="legend-abbreviations">
            <p><strong>Abréviations:</strong></p>
            <p>J = Matchs joués | V = Victoires | D = Défaites | N = Nuls | PTS = Points | +/- = Différentiel de buts</p>
          </div>
        </div>
      </div>
    );
  }

  // Format ESPN (conferences)
  const renderConference = (conference) => {
    if (!conference || !conference.standings || conference.standings.length === 0) {
      return null;
    }

    const sortedTeams = [...conference.standings].sort((a, b) => {
      if (a.stats?.playoffSeed && b.stats?.playoffSeed) {
        return a.stats.playoffSeed - b.stats.playoffSeed;
      }
      return (b.stats?.points || 0) - (a.stats?.points || 0);
    });

    return (
      <div className="nhl-conference" key={conference.abbreviation}>
        <h2 className="conference-title">
          🏒 {conference.name}
        </h2>
        <div className="standings-table nhl-table">
          <div className="standings-header">
            <div className="position-col">#</div>
            <div className="team-col">Équipe</div>
            <div>J</div>
            <div>PTS</div>
            <div>V</div>
            <div>D</div>
            <div>OTL</div>
          </div>
          {sortedTeams.map((entry, index) => {
            const team = entry.team || {};
            const stats = entry.stats || {};
            const position = stats.playoffSeed || (index + 1);
            const isPlayoffSpot = position <= 8;
            
            return (
              <div 
                key={team.id || entry.abbr || index} 
                className={`standings-row ${isPlayoffSpot ? 'playoff-spot' : ''}`}
              >
                <div className="position-col">{position}</div>
                <div className="team-info team-col">
                  {team.logo && (
                    <img 
                      src={team.logo} 
                      alt={team.shortName || team.name} 
                      className="team-logo-small"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <span className="team-name">{getTeamNickname(team.shortName || team.name || entry.team)}</span>
                </div>
                <div className="stat-gp">{stats.gamesPlayed || stats.GP || 0}</div>
                <div className="stat-pts">{stats.points || stats.PTS || 0}</div>
                <div className="stat-wins">{stats.wins || stats.W || 0}</div>
                <div className="stat-losses">{stats.losses || stats.L || 0}</div>
                <div className="stat-otl">{stats.otLosses || stats.OTL || 0}</div>
                <div className={`stat-diff ${(stats.goalDifferential || 0) > 0 ? 'positive' : (stats.goalDifferential || 0) < 0 ? 'negative' : ''}`}>
                  {(stats.goalDifferential || 0) > 0 ? '+' : ''}{stats.goalDifferential || 0}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="standings-container nhl-standings">
      {standingsData.map(conference => renderConference(conference))}
      
      <div className="standings-legend nhl-legend">
        <div className="legend-item playoff-spot">🏆 Qualifié pour les playoffs (Top 8 par conférence)</div>
        <div className="legend-note">
          <strong>Note:</strong> En NHL, les 3 premiers de chaque division + 2 wild cards par conférence se qualifient pour les playoffs
        </div>
        <div className="legend-abbreviations">
          <p><strong>Abréviations:</strong></p>
          <p>J = Matchs joués | PTS = Points (2 pts victoire, 1 pt défaite OT/SO) | V = Victoires | D = Défaites | OTL = Défaites en prolongation/fusillade | +/- = Différentiel de buts</p>
        </div>
      </div>
    </div>
  );
};

export default NHLStandings;