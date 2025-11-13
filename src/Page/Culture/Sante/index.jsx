import React, { useState, useEffect } from 'react';
import './sante.scss';
import Card from '../../../Common/card';

const Sante = () => {
  // États pour l'onglet "Actu Santé"
  const [actualites, setActualites] = useState([]);
  const [loadingActu, setLoadingActu] = useState(true);
  const [errorActu, setErrorActu] = useState(null);

  // Charger les actualités santé au montage du composant
  useEffect(() => {
    fetchActualites();
    const interval = setInterval(fetchActualites, 30 * 60 * 1000); // Actualiser toutes les 30 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchActualites = async () => {
    try {
      setLoadingActu(true);
      setErrorActu(null);

      const RSS_URL = 'https://www.franceinfo.fr/sante.rss';
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(RSS_URL)}`);
      
      if (!response.ok) throw new Error('Erreur lors de la récupération des actualités');
      
      const data = await response.json();
      const parser = new DOMParser();
      const xml = parser.parseFromString(data.contents, 'text/xml');
      
      const items = xml.querySelectorAll('item');
      const articles = Array.from(items).slice(0, 20).map((item, index) => {
        const enclosure = item.querySelector('enclosure');
        return {
          id: index,
          titre: item.querySelector('title')?.textContent || 'Sans titre',
          description: item.querySelector('description')?.textContent || '',
          lien: item.querySelector('link')?.textContent || '#',
          date: new Date(item.querySelector('pubDate')?.textContent).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          image: enclosure?.getAttribute('url') || null
        };
      });
      
      setActualites(articles);
    } catch (err) {
      console.error('Erreur chargement actus santé:', err);
      setErrorActu('Impossible de charger les actualités santé');
    } finally {
      setLoadingActu(false);
    }
  };

  return (
    <div className="sante-container">
      <header className="sante-header">
        <h1>🏥 Santé</h1>
        
        <div className="tabs">
          <button className="tab-btn">
            📰 Actu Santé
          </button>
        </div>
      </header>

      <main className="sante-content">
        <div className="actu-sante-section">
          {loadingActu && (
              <div className="loading">
                <h2>Chargement des actualités...</h2>
                <div className="loading-spinner"></div>
              </div>
            )}

            {errorActu && (
              <Card variant="sante" className="error-card">
                <h3>⚠️ {errorActu}</h3>
                <button onClick={fetchActualites} className="retry-button">
                  Réessayer
                </button>
              </Card>
            )}

            {!loadingActu && !errorActu && (
              <div className="actualites-grid">
                {actualites.length > 0 ? (
                  actualites.map((actu) => (
                    <Card key={actu.id} variant="sante" className="actu-card">
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
                  <Card variant="sante">
                    <p>Aucune actualité disponible</p>
                  </Card>
                )}
              </div>
            )}
          </div>
      </main>

      <footer className="sante-footer">
        <p>Source : Franceinfo Santé</p>
        <small>Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR')}</small>
      </footer>
    </div>
  );
};

export default Sante;
