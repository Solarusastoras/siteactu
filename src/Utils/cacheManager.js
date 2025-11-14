// Gestionnaire de cache global pour les données RSS
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

class CacheManager {
  constructor() {
    this.caches = {};
  }

  // Récupérer des données du cache
  get(key) {
    const cache = this.caches[key];
    if (!cache) return null;

    const now = Date.now();
    if (now - cache.timestamp > CACHE_DURATION) {
      // Cache expiré
      delete this.caches[key];
      return null;
    }

    return cache.data;
  }

  // Stocker des données dans le cache
  set(key, data) {
    this.caches[key] = {
      data,
      timestamp: Date.now()
    };
  }

  // Vérifier si le cache est valide
  isValid(key) {
    const cache = this.caches[key];
    if (!cache) return false;

    const now = Date.now();
    return (now - cache.timestamp) < CACHE_DURATION;
  }

  // Effacer un cache spécifique
  clear(key) {
    delete this.caches[key];
  }

  // Effacer tous les caches
  clearAll() {
    this.caches = {};
  }
}

// Instance unique
const cacheManager = new CacheManager();

export default cacheManager;
export { CACHE_DURATION };
