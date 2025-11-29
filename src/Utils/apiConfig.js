// Configuration des chemins API selon l'environnement
export const getDataPath = () => {
  // En production sur OVH, utiliser /actu/data/data.json
  // En développement local, utiliser /data/data.json
  const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  return isProduction ? '/actu/data/data.json' : '/data/data.json';
};

export const fetchData = async () => {
  const response = await fetch(getDataPath());
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};
