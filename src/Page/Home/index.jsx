import React, { useState } from 'react';
import './Home.scss';
import Actus from '../Actus';
import Culture from '../Culture';
import AllSports from '../Sports/AllSports';
import Recre from '../Recre';

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
        <h1>Accueil</h1>
        <p className="subtitle">Découvrez toutes nos sections</p>
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
      </nav>

      <main className="home-content">
        {renderSection()}
      </main>
    </div>
  );
};

export default Home;
