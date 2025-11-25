import React, { useState } from 'react';
import './loisir.scss';
import Cinema from '../../Common/CultureComposant/Cinema';
import Literature from '../../Common/CultureComposant/Literature';
import Musique from '../../Common/CultureComposant/Musique';
import JeuxVideo from '../../Common/CultureComposant/JeuxVideo';
import Sciences from '../../Common/CultureComposant/Sciences';
import Sante from '../../Common/CultureComposant/Sante';

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
      case 'sciences':
        return <Sciences />;
      case 'sante':
        return <Sante />;
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
        <button 
          className={`tab ${activeSection === 'sciences' ? 'active' : ''}`}
          onClick={() => setActiveSection('sciences')}
        >
          🔬 Sciences
        </button>
        <button 
          className={`tab ${activeSection === 'sante' ? 'active' : ''}`}
          onClick={() => setActiveSection('sante')}
        >
          🏥 Santé
        </button>
      </nav>


      <main className="culture-content">
        {renderSection()}
      </main>
    </div>
  );
};

export default Culture;
