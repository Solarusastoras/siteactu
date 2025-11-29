import React, { useState, useEffect } from 'react';
import './siences.scss';
import Card from '../../../Common/card';

const Sciences = () => {
  const [actualites, setActualites] = useState([]);
  const [loadingActu, setLoadingActu] = useState(true);
  const [errorActu, setErrorActu] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('./data/culture-sciences.json');
        const jsonData = await response.json();
        const sciencesData = jsonData.items || [];
        setActualites(sciencesData.map(item => ({
          titre: item.title,
          description: item.description,
          lien: item.link,
          date: new Date(item.pubDate).toLocaleDateString('fr-FR'),
          image: item.image
        })));
        setLoadingActu(false);
      } catch (err) {
        setErrorActu(err.message);
        setLoadingActu(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="sciences-container">
      <header className="sciences-header">
        <h1>🔬 Sciences</h1>
        
        <div className="tabs">
          <button className="tab-btn">
            📰 Actu Sciences
          </button>
        </div>
      </header>

      <main className="sciences-content">
        <div className="actu-sciences-section">
          {loadingActu && (
              <div className="loading">
                <h2>Chargement des actualités...</h2>
                <div className="loading-spinner"></div>
              </div>
            )}

            {errorActu && (
              <Card variant="sciences" className="error-card">
                <h3>⚠️ Impossible de charger les actualités sciences</h3>
                <p>{errorActu}</p>
              </Card>
            )}

            {!loadingActu && !errorActu && (
              <div className="actualites-grid">
                {actualites && actualites.length > 0 ? (
                  actualites.map((actu, index) => (
                    <Card key={index} variant="sciences" className="actu-card">
                      {actu.image && (
                        <div className="actu-image">
                          <img src={actu.image} alt={actu.titre} onError={(e) => e.target.style.display = 'none'} />
                        </div>
                      )}
                      <div className="actu-content">
                        <h3>{actu.titre}</h3>
                        <p className="actu-description">{actu.description}</p>
                        <div className="actu-meta">
                          <span className="actu-date">📅 {actu.date}</span>
                          <a 
                            href={actu.lien} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="actu-link"
                          >
                            Lire la suite →
                          </a>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card variant="sciences">
                    <p>Aucune actualité disponible</p>
                  </Card>
                )}
              </div>
            )}
          </div>
      </main>

      <footer className="sciences-footer">
        <p>Source : Franceinfo Sciences</p>
        <small>Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR')}</small>
      </footer>
    </div>
  );
};

export default Sciences;
