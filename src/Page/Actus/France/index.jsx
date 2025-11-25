import { useState, useEffect } from 'react';
import Card from '../../../Common/card';

function ActuFrance() {
  const [actualites, setActualites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/actu/data/data.json');
        const jsonData = await response.json();
        const franceData = jsonData.actus?.france?.items || [];
        setActualites(franceData.map(item => ({
          titre: item.title,
          description: item.description,
          lien: item.link,
          date: new Date(item.pubDate).toLocaleDateString('fr-FR'),
          image: item.image
        })));
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="ActuFrance">
        <h2 >📰 Actualités France</h2>
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
          <h3>⚠️ Impossible de charger les actualités</h3>
          <p>{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="ActuFrance">
      <h2 style={{color: 'antiquewhite'}}>📰 Actualités en France</h2>
      <div className="actualites-grid">
        {actualites && actualites.length > 0 ? (
          actualites.map((actu, index) => (
            <Card key={index} variant="news" className="actu-card">
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