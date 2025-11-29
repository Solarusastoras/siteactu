import React, { useState, useEffect } from 'react';
import Card from '../../../Common/card';
import './Musique.scss';

const Musique = () => {
  const [activeTab, setActiveTab] = useState('actu');
  const [actualites, setActualites] = useState([]);
  const [loadingActu, setLoadingActu] = useState(true);
  const [errorActu, setErrorActu] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('./data/culture-musique.json');
        const jsonData = await response.json();
        const musiqueData = jsonData.items || [];
        setActualites(musiqueData.map(item => ({
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
  
  // États pour l'onglet "Chercher Artiste"
  const [searchQuery, setSearchQuery] = useState('');
  const [artists, setArtists] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [errorSearch, setErrorSearch] = useState(null);

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
                <h3>⚠️ Impossible de charger les actualités musique</h3>
                <p>{errorActu}</p>
              </Card>
            )}

            {!loadingActu && !errorActu && (
              <div className="actualites-grid">
                {actualites && actualites.length > 0 ? (
                  actualites.map((actu, index) => (
                    <Card key={index} variant="musique" className="actu-card">
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
