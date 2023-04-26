import React, { useState } from "react";

const OPENCAGE_API_KEY = "487387173cf843608a6ede0711de3d9c"
const OPENWEATHER_API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY
function Weather() {
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCoordinates = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${location}&key=${OPENCAGE_API_KEY}`
      );

      if (!response.ok) {
        const data = await response.json();
        setError(data.status.message);
        setCoordinates(null);
      } else {
        const data = await response.json();
        setCoordinates(data.results[0].geometry);
        setError(null);
      }
    } catch (error) {
      setError(error.message);
      setCoordinates(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lng}&units=metric&appid=${OPENWEATHER_API_KEY}`
      );

      if (!response.ok) {
        const data = await response.json();
        setError(data.message);
        setWeather(null);
      } else {
        const data = await response.json();
        setWeather(data);
        setError(null);
      }
    } catch (error) {
      setError(error.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchCoordinates();
  };

  return (
    <div>
      <h2>Location</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="Enter location"
          required
        />
        <button type="submit">Search</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {coordinates && (
        <div>
          <h2>{location}</h2>
          <p>Latitude: {coordinates.lat.toFixed(2)}</p>
          <p>Longitude: {coordinates.lng.toFixed(2)}</p>
          <button onClick={fetchWeather}>Get weather</button>
        </div>
      )}
      {weather && (
        <div>
          <h2>Current Weather</h2>
          <p>{weather.weather[0].description}</p>
          <p>{weather.main.temp} &deg;C</p>
          <p>Humidity: {weather.main.humidity}%</p>
        </div>
      )}
    </div>
  );
}

export default Weather;
