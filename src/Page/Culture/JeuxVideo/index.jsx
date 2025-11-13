import React, { useState, useEffect } from 'react';
import Card from '../../../Common/card';
import './JeuxVideo.scss';

function JeuxVideo() {
    const [games, setGames] = useState([]);
    const [filteredGames, setFilteredGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPlatform, setSelectedPlatform] = useState('all');

    // Google Sheet publié en CSV
    const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTOyYukGaAbj5Wv5AftfcJOD-adMA-7F5JLjoJWFCLR8ZHZlXguGyAnSesQHDJwR6IdFgv4CyAwrJO3/pub?output=csv';

    useEffect(() => {
        fetchGames();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        filterGames();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [games, searchQuery, selectedPlatform]);

    const fetchGames = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Ajouter un paramètre pour éviter le cache
            const timestamp = new Date().getTime();
            const response = await fetch(`${GOOGLE_SHEET_URL}&t=${timestamp}`);
            
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des données');
            }
            
            const csvText = await response.text();
            console.log('CSV reçu:', csvText.substring(0, 200)); // Debug
            const parsedGames = parseCSV(csvText);
            console.log('Jeux parsés:', parsedGames.length); // Debug
            setGames(parsedGames);
        } catch (err) {
            console.error('Erreur Google Sheets:', err);
            setError('Impossible de charger les données. Vérifiez que le Google Sheet est publié et contient des données.');
            setGames([]);
        } finally {
            setLoading(false);
        }
    };

    const parseCSV = (csvText) => {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        return lines.slice(1).map((line, index) => {
            const values = line.split(',').map(v => v.trim());
            const game = {};
            
            headers.forEach((header, i) => {
                game[header] = values[i] || '';
            });
            
            return {
                id: index,
                title: game.titre || game.title || 'Sans titre',
                description: game.description || '',
                image: game.image || 'https://via.placeholder.com/300x200?text=Jeu',
                platform: game.plateforme || game.platform || 'PC',
                price: game.prix || game.price || 'Gratuit',
                link: game.lien || game.link || '#',
                type: game.type || 'news'
            };
        });
    };

    const filterGames = () => {
        let filtered = [...games];

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(game =>
                game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                game.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filter by platform
        if (selectedPlatform !== 'all') {
            filtered = filtered.filter(game =>
                game.platform?.toLowerCase().includes(selectedPlatform.toLowerCase())
            );
        }

        setFilteredGames(filtered);
    };

    const renderGameCard = (game) => {
        const platformIcons = {
            'pc': '💻',
            'steam': '🎮',
            'playstation': '🎮',
            'ps5': '🎮',
            'ps4': '🎮',
            'xbox': '🎮',
            'switch': '🎮',
            'android': '📱',
            'ios': '📱'
        };

        const getPlatformIcon = (platform) => {
            const platformLower = platform.toLowerCase();
            for (const [key, icon] of Object.entries(platformIcons)) {
                if (platformLower.includes(key)) return icon;
            }
            return '🎮';
        };

        return (
            <Card key={game.id} className="game-card">
                <div className="game-image">
                    <img src={game.image} alt={game.title} onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=Jeu';
                    }} />
                    {game.price && game.price !== 'À venir' && (
                        <div className="game-price">{game.price}</div>
                    )}
                </div>
                <div className="game-info">
                    <h3>{game.title}</h3>
                    <p className="game-description">
                        {game.description?.substring(0, 120)}
                        {game.description?.length > 120 ? '...' : ''}
                    </p>
                    <div className="game-meta">
                        <span className="game-platform">
                            {getPlatformIcon(game.platform)} {game.platform}
                        </span>
                    </div>
                    {game.link && game.link !== '#' && (
                        <a 
                            href={game.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="game-link"
                        >
                            En savoir plus →
                        </a>
                    )}
                </div>
            </Card>
        );
    };

    return (
        <div className="jeuxvideo-container">
            <div className="jeuxvideo-header">
                <h2>🎮 Jeux Vidéo</h2>
                <p className="subtitle">Recherchez et découvrez des jeux</p>
            </div>

            {/* Search and Filters */}
            <div className="search-filters">
                <input
                    type="text"
                    placeholder="Rechercher un jeu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
                <select
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    className="platform-select"
                >
                    <option value="all">Toutes les plateformes</option>
                    <option value="pc">PC</option>
                    <option value="playstation">PlayStation</option>
                    <option value="xbox">Xbox</option>
                    <option value="switch">Switch</option>
                    <option value="android">Android</option>
                    <option value="ios">iOS</option>
                </select>
            </div>

            {/* Content */}
            {loading && (
                <div className="loading">
                    <h3>Chargement des jeux...</h3>
                    <div className="loading-spinner"></div>
                </div>
            )}

            {error && (
                <Card variant="game" className="error-card">
                    <h3>⚠️ {error}</h3>
                    <button onClick={fetchGames} className="retry-button">
                        Réessayer
                    </button>
                </Card>
            )}

            {!loading && !error && filteredGames.length === 0 && games.length === 0 && (
                <Card variant="game" className="welcome-card">
                    <h3>🎮 Découvrez des jeux</h3>
                    <p>Utilisez la barre de recherche pour trouver des jeux sur différentes plateformes</p>
                </Card>
            )}

            {!loading && !error && filteredGames.length === 0 && games.length > 0 && (
                <Card variant="game" className="no-results-card">
                    <h3>Aucun résultat</h3>
                    <p>Aucun jeu trouvé pour ces critères.</p>
                </Card>
            )}

            {!loading && filteredGames.length > 0 && (
                <div className="games-grid">
                    {filteredGames.map(game => renderGameCard(game))}
                </div>
            )}
        </div>
    );
}

export default JeuxVideo;