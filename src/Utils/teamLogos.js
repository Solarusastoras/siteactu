// Configuration des logos locaux pour les équipes NBA, NFL, NHL
// Les logos doivent être placés dans src/Utils/Img/Logos/

const LOGO_BASE_PATH = '/actu/static/media';

export const NHL_LOGOS = {
  // Eastern Conference
  'Washington Capitals': `${LOGO_BASE_PATH}/capitals.png`,
  'New Jersey Devils': `${LOGO_BASE_PATH}/devils.png`,
  'Carolina Hurricanes': `${LOGO_BASE_PATH}/hurricanes.png`,
  'Tampa Bay Lightning': `${LOGO_BASE_PATH}/lightning.png`,
  'New York Islanders': `${LOGO_BASE_PATH}/islanders.png`,
  'Detroit Red Wings': `${LOGO_BASE_PATH}/redwings.png`,
  'Ottawa Senators': `${LOGO_BASE_PATH}/senators.png`,
  'Florida Panthers': `${LOGO_BASE_PATH}/panthers.png`,
  'Toronto Maple Leafs': `${LOGO_BASE_PATH}/mapleleafs.png`,
  'New York Rangers': `${LOGO_BASE_PATH}/rangers.png`,
  'Boston Bruins': `${LOGO_BASE_PATH}/bruins.png`,
  'Philadelphia Flyers': `${LOGO_BASE_PATH}/flyers.png`,
  'Pittsburgh Penguins': `${LOGO_BASE_PATH}/penguins.png`,
  'Columbus Blue Jackets': `${LOGO_BASE_PATH}/bluejackets.png`,
  'Montreal Canadiens': `${LOGO_BASE_PATH}/canadiens.png`,
  'Buffalo Sabres': `${LOGO_BASE_PATH}/sabres.png`,
  
  // Western Conference
  'Winnipeg Jets': `${LOGO_BASE_PATH}/jets.png`,
  'Minnesota Wild': `${LOGO_BASE_PATH}/wild.png`,
  'Dallas Stars': `${LOGO_BASE_PATH}/stars.png`,
  'Vegas Golden Knights': `${LOGO_BASE_PATH}/goldenknights.png`,
  'Los Angeles Kings': `${LOGO_BASE_PATH}/kings.png`,
  'Vancouver Canucks': `${LOGO_BASE_PATH}/canucks.png`,
  'Colorado Avalanche': `${LOGO_BASE_PATH}/avalanche.png`,
  'Calgary Flames': `${LOGO_BASE_PATH}/flames.png`,
  'Edmonton Oilers': `${LOGO_BASE_PATH}/oilers.png`,
  'Utah Mammoth': `${LOGO_BASE_PATH}/utah.png`,
  'St. Louis Blues': `${LOGO_BASE_PATH}/blues.png`,
  'Seattle Kraken': `${LOGO_BASE_PATH}/kraken.png`,
  'Nashville Predators': `${LOGO_BASE_PATH}/predators.png`,
  'San Jose Sharks': `${LOGO_BASE_PATH}/sharks.png`,
  'Anaheim Ducks': `${LOGO_BASE_PATH}/ducks.png`,
  'Chicago Blackhawks': `${LOGO_BASE_PATH}/blackhawks.png`
};

