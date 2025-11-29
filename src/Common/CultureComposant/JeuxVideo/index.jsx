import React, { useState, useEffect } from 'react';
import Card from '../../card';
import './JeuxVideo.scss';

function JeuxVideo() {
    const [activeTab, setActiveTab] = useState('actu');
    const [actualites, setActualites] = useState([]);
    const [loadingActu, setLoadingActu] = useState(true);
    const [errorActu, setErrorActu] = useState(null);

    useEffect(() => {
        const fetchActu = async () => {
            try {
                const response = await fetch('./data/culture-jeuxvideo.json');
                const jsonData = await response.json();
                const jeuxvideoData = jsonData.items || [];
                setActualites(jeuxvideoData.map(item => ({
                    titre: item.title,
                    description: item.description,
                    lien: item.link,
                    date: new Date(item.pubDate).toLocaleDateString('fr-FR'),
                    image: item.image,
                    category: item.categories?.[0]
                })));
                setLoadingActu(false);
            } catch (err) {
                setErrorActu(err.message);
                setLoadingActu(false);
            }
        };

        fetchActu();
        const interval = setInterval(fetchActu, 60000);
        return () => clearInterval(interval);
    }, []);
    
    // États pour l'onglet "Chercher Jeu"
    const [games, setGames] = useState([]);
    const [filteredGames, setFilteredGames] = useState([]);
    const [loadingGames, setLoadingGames] = useState(false);
    const [errorGames, setErrorGames] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPlatform, setSelectedPlatform] = useState('all');

    // Google Sheet publié en CSV
    const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTOyYukGaAbj5Wv5AftfcJOD-adMA-7F5JLjoJWFCLR8ZHZlXguGyAnSesQHDJwR6IdFgv4CyAwrJO3/pub?output=csv';

    useEffect(() => {
        if (activeTab === 'search' && games.length === 0) {
            fetchGames();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    useEffect(() => {
        filterGames();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [games, searchQuery, selectedPlatform]);

    const fetchGames = async () => {
        setLoadingGames(true);
        setErrorGames(null);
        
        try {
            const timestamp = new Date().getTime();
            const response = await fetch(`${GOOGLE_SHEET_URL}&t=${timestamp}`);
            
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des données');
            }
            
            const csvText = await response.text();
            const parsedGames = parseCSV(csvText);
            setGames(parsedGames);
        } catch (err) {
            console.error('Erreur Google Sheets:', err);
            setErrorGames('Impossible de charger les données. Vérifiez que le Google Sheet est publié et contient des données.');
            setGames([]);
        } finally {
            setLoadingGames(false);
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

        if (searchQuery) {
            filtered = filtered.filter(game =>
                game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                game.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

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
                
                <div className="tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'actu' ? 'active' : ''}`}
                        onClick={() => setActiveTab('actu')}
                    >
                        📰 Actu Jeux Vidéo
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
                        onClick={() => setActiveTab('search')}
                    >
                        🔍 Chercher Jeu
                    </button>
                </div>
            </div>

            {/* Onglet Actu Jeux Vidéo */}
            {activeTab === 'actu' && (
                <div className="actu-jeuxvideo-section">
                    {loadingActu && (
                        <div className="loading">
                            <h3>Chargement des actualités...</h3>
                            <div className="loading-spinner"></div>
                        </div>
                    )}

                    {errorActu && (
                        <Card variant="game" className="error-card">
                            <h3>⚠️ Impossible de charger les actualités jeux vidéo</h3>
                            <p>{errorActu}</p>
                        </Card>
                    )}

                    {!loadingActu && !errorActu && (
                        <div className="actualites-grid">
                            {actualites && actualites.length > 0 ? (
                                actualites.map((actu, index) => (
                                    <Card key={index} variant="game" className="actu-card">
                                        {actu.image && (
                                            <div className="actu-image">
                                                <img src={actu.image} alt={actu.titre} onError={(e) => e.target.style.display = 'none'} />
                                                {actu.category && (
                                                    <div className="actu-category">{actu.category}</div>
                                                )}
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
                                <Card variant="game">
                                    <p>Aucune actualité disponible</p>
                                </Card>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Onglet Chercher Jeu */}
            {activeTab === 'search' && (
                <div className="search-jeuxvideo-section">
                    <p className="subtitle">Recherchez et découvrez des jeux</p>

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

                    {loadingGames && (
                        <div className="loading">
                            <h3>Chargement des jeux...</h3>
                            <div className="loading-spinner"></div>
                        </div>
                    )}

                    {errorGames && (
                        <Card variant="game" className="error-card">
                            <h3>⚠️ {errorGames}</h3>
                            <button onClick={fetchGames} className="retry-button">
                                Réessayer
                            </button>
                        </Card>
                    )}

                    {!loadingGames && !errorGames && filteredGames.length === 0 && games.length === 0 && (
                        <Card variant="game" className="welcome-card">
                            <h3>🎮 Découvrez des jeux</h3>
                            <p>Utilisez la barre de recherche pour trouver des jeux sur différentes plateformes</p>
                        </Card>
                    )}

                    {!loadingGames && !errorGames && filteredGames.length === 0 && games.length > 0 && (
                        <Card variant="game" className="no-results-card">
                            <h3>Aucun résultat</h3>
                            <p>Aucun jeu trouvé pour ces critères.</p>
                        </Card>
                    )}

                    {!loadingGames && filteredGames.length > 0 && (
                        <div className="games-grid">
                            {filteredGames.map(game => renderGameCard(game))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default JeuxVideo;