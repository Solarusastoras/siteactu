import React, { useState } from 'react';
import './Home.scss';
import Actus from '../Actus';
import Culture from '../Culture';
import AllSports from '../Sports/AllSports';
import Recre from '../Recre';
import LogoOdyseeSavoir from '../../Utils/Logo/Logo_odyseedusavoir.webp';
import LogoSolarus from '../../Utils/Logo/LogoSolarus.png';


const Home = () => {
  const [activeSection, setActiveSection] = useState('actu');

  const renderSection = () => {
    switch(activeSection) {
      case 'actu':
        return <Actus />;
      case 'culture':
        return <Culture />;
      case 'foot':
        return <AllSports />;
      case 'jeux':
        return <Recre />;
      default:
        return <Actus />;
    }
  };

  return (
    
    <div className="home-container">
     
      <header className="home-header">
        <img className="logosolarus" src={LogoSolarus} alt="Logo Solarus" />
       
      </header>

      <nav className="home-tabs">
        <button 
          className={`tab ${activeSection === 'actu' ? 'active' : ''}`}
          onClick={() => setActiveSection('actu')}
        >
          📰 Actu
        </button>
        <button 
          className={`tab ${activeSection === 'culture' ? 'active' : ''}`}
          onClick={() => setActiveSection('culture')}
        >
          🎭 Culture
        </button>
        <button 
          className={`tab ${activeSection === 'foot' ? 'active' : ''}`}
          onClick={() => setActiveSection('foot')}
        >
          ⚽ Sport
        </button>
        <button 
          className={`tab ${activeSection === 'jeux' ? 'active' : ''}`}
          onClick={() => setActiveSection('jeux')}
        >
          🎮 Jeux
        </button>
        <button 
          className="tab odyssee-tab"
          onClick={() => document.querySelector('.home-footer').scrollIntoView({ behavior: 'smooth' })}
        >
          <img src={LogoOdyseeSavoir} alt="Logo Odysee du Savoir" className="odyssee-logo" /> Odyssée du savoir
        </button>
      </nav>
      

      <main className="home-content">
        {renderSection()}
      </main>

      <footer className="home-footer">
        <div className="footer-section">
          <h3>🌟 Découvrez aussi</h3>
          <a 
            href="https://solarusweb.ovh/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link"
          >
            <img src={LogoOdyseeSavoir} alt="Odyssée du Savoir" className="footer-logo" />
            <div className="footer-link-content">
              <strong>Odyssée du Savoir</strong>
              <span>Éducation CP à la 3ème</span>
            </div>
          </a>
        </div>
        <div className="footer-copyright">
          <p>© 2025 SiteActu - Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
