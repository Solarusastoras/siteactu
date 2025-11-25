import React, { useState, useEffect } from 'react';
import FootballLeague from './FootballLeague';

/**
 * Composant conteneur générique pour toutes les ligues de football
 * Récupère directement les données depuis data.json
 */
const FootballLeagueContainer = ({ 
  leagueConfig,      // Configuration de la ligue (ligue1Config, premierLeagueConfig, etc.)
  standingsData,     // Données de classement par défaut (fallback)
  view = 'matches'   // Vue à afficher : 'matches', 'classement', 'avenir'
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Utiliser directement storageKey de la config (qui correspond à la clé dans data.json)
  const sportKey = leagueConfig.storageKey || leagueConfig.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log(`[${leagueConfig.name}] Fetching from: /actu/data/data.json avec sportKey: ${sportKey}`);
        const response = await fetch('/actu/data/data.json');
        if (!response.ok) throw new Error('Impossible de charger les données');
        
        const jsonData = await response.json();
        console.log(`[${leagueConfig.name}] JSON complet disponible:`, Object.keys(jsonData));
        console.log(`[${leagueConfig.name}] Sports disponibles:`, jsonData.sports ? Object.keys(jsonData.sports) : 'Aucun');
        
        const sportData = jsonData.sports?.[sportKey];
        
        if (!sportData) {
          console.warn(`[${leagueConfig.name}] Données pour "${sportKey}" non trouvées`);
          throw new Error(`Données ${leagueConfig.name} non disponibles`);
        }

        console.log(`[${leagueConfig.name}] Données récupérées:`, {
          matches: sportData.scoreboard?.events?.length || 0,
          standings: sportData.standings?.length || 0
        });

        setData(sportData);
        setError(null);
      } catch (err) {
        console.error(`[${leagueConfig.name}] Erreur chargement:`, err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh toutes les 10 secondes
    return () => clearInterval(interval);
  }, [sportKey, leagueConfig.name]);

  if (loading) return <div className="loading"><h2>Chargement {leagueConfig.name}...</h2></div>;
  
  if (error) {
    return (
      <div className="error-message">
        <h2>⚠️ Impossible de charger les données {leagueConfig.name}</h2>
        <p>{error}</p>
      </div>
    );
  }

  // Extraire les matchs et standings
  const matches = data?.scoreboard?.events || [];
  const standings = data?.standings || standingsData || [];

  return (
    <FootballLeague 
      leagueData={data}
      weekendMatches={matches}
      upcomingMatches={matches}
      standingsData={standings}
      leagueConfig={leagueConfig}
      view={view}
    />
  );
};

export default FootballLeagueContainer;
