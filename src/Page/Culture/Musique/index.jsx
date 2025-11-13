import React, { useState, useEffect } from 'react';
import Card from '../../../Common/card';
import './Musique.scss';

const Musique = () => {
  const [activeTab, setActiveTab] = useState('actu');
  
  // États pour l'onglet "Actu Musique"
  const [actualites, setActualites] = useState([]);
  const [loadingActu, setLoadingActu] = useState(true);
  const [errorActu, setErrorActu] = useState(null);
  
  // États pour l'onglet "Chercher Artiste"
  const [searchQuery, setSearchQuery] = useState('');
  const [artists, setArtists] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [errorSearch, setErrorSearch] = useState(null);

  // Charger les actualités musique au montage du composant
  useEffect(() => {
    fetchActualites();
    const interval = setInterval(fetchActualites, 30 * 60 * 1000); // Actualiser toutes les 30 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchActualites = async () => {
    try {
      setLoadingActu(true);
      setErrorActu(null);

      const RSS_URL = 'https://www.franceinfo.fr/culture/musique.rss';
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
      console.error('Erreur chargement actus musique:', err);
      setErrorActu('Impossible de charger les actualités musique');
    } finally {
      setLoadingActu(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoadingSearch(true);
      setErrorSearch(null);
      
      // Utilisation de l'API AudioDB
      const response = await fetch(`https://www.theaudiodb.com/api/v1/json/2/search.php?s=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data.artists) {
        setArtists(data.artists);
      } else {
        setArtists([]);
        setErrorSearch('Aucun artiste trouvé');
      }
    } catch (err) {
      console.error('Erreur recherche musique:', err);
      setErrorSearch('Erreur lors de la recherche');
      setArtists([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  return (
    <div className="musique-section">
      <div className="section-header">
        <h2>🎵 Musique</h2>
        
        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'actu' ? 'active' : ''}`}
            onClick={() => setActiveTab('actu')}
          >
            📰 Actu Musique
          </button>
          <button 
            className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            🔍 Chercher Artiste
          </button>
        </div>
      </div>

      <div className="section-content">
        {/* Onglet Actu Musique */}
        {activeTab === 'actu' && (
          <div className="actu-musique-section">
            {loadingActu && (
              <div className="loading">
                <h3>Chargement des actualités...</h3>
                <div className="loading-spinner"></div>
              </div>
            )}

            {errorActu && (
              <Card variant="musique" className="error-card">
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
                    <Card key={actu.id} variant="musique" className="actu-card">
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
                  <Card variant="musique">
                    <p>Aucune actualité disponible</p>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {/* Onglet Chercher Artiste */}
        {activeTab === 'search' && (
          <div className="search-musique-section">
            <div className="search-header">
              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un artiste, un groupe..."
                  className="search-input"
                />
                <button type="submit" className="search-btn">
                  🔍 Rechercher
                </button>
              </form>
            </div>

            {loadingSearch && (
              <div className="loading">
                <h3>Recherche en cours...</h3>
                <div className="loading-spinner"></div>
              </div>
            )}

            {errorSearch && (
              <Card variant="musique" className="error-card">
                <h3>{errorSearch}</h3>
                <p>Essayez une autre recherche</p>
              </Card>
            )}

            {!loadingSearch && !errorSearch && artists.length === 0 && (
              <Card variant="musique" className="welcome-card">
                <h3>🎸 Découvrez des artistes</h3>
                <p>Utilisez la barre de recherche pour trouver vos artistes et groupes préférés</p>
              </Card>
            )}

            {!loadingSearch && artists.length > 0 && (
              <div className="artists-grid">
                {artists.map(artist => (
                  <Card key={artist.idArtist} variant="musique" className="artist-card">
                    <div className="artist-content">
                      {artist.strArtistThumb && (
                        <div className="artist-image">
                          <img src={artist.strArtistThumb} alt={artist.strArtist} />
                        </div>
                      )}
                      <div className="artist-info">
                        <h4 className="artist-name">{artist.strArtist}</h4>
                        {artist.strGenre && (
                          <p className="artist-genre">🎼 {artist.strGenre}</p>
                        )}
                        {artist.intFormedYear && (
                          <p className="artist-year">📅 Depuis {artist.intFormedYear}</p>
                        )}
                        {artist.strCountry && (
                          <p className="artist-country">🌍 {artist.strCountry}</p>
                        )}
                        {artist.strBiographyFR && (
                          <p className="artist-bio">{artist.strBiographyFR.substring(0, 200)}...</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Musique;
