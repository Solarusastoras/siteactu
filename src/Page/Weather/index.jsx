import React, { useState, useEffect } from 'react';
import './Weather.scss';
import Card from '../../Common/card';

const Weather = () => {
  const [customCity, setCustomCity] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!searchCity) return;
      
      try {
        setLoading(true);
        setError(null);

        // Géocodage pour obtenir les coordonnées de la ville
        const geoResponse = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchCity)}&count=1&language=fr&format=json`
        );
        const geoData = await geoResponse.json();
        
        if (!geoData.results || geoData.results.length === 0) {
          setError('Ville introuvable');
          setWeatherData(null);
          setLoading(false);
          return;
        }

        const location = geoData.results[0];
        const { latitude, longitude, name, country } = location;

        // Récupération des données météo
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weathercode,sunrise,sunset,uv_index_max,wind_speed_10m_max&hourly=temperature_2m,precipitation_probability,weathercode,wind_speed_10m&timezone=auto&forecast_days=7`
        );
        const weatherData = await weatherResponse.json();
        
        setWeatherData({
          city: name,
          country: country,
          latitude: latitude,
          longitude: longitude,
          current: {
            temperature: weatherData.hourly.temperature_2m[0],
            weathercode: weatherData.hourly.weathercode[0],
            windSpeed: weatherData.hourly.wind_speed_10m[0],
            precipitationProbability: weatherData.hourly.precipitation_probability[0]
          },
          daily: weatherData.daily
        });
      } catch (err) {
        console.error('Erreur météo:', err);
        setError('Erreur lors de la récupération des données');
        setWeatherData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [searchCity]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (customCity.trim()) {
      setSearchCity(customCity.trim());
    }
  };

  const renderRegion = () => {
    return renderCustomWeather();
  };

  const parseTemperature = (temp) => {
    if (temp === null || temp === undefined) return 'N/A';
    return `${Math.round(temp)}°C`;
  };

  const getWeatherIcon = (weathercode) => {
    // WMO Weather interpretation codes
    if (weathercode === 0) return '☀️'; // Clear sky
    if (weathercode <= 3) return '🌤️'; // Partly cloudy
    if (weathercode <= 48) return '🌫️'; // Fog
    if (weathercode <= 67) return '🌧️'; // Rain
    if (weathercode <= 77) return '❄️'; // Snow
    if (weathercode <= 82) return '🌧️'; // Rain showers
    if (weathercode <= 86) return '❄️'; // Snow showers
    if (weathercode <= 99) return '⛈️'; // Thunderstorm
    return '☁️';
  };

  const getWeatherDescription = (weathercode) => {
    const descriptions = {
      0: 'Ciel dégagé',
      1: 'Plutôt dégagé',
      2: 'Partiellement nuageux',
      3: 'Couvert',
      45: 'Brouillard',
      48: 'Brouillard givrant',
      51: 'Bruine légère',
      53: 'Bruine modérée',
      55: 'Bruine dense',
      61: 'Pluie légère',
      63: 'Pluie modérée',
      65: 'Pluie forte',
      71: 'Neige légère',
      73: 'Neige modérée',
      75: 'Neige forte',
      80: 'Averses légères',
      81: 'Averses modérées',
      82: 'Averses violentes',
      95: 'Orage',
      96: 'Orage avec grêle légère',
      99: 'Orage avec grêle forte'
    };
    return descriptions[weathercode] || 'Non défini';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const renderCustomWeather = () => {
    if (loading) {
      return (
        <div className="loading">
          <h2>Chargement...</h2>
          <div className="loading-spinner"></div>
        </div>
      );
    }

    if (error) {
      return (
        <Card variant="weather" className="weather-error">
          <h2>{error}</h2>
          <p>Vérifiez l'orthographe de la ville et réessayez.</p>
        </Card>
      );
    }

    if (!weatherData) {
      return (
        <div className="welcome-message">
          <Card variant="weather" className="welcome-card">
            <h2>🌤️ Bienvenue sur la météo</h2>
            <p>Entrez le nom d'une ville pour voir les prévisions sur 7 jours</p>
          </Card>
        </div>
      );
    }

    return (
      <div className="custom-weather">
        <Card variant="weather" className="current-weather-large">
          <div className="weather-main">
            <div className="weather-icon-large">
              {getWeatherIcon(weatherData.current.weathercode)}
            </div>
            <div className="weather-info">
              <h2>{weatherData.city}, {weatherData.country}</h2>
              <div className="temperature">{parseTemperature(weatherData.current.temperature)}</div>
              <p className="description">{getWeatherDescription(weatherData.current.weathercode)}</p>
              <div className="weather-details">
                <div className="detail-item">
                  <span className="detail-label">💨 Vent :</span>
                  <span className="detail-value">{Math.round(weatherData.current.windSpeed)} km/h</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">💧 Précipitations :</span>
                  <span className="detail-value">{weatherData.current.precipitationProbability || 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {weatherData.daily && (
          <div className="forecast-section">
            <h3>🗓️ Prévisions sur 7 jours</h3>
            <div className="forecast-grid">
              {weatherData.daily.time.map((date, index) => (
                <Card key={index} variant="weather" className="forecast-card">
                  <div className="forecast-day">
                    <h4>{formatDate(date)}</h4>
                    <div className="forecast-icon">{getWeatherIcon(weatherData.daily.weathercode[index])}</div>
                    <div className="forecast-temps">
                      <span className="temp-max">{Math.round(weatherData.daily.temperature_2m_max[index])}°</span>
                      <span className="temp-sep">/</span>
                      <span className="temp-min">{Math.round(weatherData.daily.temperature_2m_min[index])}°</span>
                    </div>
                    <p className="forecast-desc">{getWeatherDescription(weatherData.daily.weathercode[index])}</p>
                    <div className="forecast-details">
                      <div className="detail-small">
                        <span>💨 {Math.round(weatherData.daily.wind_speed_10m_max[index])} km/h</span>
                      </div>
                      <div className="detail-small">
                        <span>💧 {weatherData.daily.precipitation_probability_max[index] || 0}%</span>
                      </div>
                      {weatherData.daily.precipitation_sum[index] > 0 && (
                        <div className="detail-small">
                          <span>🌧️ {weatherData.daily.precipitation_sum[index]} mm</span>
                        </div>
                      )}
                      {weatherData.daily.uv_index_max[index] > 0 && (
                        <div className="detail-small">
                          <span>☀️ UV {Math.round(weatherData.daily.uv_index_max[index])}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="weather-container">
      <header className="weather-header">
        <h1>🌤️ Météo sur 7 jours</h1>
        <p className="date">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        
        <form onSubmit={handleSearch} className="city-search">
          <input
            type="text"
            value={customCity}
            onChange={(e) => setCustomCity(e.target.value)}
            placeholder="Entrez votre ville..."
            className="search-input"
          />
          <button type="submit" className="search-btn">
            🔍 Rechercher
          </button>
        </form>
      </header>

      <main className="weather-content">
        {renderRegion()}
      </main>

      <footer className="weather-footer">
        <p>Données fournies par Open-Meteo API</p>
        <small>Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR')}</small>
      </footer>
    </div>
  );
};

export default Weather;
