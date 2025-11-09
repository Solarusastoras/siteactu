import React, { useState } from 'react';
import './Culture.scss';
import Cinema from './Cinema';
import Literature from './Literature';
import Musique from './Musique';
import JeuxVideo from './JeuxVideo';

const Culture = () => {
  const [activeSection, setActiveSection] = useState('cinema');

  const renderSection = () => {
    switch(activeSection) {
      case 'cinema':
        return <Cinema />;
      case 'literature':
        return <Literature />;
      case 'musique':
        return <Musique />;
      case 'jeuxvideo':
        return <JeuxVideo />;
      default:
        return <Cinema />;
    }
  };

  return (
    <div className="culture-container">
      <header className="culture-header">
        <h1>🎭 Culture</h1>
        <p className="subtitle">Explorez le monde de la culture</p>
      </header>

      <nav className="culture-tabs">
        <button 
          className={`tab ${activeSection === 'cinema' ? 'active' : ''}`}
          onClick={() => setActiveSection('cinema')}
        >
          🎬 Cinéma
        </button>
        <button 
          className={`tab ${activeSection === 'literature' ? 'active' : ''}`}
          onClick={() => setActiveSection('literature')}
        >
          📚 Littérature
        </button>
        <button 
          className={`tab ${activeSection === 'musique' ? 'active' : ''}`}
          onClick={() => setActiveSection('musique')}
        >
          🎵 Musique
        </button>
        <button 
          className={`tab ${activeSection === 'jeuxvideo' ? 'active' : ''}`}
          onClick={() => setActiveSection('jeuxvideo')}
        >
          🎮 Jeux Vidéo
        </button>
      </nav>

      <main className="culture-content">
        {renderSection()}
      </main>
    </div>
  );
};

export default Culture;
