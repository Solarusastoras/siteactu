import React, { useState, useEffect } from 'react';
import './Weather.scss';
import Card from '../../Common/card';

const Weather = () => {
  const [customCity, setCustomCity] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCurrentModal, setShowCurrentModal] = useState(false);
  const [selectedDayModal, setSelectedDayModal] = useState(null);

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
      return null;
    }

    return (
      <div className="custom-weather">
        {showCurrentModal && (
          <div className="weather-modal" onClick={() => setShowCurrentModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowCurrentModal(false)}>✕</button>
              <h2>🌤️ Météo actuelle</h2>
              <h3>{weatherData.city}, {weatherData.country}</h3>
              <div className="modal-icon">{getWeatherIcon(weatherData.current.weathercode)}</div>
              <div className="modal-temp">{parseTemperature(weatherData.current.temperature)}</div>
              <p className="modal-desc">{getWeatherDescription(weatherData.current.weathercode)}</p>
              <div className="modal-details-grid">
                <div className="modal-detail-item">
                  <span className="modal-detail-icon">💨</span>
                  <span className="modal-detail-label">Vent</span>
                  <span className="modal-detail-value">{Math.round(weatherData.current.windSpeed)} km/h</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-icon">💧</span>
                  <span className="modal-detail-label">Précipitations</span>
                  <span className="modal-detail-value">{weatherData.current.precipitationProbability || 0}%</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-icon">🌡️</span>
                  <span className="modal-detail-label">Température</span>
                  <span className="modal-detail-value">{parseTemperature(weatherData.current.temperature)}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-icon">🌪️</span>
                  <span className="modal-detail-label">Conditions</span>
                  <span className="modal-detail-value">{getWeatherDescription(weatherData.current.weathercode)}</span>
                </div>
              </div>
            </div>
          </div>
        )}



        {selectedDayModal !== null && weatherData.daily && (
          <div className="weather-modal" onClick={() => setSelectedDayModal(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelectedDayModal(null)}>✕</button>
              <h2>📅 Prévisions détaillées</h2>
              <h3>{formatDate(weatherData.daily.time[selectedDayModal])}</h3>
              <div className="modal-icon">{getWeatherIcon(weatherData.daily.weathercode[selectedDayModal])}</div>
              <div className="modal-temp">
                {Math.round(weatherData.daily.temperature_2m_max[selectedDayModal])}° / {Math.round(weatherData.daily.temperature_2m_min[selectedDayModal])}°
              </div>
              <p className="modal-desc">{getWeatherDescription(weatherData.daily.weathercode[selectedDayModal])}</p>
              <div className="modal-details-grid">
                <div className="modal-detail-item">
                  <span className="modal-detail-icon">🌡️</span>
                  <span className="modal-detail-label">Température Max</span>
                  <span className="modal-detail-value">{Math.round(weatherData.daily.temperature_2m_max[selectedDayModal])}°C</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-icon">🌡️</span>
                  <span className="modal-detail-label">Température Min</span>
                  <span className="modal-detail-value">{Math.round(weatherData.daily.temperature_2m_min[selectedDayModal])}°C</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-icon">💨</span>
                  <span className="modal-detail-label">Vent Max</span>
                  <span className="modal-detail-value">{Math.round(weatherData.daily.wind_speed_10m_max[selectedDayModal])} km/h</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-icon">💧</span>
                  <span className="modal-detail-label">Précipitations</span>
                  <span className="modal-detail-value">{weatherData.daily.precipitation_probability_max[selectedDayModal] || 0}%</span>
                </div>
                {weatherData.daily.precipitation_sum[selectedDayModal] > 0 && (
                  <div className="modal-detail-item">
                    <span className="modal-detail-icon">🌧️</span>
                    <span className="modal-detail-label">Quantité de pluie</span>
                    <span className="modal-detail-value">{weatherData.daily.precipitation_sum[selectedDayModal]} mm</span>
                  </div>
                )}
                {weatherData.daily.uv_index_max[selectedDayModal] > 0 && (
                  <div className="modal-detail-item">
                    <span className="modal-detail-icon">☀️</span>
                    <span className="modal-detail-label">Indice UV</span>
                    <span className="modal-detail-value">{Math.round(weatherData.daily.uv_index_max[selectedDayModal])}</span>
                  </div>
                )}
                <div className="modal-detail-item">
                  <span className="modal-detail-icon">🌅</span>
                  <span className="modal-detail-label">Lever du soleil</span>
                  <span className="modal-detail-value">{new Date(weatherData.daily.sunrise[selectedDayModal]).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-icon">🌇</span>
                  <span className="modal-detail-label">Coucher du soleil</span>
                  <span className="modal-detail-value">{new Date(weatherData.daily.sunset[selectedDayModal]).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="weather-container">
      <header className="weather-header">
        <div className="header-left">
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
        </div>
        
        {weatherData && weatherData.daily && (
          <div className="header-weather-display">
            <div className="current-day-wrapper">
              <Card variant="weather" className="header-current-card" onClick={() => setShowCurrentModal(true)}>
                <div className="forecast-icon">{getWeatherIcon(weatherData.daily.weathercode[0])}</div>
                <div className="forecast-temps">
                  <span className="temp-max">{Math.round(weatherData.daily.temperature_2m_max[0])}°</span>
                  <span className="temp-min">{Math.round(weatherData.daily.temperature_2m_min[0])}°</span>
                </div>
              </Card>
              <div className="current-datetime">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} - {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <div className="header-forecast-cards">
              {weatherData.daily.time.slice(1, 7).map((date, index) => (
                <Card key={index} variant="weather" className="header-forecast-card" onClick={() => setSelectedDayModal(index + 1)}>
                  <div className="forecast-icon">{getWeatherIcon(weatherData.daily.weathercode[index + 1])}</div>
                  <div className="forecast-temps">
                    <span className="temp-max">{Math.round(weatherData.daily.temperature_2m_max[index + 1])}°</span>
                    <span className="temp-min">{Math.round(weatherData.daily.temperature_2m_min[index + 1])}°</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="weather-content">
        {renderRegion()}
      </main>
    </div>
  );
};

export default Weather;
