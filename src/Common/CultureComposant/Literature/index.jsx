import React, { useState, useEffect } from 'react';
import './Literature.scss';
import Card from '../../card';

const Literature = () => {
  const [activeTab, setActiveTab] = useState('actu');
  const [actualites, setActualites] = useState([]);
  const [loadingActu, setLoadingActu] = useState(true);
  const [errorActu, setErrorActu] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/actu/data/data.json');
        const jsonData = await response.json();
        const litteratureData = jsonData.culture?.litterature?.items || [];
        setActualites(litteratureData.map(item => ({
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
  
  // États pour l'onglet "Chercher Livre"
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [errorSearch, setErrorSearch] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoadingSearch(true);
      setErrorSearch(null);
      
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=20&langRestrict=fr`);
      const data = await response.json();
      
      if (data.items) {
        setBooks(data.items);
      } else {
        setBooks([]);
        setErrorSearch('Aucun livre trouvé');
      }
    } catch (err) {
      console.error('Erreur recherche livres:', err);
      setErrorSearch('Erreur lors de la recherche');
      setBooks([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  const renderBookCard = (book) => {
    return (
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
    );
  };

  return (
    <div className="literature-container">
      <header className="literature-header">
        <h1>📚 Littérature</h1>
        
        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'actu' ? 'active' : ''}`}
            onClick={() => setActiveTab('actu')}
          >
            📰 Actu Littérature
          </button>
          <button 
            className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            🔍 Chercher Livre
          </button>
        </div>
      </header>

      <main className="literature-content">
        {/* Onglet Actu Littérature */}
        {activeTab === 'actu' && (
          <div className="actu-literature-section">
            {loadingActu && (
              <div className="loading">
                <h2>Chargement des actualités...</h2>
                <div className="loading-spinner"></div>
              </div>
            )}

            {errorActu && (
              <Card variant="literature" className="error-card">
                <h3>⚠️ Impossible de charger les actualités littérature</h3>
                <p>{errorActu}</p>
              </Card>
            )}

            {!loadingActu && !errorActu && (
              <div className="actualites-grid">
                {actualites && actualites.length > 0 ? (
                  actualites.map((actu, index) => (
                    <Card key={index} variant="literature" className="actu-card">
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
                  <Card variant="literature">
                    <p>Aucune actualité disponible</p>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {/* Onglet Chercher Livre */}
        {activeTab === 'search' && (
          <div className="search-literature-section">
            <div className="search-header">
              <p className="subtitle">Recherchez vos livres préférés</p>
              
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

            {loadingSearch && (
              <div className="loading">
                <h2>Recherche en cours...</h2>
                <div className="loading-spinner"></div>
              </div>
            )}

            {errorSearch && (
              <Card variant="literature" className="error-card">
                <h2>{errorSearch}</h2>
                <p>Essayez une autre recherche</p>
              </Card>
            )}

            {!loadingSearch && !errorSearch && books.length === 0 && (
              <div className="welcome-message">
                <Card variant="literature" className="welcome-card">
                  <h2>📖 Découvrez des livres</h2>
                  <p>Utilisez la barre de recherche pour trouver des livres, auteurs et éditeurs</p>
                </Card>
              </div>
            )}

            {!loadingSearch && books.length > 0 && (
              <div className="books-grid">
                {books.map(book => renderBookCard(book))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="literature-footer">
        <p>{activeTab === 'actu' ? 'Source : Bibliobs - Le Nouvel Observateur' : 'Données fournies par Google Books API'}</p>
        <small>Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR')}</small>
      </footer>
    </div>
  );
};

export default Literature;
