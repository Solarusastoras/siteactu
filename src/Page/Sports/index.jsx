import React, { useState } from 'react';
import Ligue1Logo from '../../Utils/Img/Ligue1.jpg';
import Ligue2Logo from '../../Utils/Img/Ligue2.png';
import LigaSantenderLogo from '../../Utils/Img/LaLiga_Santander.png';
import PremierLeagueLogo from '../../Utils/Img/PremierLeague.jpg';
import SerieALogo from '../../Utils/Img/SerieA.png';
import BundesligaLogo from '../../Utils/Img/Bundesliga.png';
import BrasilLogo from '../../Utils/Img/Brasil.png';
import NFLLogo from '../../Utils/Img/NFL.png';
import NHLLogo from '../../Utils/Img/NHL.png';
import MercatoFootLogo from '../../Utils/Img/MercatoFoot.png';
import WorldCupLogo from '../../Utils/Img/WorldCup.png';
import LogoCan from '../../Utils/Img/LogoCan.png';
import EuroLogo from '../../Utils/Img/UEFA_Logo.png';
import ChampionLeagueLogo from '../../Utils/Img/ChampionsLeague.png';


import {
  MercatoFoot,
  Ligue1,
  Ligue2,
  PremierLeague,
  LaLiga,
  SerieA,
  Bundesliga,
  Brasileirao,
  NHL,
  NFL,
  NBA,
  WorldCup,
  AfricNationCup,
  EuropeCup,
  ChampionLeague
} from '../../Common/leagues';

