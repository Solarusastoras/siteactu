import { useState, useEffect } from 'react';
import Card from '../../../Common/card';

function ActuFrance() {
  const [actualites, setActualites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActualites();
    const interval = setInterval(fetchActualites, 30 * 60 * 1000); // Actualiser toutes les 30 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchActualites = async () => {
    try {
      setLoading(true);
      setError(null);

      // Utiliser un proxy CORS pour accéder au flux RSS
      const RSS_URL = 'https://www.franceinfo.fr/france.rss';
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
      console.error('Erreur chargement actus France:', err);
      setError('Impossible de charger les actualités');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ActuFrance">
        <h2>📰 Actualités France</h2>
        <div className="loading">
          <h3>Chargement des actualités...</h3>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ActuFrance">
        <h2>📰 Actualités France</h2>
        <Card variant="news" className="error-card">
          <h3>⚠️ {error}</h3>
          <button onClick={fetchActualites} className="retry-button">
            Réessayer
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="ActuFrance">
      <h2>📰 Actualités France - Franceinfo</h2>
      <div className="actualites-grid">
        {actualites.length > 0 ? (
          actualites.map((actu) => (
            <Card key={actu.id} variant="news" className="actu-card">
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
          <Card variant="news">
            <p>Aucune actualité disponible</p>
          </Card>
        )}
      </div>
    </div>
  );
}

export default ActuFrance;