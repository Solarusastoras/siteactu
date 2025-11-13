import React, { useState, useEffect } from 'react';
import './Cinema.scss';
import Card from '../../../Common/card';

const Cinema = () => {
  const [activeTab, setActiveTab] = useState('actu');
  
  // États pour l'onglet "Actu Cinéma"
  const [actualites, setActualites] = useState([]);
  const [loadingActu, setLoadingActu] = useState(true);
  const [errorActu, setErrorActu] = useState(null);
  
  // États pour l'onglet "Chercher Film"
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [errorSearch, setErrorSearch] = useState(null);

  // Charger les actualités cinéma au montage du composant
  useEffect(() => {
    fetchActualites();
    const interval = setInterval(fetchActualites, 30 * 60 * 1000); // Actualiser toutes les 30 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchActualites = async () => {
    try {
      setLoadingActu(true);
      setErrorActu(null);

      const RSS_URL = 'https://www.franceinfo.fr/culture/cinema.rss';
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
      console.error('Erreur chargement actus cinéma:', err);
      setErrorActu('Impossible de charger les actualités cinéma');
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
      
      const response = await fetch(`https://imdb.iamidiotareyoutoo.com/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data.description) {
        setMovies(data.description);
      } else {
        setMovies([]);
        setErrorSearch('Aucun résultat trouvé');
      }
    } catch (err) {
      console.error('Erreur recherche films:', err);
      setErrorSearch('Erreur lors de la recherche');
      setMovies([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  const renderMovieCard = (movie) => {
    return (
      <Card key={movie['#IMDB_ID']} variant="cinema" className="movie-card">
        <div className="movie-content">
          {movie['#IMG_POSTER'] && (
            <div className="movie-poster">
              <img src={movie['#IMG_POSTER']} alt={movie['#TITLE']} />
            </div>
          )}
          <div className="movie-info">
            <h3 className="movie-title">{movie['#TITLE']}</h3>
            {movie['#YEAR'] && (
              <p className="movie-year">📅 {movie['#YEAR']}</p>
            )}
            {movie['#ACTORS'] && (
              <p className="movie-actors">🎭 {movie['#ACTORS']}</p>
            )}
            {movie['#IMDB_ID'] && (
              <a 
                href={`https://www.imdb.com/title/${movie['#IMDB_ID']}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="imdb-link"
              >
                🎬 Voir sur IMDb
              </a>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="cinema-container">
      <header className="cinema-header">
        <h1>🎬 Cinéma</h1>
        
        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'actu' ? 'active' : ''}`}
            onClick={() => setActiveTab('actu')}
          >
            📰 Actu Cinéma
          </button>
          <button 
            className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            🔍 Chercher Film
          </button>
        </div>
      </header>

      <main className="cinema-content">
        {/* Onglet Actu Cinéma */}
        {activeTab === 'actu' && (
          <div className="actu-cinema-section">
            {loadingActu && (
              <div className="loading">
                <h2>Chargement des actualités...</h2>
                <div className="loading-spinner"></div>
              </div>
            )}

            {errorActu && (
              <Card variant="cinema" className="error-card">
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
                    <Card key={actu.id} variant="cinema" className="actu-card">
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
                  <Card variant="cinema">
                    <p>Aucune actualité disponible</p>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {/* Onglet Chercher Film */}
        {activeTab === 'search' && (
          <div className="search-cinema-section">
            <div className="search-header">
              <p className="subtitle">Recherchez vos films préférés</p>
              
              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un film, un acteur..."
                  className="search-input"
                />
                <button type="submit" className="search-btn">
                  🔍 Rechercher
                </button>
              </form>
            </div>

            {loadingSearch && (
              <div className="loading">
                <h2>Recherche en cours...</h2>
                <div className="loading-spinner"></div>
              </div>
            )}

            {errorSearch && (
              <Card variant="cinema" className="error-card">
                <h2>{errorSearch}</h2>
                <p>Essayez une autre recherche</p>
              </Card>
            )}

            {!loadingSearch && !errorSearch && movies.length === 0 && (
              <div className="welcome-message">
                <Card variant="cinema" className="welcome-card">
                  <h2>🍿 Bienvenue dans l'univers du cinéma</h2>
                  <p>Utilisez la barre de recherche pour découvrir des films, des acteurs et bien plus encore</p>
                </Card>
              </div>
            )}

            {!loadingSearch && movies.length > 0 && (
              <div className="movies-grid">
                {movies.map(movie => renderMovieCard(movie))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="cinema-footer">
        <p>{activeTab === 'actu' ? 'Source : Franceinfo Cinéma' : 'Données fournies par IMDb API'}</p>
        <small>Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR')}</small>
      </footer>
    </div>
  );
};

export default Cinema;