const AllSports = () => {
  const [activeTab, setActiveTab] = useState('football');
  const [footballLeague, setFootballLeague] = useState('mercato');
  const [footballView, setFootballView] = useState('matches');
  const [basketView, setBasketView] = useState('matches');
  const [nhlView, setNhlView] = useState('matches');
  const [nflView, setNflView] = useState('matches');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderLeagueComponent = () => {
    const leagueComponents = {
      mercato: <MercatoFoot />,
      ligue1: <Ligue1 view={footballView} />,
      ligue2: <Ligue2 view={footballView} />,
      premier: <PremierLeague view={footballView} />,
      laliga: <LaLiga view={footballView} />,
      seriea: <SerieA view={footballView} />,
      bundesliga: <Bundesliga view={footballView} />,
      brasileirao: <Brasileirao view={footballView} />,
      championleague: <ChampionLeague view={footballView} />,
      worldcup: <WorldCup view={footballView} />,
      africnationcup: <AfricNationCup view={footballView} />,
      europecup: <EuropeCup view={footballView} />
    };

    return leagueComponents[footballLeague];
  };

  return (
    <div className="sports-container">
      <header className="sports-header">
        <h1>Sports</h1>
        <p className="date">{formatDate(new Date())}</p>
      </header>

      <nav className="sports-tabs">
        <button 
          className={`tab ${activeTab === 'football' ? 'active' : ''}`}
          onClick={() => setActiveTab('football')}
        >
          ⚽ Football
        </button>
        <button 
          className={`tab ${activeTab === 'basket' ? 'active' : ''}`}
          onClick={() => setActiveTab('basket')}
        >
          🏀 NBA
        </button>
        <button 
          className={`tab ${activeTab === 'nhl' ? 'active' : ''}`}
          onClick={() => setActiveTab('nhl')}
        >
          <img src={NHLLogo} alt="NHL" style={{width: '24px', height: '24px', objectFit: 'contain'}} /> NHL
        </button>
        <button 
          className={`tab ${activeTab === 'nfl' ? 'active' : ''}`}
          onClick={() => setActiveTab('nfl')}
        >
          <img src={NFLLogo} alt="NFL" style={{width: '24px', height: '24px', objectFit: 'contain'}} /> NFL
        </button>
      </nav>

      {activeTab === 'football' && (
        <div className="football-leagues">
          <div className="league-tabs">
            <button 
              className={`control-btn ${footballLeague === 'mercato' ? 'active' : ''}`}
              onClick={() => setFootballLeague('mercato')}
            >
              <img src={MercatoFootLogo} alt="Mercato Foot" className="league-logo" />
            </button>
            <button 
              className={`control-btn ${footballLeague === 'ligue1' ? 'active' : ''}`}
              onClick={() => setFootballLeague('ligue1')}
            >
              <img src={Ligue1Logo} alt="Ligue 1" className="league-logo" />
            </button>
            <button 
              className={`control-btn ${footballLeague === 'ligue2' ? 'active' : ''}`}
              onClick={() => setFootballLeague('ligue2')}
            >
              <img src={Ligue2Logo} alt="Ligue 2" className="league-logo" />
            </button>
            <button 
              className={`control-btn ${footballLeague === 'premier' ? 'active' : ''}`}
              onClick={() => setFootballLeague('premier')}
            >
              <img src={PremierLeagueLogo} alt="Premier League" className="league-logo" />
            </button>
            <button 
              className={`control-btn ${footballLeague === 'laliga' ? 'active' : ''}`}
              onClick={() => setFootballLeague('laliga')}
            >
              <img src={LigaSantenderLogo} alt="La Liga" className="league-logo" />
            </button>
            <button 
              className={`control-btn ${footballLeague === 'seriea' ? 'active' : ''}`}
              onClick={() => setFootballLeague('seriea')}
            >
              <img src={SerieALogo} alt="Serie A" className="league-logo" />
            </button>
            <button 
              className={`control-btn ${footballLeague === 'bundesliga' ? 'active' : ''}`}
              onClick={() => setFootballLeague('bundesliga')}
            >
              <img src={BundesligaLogo} alt="Bundesliga" className="league-logo" />
            </button>
            <button 
              className={`control-btn ${footballLeague === 'brasileirao' ? 'active' : ''}`}
              onClick={() => setFootballLeague('brasileirao')}
            >
              <img src={BrasilLogo} alt="Brasileirão" className="league-logo" />
            </button>
            <button
              className={`control-btn ${footballLeague === 'championleague' ? 'active' : ''}`}
              onClick={() => setFootballLeague('championleague')}
            >
              <img src={ChampionLeagueLogo} alt="Champion League" className="league-logo" />
            </button>
            <button 
              className={`control-btn ${footballLeague === 'worldcup' ? 'active' : ''}`}
              onClick={() => setFootballLeague('worldcup')}
            >
              <img src={WorldCupLogo} alt="World Cup" className="league-logo" />
            </button>
            <button 
              className={`control-btn ${footballLeague === 'africnationcup' ? 'active' : ''}`}
              onClick={() => setFootballLeague('africnationcup')}
            >
              <img src={LogoCan} alt="Africa Cup of Nations" className="league-logo" />
            </button>
            <button 
              className={`control-btn ${footballLeague === 'europecup' ? 'active' : ''}`}
              onClick={() => setFootballLeague('europecup')}
            >
              <img src={EuroLogo} alt="Europe Cup" className="league-logo" />
            </button>
          </div>
        </div>
      )}

      {activeTab === 'football' && footballLeague !== 'mercato' && footballLeague !== 'actufoot' && (
        <div className="sport-controls">
          <button 
            className={`control-btn ${footballView === 'matches' ? 'active' : ''}`}
            onClick={() => setFootballView('matches')}
          >
            📅 Matchs
          </button>
          {(footballLeague === 'worldcup' || footballLeague === 'africnationcup' || footballLeague === 'championleague' || footballLeague === 'europecup') && (
            <button 
              className={`control-btn ${footballView === 'eliminatoire' ? 'active' : ''}`}
              onClick={() => setFootballView('eliminatoire')}
            >
              🏅 Phase éliminatoire
            </button>
          )}
          <button 
            className={`control-btn ${footballView === 'classement' ? 'active' : ''}`}
            onClick={() => setFootballView('classement')}
          >
            🏆 Classement
          </button>
          {(footballLeague === 'worldcup' || footballLeague === 'africnationcup' || footballLeague === 'championleague' || footballLeague === 'europecup') && (
            <button 
              className={`control-btn ${footballView === 'editions' ? 'active' : ''}`}
              onClick={() => setFootballView('editions')}
            >
              📜 Historique & Éditions
            </button>
          )}
          {footballLeague === 'worldcup' && (
            <button 
              className={`control-btn ${footballView === 'news' ? 'active' : ''}`}
              onClick={() => setFootballView('news')}
            >
              📰 Actualités
            </button>
          )}
        </div>
      )}

      {activeTab === 'basket' && (
        <div className="sport-controls">
          <button 
            className={`control-btn ${basketView === 'matches' ? 'active' : ''}`}
            onClick={() => setBasketView('matches')}
          >
            📅 Matchs
          </button>
          <button 
            className={`control-btn ${basketView === 'classement' ? 'active' : ''}`}
            onClick={() => setBasketView('classement')}
          >
            🏆 Classement
          </button>
        </div>
      )}

      {activeTab === 'nhl' && (
        <div className="sport-controls">
          <button 
            className={`control-btn ${nhlView === 'matches' ? 'active' : ''}`}
            onClick={() => setNhlView('matches')}
          >
            📅 Matchs
          </button>
          <button 
            className={`control-btn ${nhlView === 'classement' ? 'active' : ''}`}
            onClick={() => setNhlView('classement')}
          >
            🏆 Classement
          </button>
        </div>
      )}

      {activeTab === 'nfl' && (
        <div className="sport-controls">
          <button 
            className={`control-btn ${nflView === 'matches' ? 'active' : ''}`}
            onClick={() => setNflView('matches')}
          >
            📅 Matchs
          </button>
          <button 
            className={`control-btn ${nflView === 'classement' ? 'active' : ''}`}
            onClick={() => setNflView('classement')}
          >
            🏆 Classement
          </button>
        </div>
      )}

      <main className="games-container">
        {activeTab === 'football' && renderLeagueComponent()}
        {activeTab === 'basket' && <NBA view={basketView} />}
        {activeTab === 'nhl' && <NHL view={nhlView} />}
        {activeTab === 'nfl' && <NFL view={nflView} />}
      </main>
    </div>
  );
};

export default AllSports;
