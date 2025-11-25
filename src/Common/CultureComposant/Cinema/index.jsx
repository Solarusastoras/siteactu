import React, { useState, useEffect } from 'react';
import './Cinema.scss';
import Card from '../../card';

const Cinema = () => {
  const [activeTab, setActiveTab] = useState('actu');
  const [actualites, setActualites] = useState([]);
  const [loadingActu, setLoadingActu] = useState(true);
  const [errorActu, setErrorActu] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/actu/data/data.json');
        const jsonData = await response.json();
        const cinemaData = jsonData.culture?.cinema?.items || [];
        setActualites(cinemaData.map(item => ({
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
  
  // États pour l'onglet "Chercher Film"
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [errorSearch, setErrorSearch] = useState(null);

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
                <h3>⚠️ Impossible de charger les actualités cinéma</h3>
                <p>{errorActu}</p>
              </Card>
            )}

            {!loadingActu && !errorActu && (
              <div className="actualites-grid">
                {actualites && actualites.length > 0 ? (
                  actualites.map((actu, index) => (
                    <Card key={index} variant="cinema" className="actu-card">
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