import React, { useState } from 'react';
import './Home.scss';
import Actus from '../Actus';
import Culture from '../Culture';
import AllSports from '../Sports';
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
    </div>
  );
};

export default Home;
