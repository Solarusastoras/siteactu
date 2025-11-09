import React, { useState } from 'react';
import Card from '../../../Common/card';
import './Musique.scss';

const Musique = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError(null);
      
      // Utilisation de l'API AudioDB
      const response = await fetch(`https://www.theaudiodb.com/api/v1/json/2/search.php?s=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data.artists) {
        setArtists(data.artists);
      } else {
        setArtists([]);
        setError('Aucun artiste trouvé');
      }
    } catch (err) {
      console.error('Erreur recherche musique:', err);
      setError('Erreur lors de la recherche');
      setArtists([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="musique-section">
      <div className="section-header">
        <h2>🎵 Recherche d'Artistes</h2>
        
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

      <div className="section-content">
        {loading && (
          <div className="loading">
            <h3>Recherche en cours...</h3>
            <div className="loading-spinner"></div>
          </div>
        )}

        {error && (
          <Card variant="musique" className="error-card">
            <h3>{error}</h3>
            <p>Essayez une autre recherche</p>
          </Card>
        )}

        {!loading && !error && artists.length === 0 && (
          <Card variant="musique" className="welcome-card">
            <h3>🎸 Découvrez des artistes</h3>
            <p>Utilisez la barre de recherche pour trouver vos artistes et groupes préférés</p>
          </Card>
        )}

        {!loading && artists.length > 0 && (
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
    </div>
  );
};

export default Musique;
