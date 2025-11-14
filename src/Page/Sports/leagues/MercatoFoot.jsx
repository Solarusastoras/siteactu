import React, { useState, useEffect } from 'react';
import './MercatoFoot.scss';

// Cache global pour les données mercato
// eslint-disable-next-line no-unused-vars
let mercatoCache = {
  data: null,
  timestamp: null
};

// eslint-disable-next-line no-unused-vars
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

const MercatoFoot = () => {
  const [actualites, setActualites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sources RSS (toutes chargées simultanément)
  const RSS_SOURCES = {
    maxifoot: {
      url: 'http://rss.maxifoot.com/football-transfert.xml',
      name: 'Maxifoot',
      emoji: '⚡'
    },
    rmcsport: {
      url: 'https://rmcsport.bfmtv.com/rss/football/transferts/',
      name: 'RMC Sport',
      emoji: '🔴'
    },
    le10sport: {
      url: 'https://le10sport.com/fr/rss/football/mercato/',
      name: 'Le 10 Sport',
      emoji: '🔟'
    },
    footmercato: {
      url: 'https://www.footmercato.net/flux-rss',
      name: 'FootMercato',
      emoji: '⚽'
    }
  };

  useEffect(() => {
    const loadActualites = async () => {
      // Vérifier si les données en cache sont encore valides
      const now = Date.now();
      if (mercatoCache.data && mercatoCache.timestamp && (now - mercatoCache.timestamp) < CACHE_DURATION) {
        // Utiliser les données en cache
        setActualites(mercatoCache.data);
        setLoading(false);
        return;
      }
      
      // Sinon, charger les données
      await fetchActualites();
    };
    loadActualites();
    const interval = setInterval(async () => {
      await fetchActualites();
    }, CACHE_DURATION); // Actualiser toutes les 30 minutes
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchActualites = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger TOUS les flux RSS en parallèle avec timeout
      const fetchPromises = Object.entries(RSS_SOURCES).map(async ([sourceKey, sourceInfo]) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // Timeout 8 secondes
          
          const response = await fetch(
            `https://api.allorigins.win/get?url=${encodeURIComponent(sourceInfo.url)}`,
            { signal: controller.signal }
          );
          clearTimeout(timeoutId);
          
          if (!response.ok) throw new Error(`Erreur ${sourceInfo.name}`);
          
          const data = await response.json();
          const parser = new DOMParser();
          const xml = parser.parseFromString(data.contents, 'text/xml');
          const items = xml.querySelectorAll('item');
          
          return Array.from(items).slice(0, 10).map((item) => {
            const enclosure = item.querySelector('enclosure');
            const category = item.querySelector('category')?.textContent || 'Mercato';
            const pubDate = item.querySelector('pubDate')?.textContent;
            
            return {
              titre: item.querySelector('title')?.textContent || 'Sans titre',
              description: item.querySelector('description')?.textContent?.replace(/<!\[CDATA\[|\]\]>|<[^>]+>/g, '') || '',
              lien: item.querySelector('link')?.textContent || '#',
              dateRaw: pubDate ? new Date(pubDate) : new Date(),
              date: pubDate ? new Date(pubDate).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'Date inconnue',
              image: enclosure?.getAttribute('url') || null,
              categorie: category,
              source: sourceInfo.name,
              sourceEmoji: sourceInfo.emoji
            };
          });
        } catch (err) {
          if (err.name === 'AbortError') {
            console.warn(`Timeout ${sourceInfo.name}`);
          } else {
            console.warn(`Erreur ${sourceInfo.name}:`, err);
          }
          return []; // Retourner tableau vide si erreur ou timeout
        }
      });

      // Attendre toutes les réponses
      const allArticles = await Promise.all(fetchPromises);
      
      // Fusionner, trier par date et limiter à 40 articles
      const mergedArticles = allArticles
        .flat()
        .sort((a, b) => b.dateRaw - a.dateRaw)
        .slice(0, 40) // Limiter à 40 articles au total
        .map((article, index) => ({ ...article, id: index }));
      
      // Mettre en cache les données
      mercatoCache = {
        data: mergedArticles,
        timestamp: Date.now()
      };
      
      setActualites(mergedArticles);
    } catch (err) {
      console.error('Erreur chargement mercato:', err);
      setError('Impossible de charger les actualités mercato');
    } finally {
      setLoading(false);
    }
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
          <h3>⚠️ {error}</h3>
          <button onClick={fetchActualites} className="retry-button">
            Réessayer
          </button>
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