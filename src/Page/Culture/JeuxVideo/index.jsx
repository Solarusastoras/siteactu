import React, { useState, useEffect } from 'react';
import Card from '../../../Common/card';
import './JeuxVideo.scss';

function JeuxVideo() {
    const [activeView, setActiveView] = useState('news');
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
    }, [games, searchQuery, selectedPlatform, activeView]);

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

    const getDemoGames = () => {
        return [
            {
                id: 1,
                title: 'The Witcher 3: Wild Hunt',
                description: 'RPG épique dans un monde ouvert fantastique. Incarnez Geralt de Riv, chasseur de monstres.',
                image: 'https://cdn.akamai.steamstatic.com/steam/apps/292030/header.jpg',
                platform: 'PC, PS5, Xbox',
                price: '29.99€',
                link: 'https://store.steampowered.com/app/292030',
                type: 'news'
            },
            {
                id: 2,
                title: 'Cyberpunk 2077',
                description: 'RPG d\'action en monde ouvert dans Night City, une mégapole obsédée par le pouvoir.',
                image: 'https://cdn.akamai.steamstatic.com/steam/apps/1091500/header.jpg',
                platform: 'PC, PS5, Xbox',
                price: '39.99€',
                link: 'https://store.steampowered.com/app/1091500',
                type: 'news'
            },
            {
                id: 3,
                title: 'Baldur\'s Gate 3',
                description: 'RPG tactique basé sur Donjons & Dragons. Créez votre personnage et vivez une aventure épique.',
                image: 'https://cdn.akamai.steamstatic.com/steam/apps/1086940/header.jpg',
                platform: 'PC, PS5',
                price: '59.99€',
                link: 'https://store.steampowered.com/app/1086940',
                type: 'news'
            },
            {
                id: 4,
                title: 'Elden Ring',
                description: 'Action-RPG développé par FromSoftware en collaboration avec George R.R. Martin.',
                image: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/header.jpg',
                platform: 'PC, PS5, Xbox',
                price: '49.99€',
                link: 'https://store.steampowered.com/app/1245620',
                type: 'news'
            },
            {
                id: 5,
                title: 'GTA VI',
                description: 'Le prochain opus de la saga Grand Theft Auto. Retour à Vice City prévu pour 2025.',
                image: 'https://via.placeholder.com/460x215/1a1a1a/ff6b6b?text=GTA+VI',
                platform: 'PS5, Xbox, PC',
                price: 'À venir',
                link: '#',
                type: 'upcoming'
            },
            {
                id: 6,
                title: 'Hollow Knight: Silksong',
                description: 'Suite très attendue du metroidvania acclamé Hollow Knight.',
                image: 'https://via.placeholder.com/460x215/2c2c2c/4ecdc4?text=Silksong',
                platform: 'PC, Switch, PS5, Xbox',
                price: 'À venir',
                link: '#',
                type: 'upcoming'
            }
        ];
    };

    const filterGames = () => {
        let filtered = [...games];

        // Filter by view type
        if (activeView !== 'search') {
            filtered = filtered.filter(game => game.type === activeView);
        }

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

    const renderContent = () => {
        if (loading) {
            return (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Chargement des jeux...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="error-container">
                    <p className="error-message">⚠️ {error}</p>
                    <p className="info-message">📝 Utilisation des données de démonstration</p>
                    <button onClick={fetchGames} className="retry-button">
                        Réessayer
                    </button>
                </div>
            );
        }

        if (filteredGames.length === 0) {
            return (
                <div className="no-results">
                    <p>Aucun jeu trouvé pour ces critères.</p>
                </div>
            );
        }

        return (
            <div className="games-grid">
                {filteredGames.map(game => renderGameCard(game))}
            </div>
        );
    };

    return (
        <div className="jeuxvideo-container">
            <div className="jeuxvideo-header">
                <h2>🎮 Jeux Vidéo</h2>
                <p className="subtitle">Découvrez les dernières actualités et sorties à venir</p>
            </div>

            {/* Navigation Tabs */}
            <div className="tabs-container">
                <button
                    className={`tab ${activeView === 'news' ? 'active' : ''}`}
                    onClick={() => setActiveView('news')}
                >
                    🔥 Actualités
                </button>
                <button
                    className={`tab ${activeView === 'upcoming' ? 'active' : ''}`}
                    onClick={() => setActiveView('upcoming')}
                >
                    📅 À venir
                </button>
                <button
                    className={`tab ${activeView === 'search' ? 'active' : ''}`}
                    onClick={() => setActiveView('search')}
                >
                    🔍 Rechercher
                </button>
            </div>

            {/* Search and Filters */}
            {activeView === 'search' && (
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
            )}

            {/* Content */}
            {renderContent()}
        </div>
    );
}

export default JeuxVideo;