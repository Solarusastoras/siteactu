import { useState, useEffect } from 'react';

const DATA_URL = '/actu/data/data.json';
const REFRESH_INTERVAL = 10000; // 10 secondes

let cachedData = null;
let lastFetch = null;

export const useDataAPI = () => {
  const [data, setData] = useState(cachedData);
  const [loading, setLoading] = useState(!cachedData);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Si données en cache et récentes (< 30s), ne pas refetch
      if (cachedData && lastFetch && Date.now() - lastFetch < REFRESH_INTERVAL) {
        setData(cachedData);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(DATA_URL);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const jsonData = await response.json();
        cachedData = jsonData;
        lastFetch = Date.now();
        setData(jsonData);
        setError(null);
      } catch (err) {
        console.error('Erreur chargement data.json:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchData, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return { data, loading, error };
};

// Hook spécifique pour les sports
export const useSportsData = (sportKey) => {
  const { data, loading, error } = useDataAPI();
  
  return {
    sportData: data?.sports?.[sportKey] || null,
    loading,
    error
  };
};

// Hook spécifique pour les actualités
export const useNewsData = (newsKey) => {
  const { data, loading, error } = useDataAPI();
  
  return {
    newsData: data?.actus?.[newsKey] || [],
    loading,
    error
  };
};

// Hook spécifique pour la culture
export const useCultureData = (cultureKey) => {
  const { data, loading, error } = useDataAPI();
  
  return {
    cultureData: data?.culture?.[cultureKey] || [],
    loading,
    error
  };
};

// Hook spécifique pour le mercato
export const useMercatoData = (mercatoKey) => {
  const { data, loading, error } = useDataAPI();
  
  return {
    mercatoData: data?.mercato?.[mercatoKey] || [],
    loading,
    error
  };
};
