import React, { useState, useEffect } from 'react';
import './MercatoFoot.scss';

const MercatoFoot = () => {
  const [actualites, setActualites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger tous les fichiers mercato
        const mercatoSources = ['lequipe', 'madeinfoot', 'rmcsport', 'footmercato'];
        const allMercato = [];
        
        await Promise.all(mercatoSources.map(async (source) => {
          try {
            const response = await fetch(`./data/mercato-${source}.json`);
            const jsonData = await response.json();
            
            if (jsonData.items && Array.isArray(jsonData.items)) {
              const items = jsonData.items.map(item => ({
                id: `${jsonData.feed}-${item.link}`,
                titre: item.title,
                description: item.description,
                lien: item.link,
                date: new Date(item.pubDate).toLocaleDateString('fr-FR'),
                pubDate: item.pubDate,
                image: item.image,
                source: jsonData.feed,
                sourceEmoji: getSourceEmoji(jsonData.feed)
              }));
              allMercato.push(...items);
            }
          } catch (err) {
            console.warn(`Erreur chargement mercato-${source}:`, err);
          }
        }));
        
        // Trier par date décroissante (utiliser pubDate original)
        allMercato.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        
        setActualites(allMercato);
        setLoading(false);
      } catch (err) {
        console.error('Erreur chargement mercato:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh toutes les minutes
    return () => clearInterval(interval);
  }, []);

  const getSourceEmoji = (source) => {
    if (source?.includes('Maxifoot')) return '⚡';
    if (source?.includes('RMC')) return '🔴';
    if (source?.includes('10 Sport')) return '🔟';
    if (source?.includes('FootMercato') || source?.includes('Foot Mercato')) return '⚽';
    return '📰';
  };

  if (loading) {
    return (
      <div className="mercato-foot">
        <div className="mercato-header">
          <h2>💼 Mercato Football - Transferts</h2>
          <p className="mercato-subtitle">Toute l'actualité des transferts en direct</p>
        </div>
        <div className="loading">
          <h3>Chargement des actualités mercato...</h3>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mercato-foot">
        <div className="mercato-header">
          <h2>💼 Mercato Football</h2>
        </div>
        <div className="error-card">
          <h3>⚠️ Impossible de charger les actualités mercato</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mercato-foot">
      <div className="mercato-header">
        <h2>💼 Mercato Football 2025</h2>
        <p className="mercato-subtitle">🔥 Transferts, rumeurs et infos du marché</p>
      </div>

      <div className="mercato-grid">
        {actualites.length > 0 ? (
          actualites.map((actu) => (
            <div 
              key={actu.id} 
              className="mercato-card"
            >
              {actu.image && (
                <div className="mercato-image">
                  <img src={actu.image} alt={actu.titre} onError={(e) => e.target.style.display = 'none'} />
                  <div className="mercato-badge">
                    <span className="badge-icon">{actu.sourceEmoji}</span>
                    <span className="badge-text">{actu.source}</span>
                  </div>
                </div>
              )}
              {!actu.image && (
                <div className="mercato-image-placeholder">
                  <div className="mercato-badge">
                    <span className="badge-icon">{actu.sourceEmoji}</span>
                    <span className="badge-text">{actu.source}</span>
                  </div>
                </div>
              )}
              <div className="mercato-content">
                <div>
                  <h3 className="mercato-title">{actu.titre}</h3>
                  <p className="mercato-description">{actu.description}</p>
                </div>
                <div className="mercato-meta-bottom">
                  <span className="mercato-date">
                    <span className="date-icon">🕐</span>
                    {actu.date}
                  </span>
                  <span 
                    className="mercato-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(actu.lien, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    Lire la suite →
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="mercato-card">
            <p>Aucune actualité mercato disponible</p>
          </div>
        )}
      </div>

      <footer className="mercato-footer">
        <div className="footer-content">
          <div className="sources-info">
            <p className="sources-label">📰 Sources agrégées :</p>
            <div className="sources-badges">
              <span className="source-badge">⚡ Maxifoot</span>
              <span className="source-badge">🔴 RMC Sport</span>
              <span className="source-badge">🔟 Le 10 Sport</span>
              <span className="source-badge">⚽ FootMercato</span>
            </div>
          </div>
          <small>Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR')}</small>
          <small className="copyright">Données agrégées de multiples sources - Tous droits réservés aux éditeurs respectifs</small>
        </div>
      </footer>
    </div>
  );
};

export default MercatoFoot;