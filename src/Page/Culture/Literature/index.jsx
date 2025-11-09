import React, { useState } from 'react';
import Card from '../../../Common/card';
import './Literature.scss';

const Literature = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=20&langRestrict=fr`);
      const data = await response.json();
      
      if (data.items) {
        setBooks(data.items);
      } else {
        setBooks([]);
        setError('Aucun livre trouvé');
      }
    } catch (err) {
      console.error('Erreur recherche livres:', err);
      setError('Erreur lors de la recherche');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="literature-section">
      <div className="section-header">
        <h2>📚 Recherche de Livres</h2>
        
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un livre, un auteur..."
            className="search-input"
          />
          <button type="submit" className="search-btn">
            🔍 Rechercher
          </button>
        </form>
      </div>

      <div className="section-content">
        {loading && (
          <div className="loading">
            <h3>Recherche en cours...</h3>
            <div className="loading-spinner"></div>
          </div>
        )}

        {error && (
          <Card variant="literature" className="error-card">
            <h3>{error}</h3>
            <p>Essayez une autre recherche</p>
          </Card>
        )}

        {!loading && !error && books.length === 0 && (
          <Card variant="literature" className="welcome-card">
            <h3>📖 Découvrez des livres</h3>
            <p>Utilisez la barre de recherche pour trouver des livres, auteurs et éditeurs</p>
          </Card>
        )}

        {!loading && books.length > 0 && (
          <div className="books-grid">
            {books.map(book => (
              <Card key={book.id} variant="literature" className="book-card">
                <div className="book-content">
                  {book.volumeInfo.imageLinks?.thumbnail && (
                    <div className="book-cover">
                      <img src={book.volumeInfo.imageLinks.thumbnail} alt={book.volumeInfo.title} />
                    </div>
                  )}
                  <div className="book-info">
                    <h4 className="book-title">{book.volumeInfo.title}</h4>
                    {book.volumeInfo.authors && (
                      <p className="book-authors">✍️ {book.volumeInfo.authors.join(', ')}</p>
                    )}
                    {book.volumeInfo.publishedDate && (
                      <p className="book-year">📅 {book.volumeInfo.publishedDate.split('-')[0]}</p>
                    )}
                    {book.volumeInfo.description && (
                      <p className="book-description">{book.volumeInfo.description.substring(0, 150)}...</p>
                    )}
                    {book.volumeInfo.infoLink && (
                      <a href={book.volumeInfo.infoLink} target="_blank" rel="noopener noreferrer" className="book-link">
                        📚 Plus d'infos
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Literature;
