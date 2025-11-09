import React, { useState } from 'react';
import './Cinema.scss';
import Card from '../../../Common/card';

const Cinema = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`https://imdb.iamidiotareyoutoo.com/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data.description) {
        setMovies(data.description);
      } else {
        setMovies([]);
        setError('Aucun résultat trouvé');
      }
    } catch (err) {
      console.error('Erreur recherche films:', err);
      setError('Erreur lors de la recherche');
      setMovies([]);
    } finally {
      setLoading(false);
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
      </header>

      <main className="cinema-content">
        {loading && (
          <div className="loading">
            <h2>Recherche en cours...</h2>
            <div className="loading-spinner"></div>
          </div>
        )}

        {error && (
          <Card variant="cinema" className="error-card">
            <h2>{error}</h2>
            <p>Essayez une autre recherche</p>
          </Card>
        )}

        {!loading && !error && movies.length === 0 && (
          <div className="welcome-message">
            <Card variant="cinema" className="welcome-card">
              <h2>🍿 Bienvenue dans l'univers du cinéma</h2>
              <p>Utilisez la barre de recherche pour découvrir des films, des acteurs et bien plus encore</p>
            </Card>
          </div>
        )}

        {!loading && movies.length > 0 && (
          <div className="movies-grid">
            {movies.map(movie => renderMovieCard(movie))}
          </div>
        )}
      </main>

      <footer className="cinema-footer">
        <p>Données fournies par IMDb API</p>
        <small>Dernière recherche : {new Date().toLocaleTimeString('fr-FR')}</small>
      </footer>
    </div>
  );
};

export default Cinema;