export const NBA_LOGOS = {
  // Eastern Conference
  'Cleveland Cavaliers': `${LOGO_BASE_PATH}/cavaliers.png`,
  'Boston Celtics': `${LOGO_BASE_PATH}/celtics.png`,
  'New York Knicks': `${LOGO_BASE_PATH}/knicks.png`,
  'Orlando Magic': `${LOGO_BASE_PATH}/magic.png`,
  'Miami Heat': `${LOGO_BASE_PATH}/heat.png`,
  'Atlanta Hawks': `${LOGO_BASE_PATH}/hawks.png`,
  'Detroit Pistons': `${LOGO_BASE_PATH}/pistons.png`,
  'Brooklyn Nets': `${LOGO_BASE_PATH}/nets.png`,
  'Indiana Pacers': `${LOGO_BASE_PATH}/pacers.png`,
  'Chicago Bulls': `${LOGO_BASE_PATH}/bulls.png`,
  'Milwaukee Bucks': `${LOGO_BASE_PATH}/bucks.png`,
  'Charlotte Hornets': `${LOGO_BASE_PATH}/hornets.png`,
  'Philadelphia 76ers': `${LOGO_BASE_PATH}/76ers.png`,
  'Toronto Raptors': `${LOGO_BASE_PATH}/raptors.png`,
  'Washington Wizards': `${LOGO_BASE_PATH}/wizards.png`,
  
  // Western Conference
  'Oklahoma City Thunder': `${LOGO_BASE_PATH}/thunder.png`,
  'Golden State Warriors': `${LOGO_BASE_PATH}/warriors.png`,
  'Houston Rockets': `${LOGO_BASE_PATH}/rockets.png`,
  'Dallas Mavericks': `${LOGO_BASE_PATH}/mavericks.png`,
  'Los Angeles Lakers': `${LOGO_BASE_PATH}/lakers.png`,
  'Phoenix Suns': `${LOGO_BASE_PATH}/suns.png`,
  'Memphis Grizzlies': `${LOGO_BASE_PATH}/grizzlies.png`,
  'Minnesota Timberwolves': `${LOGO_BASE_PATH}/timberwolves.png`,
  'Denver Nuggets': `${LOGO_BASE_PATH}/nuggets.png`,
  'Los Angeles Clippers': `${LOGO_BASE_PATH}/clippers.png`,
  'Sacramento Kings': `${LOGO_BASE_PATH}/kings-nba.png`,
  'San Antonio Spurs': `${LOGO_BASE_PATH}/spurs.png`,
  'Portland Trail Blazers': `${LOGO_BASE_PATH}/blazers.png`,
  'Utah Jazz': `${LOGO_BASE_PATH}/jazz.png`,
  'New Orleans Pelicans': `${LOGO_BASE_PATH}/pelicans.png`
};

export const NFL_LOGOS = {
  // NFC
  'Detroit Lions': `${LOGO_BASE_PATH}/lions.png`,
  'Philadelphia Eagles': `${LOGO_BASE_PATH}/eagles.png`,
  'Minnesota Vikings': `${LOGO_BASE_PATH}/vikings.png`,
  'Green Bay Packers': `${LOGO_BASE_PATH}/packers.png`,
  'Washington Commanders': `${LOGO_BASE_PATH}/commanders.png`,
  'Atlanta Falcons': `${LOGO_BASE_PATH}/falcons.png`,
  'Seattle Seahawks': `${LOGO_BASE_PATH}/seahawks.png`,
  'Arizona Cardinals': `${LOGO_BASE_PATH}/cardinals.png`,
  'Tampa Bay Buccaneers': `${LOGO_BASE_PATH}/buccaneers.png`,
  'San Francisco 49ers': `${LOGO_BASE_PATH}/49ers.png`,
  'Los Angeles Rams': `${LOGO_BASE_PATH}/rams.png`,
  'Chicago Bears': `${LOGO_BASE_PATH}/bears.png`,
  'Dallas Cowboys': `${LOGO_BASE_PATH}/cowboys.png`,
  'New Orleans Saints': `${LOGO_BASE_PATH}/saints.png`,
  'Carolina Panthers': `${LOGO_BASE_PATH}/panthers-nfl.png`,
  'New York Giants': `${LOGO_BASE_PATH}/giants.png`,
  
  // AFC
  'Kansas City Chiefs': `${LOGO_BASE_PATH}/chiefs.png`,
  'Buffalo Bills': `${LOGO_BASE_PATH}/bills.png`,
  'Pittsburgh Steelers': `${LOGO_BASE_PATH}/steelers.png`,
  'Los Angeles Chargers': `${LOGO_BASE_PATH}/chargers.png`,
  'Denver Broncos': `${LOGO_BASE_PATH}/broncos.png`,
  'Baltimore Ravens': `${LOGO_BASE_PATH}/ravens.png`,
  'Houston Texans': `${LOGO_BASE_PATH}/texans.png`,
  'Cincinnati Bengals': `${LOGO_BASE_PATH}/bengals.png`,
  'Miami Dolphins': `${LOGO_BASE_PATH}/dolphins.png`,
  'Indianapolis Colts': `${LOGO_BASE_PATH}/colts.png`,
  'New York Jets': `${LOGO_BASE_PATH}/jets-nfl.png`,
  'Cleveland Browns': `${LOGO_BASE_PATH}/browns.png`,
  'New England Patriots': `${LOGO_BASE_PATH}/patriots.png`,
  'Jacksonville Jaguars': `${LOGO_BASE_PATH}/jaguars.png`,
  'Tennessee Titans': `${LOGO_BASE_PATH}/titans.png`,
  'Las Vegas Raiders': `${LOGO_BASE_PATH}/raiders.png`
};
