import React, { useState, useEffect } from "react";
import axios from "axios";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import {firebase} from "./firebase.js";
import { collection, getDocs } from "firebase/firestore";
import './style/Recommendations.css'

// Recommendations component: main component to handle user input, display weather and music recommendations
function Recommendations() {
  // State variables for user input, weather data, Spotify recommendations and access token
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [weather, setWeather] = useState({ temp: null, description: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [genre, setGenre] = useState(null);
  const [tracks, setTracks] = useState(null);
  const [accessToken, setAccessToken] = useState("");

  // Fetch access token from Firestore

  useEffect(() => {
    const db = collection(firebase, "spotifyTokensCollection");
    console.log(db)

    getDocs(db).then((querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => doc.data().accessToken);
      setAccessToken(data[0]);
    });
  }, []);


  // Function to map weather to Spotify genre
  const mapWeatherToSpotifyAttributes = (temp, description) => {
    let genre;
    let acousticness;
  
    // changes genre based on weather description
    switch (description.toLowerCase()) {
      case "clear sky":
        genre = "pop";
        break;
      case "few clouds":
        genre = "indie-pop";
        break;
      case "overcast clouds":
        genre = "indie";
        break;
      case "broken clouds":
        genre = "alt-rock";
        break;
      case "shower rain":
        genre = "rainy-day";
        break;
      case "rain":
        genre = "jazz";
        break;
      case "thunderstorm":
        genre = "metal";
        break;
      case "snow":
        genre = "classical";
        break;
      case "mist":
        genre = "ambient";
        break;
      default:
        genre = "pop";
        break;
    }


    // changes acousticness parameter based on temperature
    if (temp < 10) {
      acousticness = (Math.random() * (1.0 - 0.7) + 0.7).toFixed(2);
    } else if (temp >= 10 && temp <= 25) {
      acousticness = (Math.random() * (0.7 - 0.3) + 0.3).toFixed(2);
    } else {
      acousticness = (Math.random() * (0.3 - 0.0) + 0.0).toFixed(2);
    }
    

    return { genre, acousticness };
  };
  

  // callWeatherAPI: fetches weather data for the given location
  const callWeatherAPI = async (location) => {
    const response = await axios.get(
      `http://localhost:9000/weatherAPI?location=${location}`
    );
    console.log(response.data)
    return response.data;
  };

  // callRecommendationsAPI: fetches Spotify recommendations based on the genre, acousticness, and access token
  const callRecommendationsAPI = async (genre, acousticness, accessToken) => {
    console.log(accessToken)
    try {
      console.log("Calling recommendations API with genre:", genre);

      const encodedGenre = encodeURIComponent(genre);
      const encodedAcousticness = encodeURIComponent(acousticness);
      const requestUrl = `http://localhost:9000/spotify/recommendations?genre=${encodedGenre}&acousticness=${encodedAcousticness}&limit=10`;
      const requestHeaders = {
        Authorization: `Bearer ${accessToken}`,
      };
  
      const response = await axios.get(requestUrl, {
        headers: requestHeaders,
      });
      // console.log(response.data);
      return response.data;
    } catch (error) {
      console.error('Error from backend:', error.response.data);
    }
  };
  

  // handleSubmit: handles the form submission, fetches weather and Spotify recommendations
  const handleSubmit = async (event) => {
  event.preventDefault();

  // Check if location is empty
  if (!location.trim()) {
    alert("Please enter a valid location");
    return;
  }

  try {
    setLoading(true);
    setError(null);

    const weatherData = await callWeatherAPI(location);


    // Map weather to Spotify genre
    const { genre, acousticness } = mapWeatherToSpotifyAttributes(
      weatherData.weather.main.temp,
      weatherData.weather.weather[0].description
    );

    // Get track recommendations from Spotify
    const recommendationsData = await callRecommendationsAPI(genre, acousticness, accessToken);

    setLocation(weatherData.location);
      setCoordinates(weatherData.coordinates);
      setWeather({
        temp: weatherData.weather.main.temp,
        description: weatherData.weather.weather[0].description,
      });
      setLoading(false);
      setError(null);
      setGenre(genre);
      setTracks(recommendationsData.tracks);
    } catch (error) {
      setError(error.message);
      setLocation("");
      setCoordinates(null);
      setWeather({ temp: null, description: null });
      setLoading(false);
      setGenre(null);
      setTracks(null);
    }
  };

  // Rendering: displays the form, weather data, and music recommendations
  return (
    <div className="app-container">
      <p className="app-description">Our application takes the current weather of any location searched and uses the temperature to adjust the acousticness and the weather description to adjust the genre of your song recommendations.</p>
      <form className="app-form" onSubmit={handleSubmit}>
        <TextField
          className="app-form-textfield"
          variant="standard"
          label="Enter location"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
        />
        <Button className="app-form-button" variant="contained" type="submit">
          Get weather and music recommendations
        </Button>
      </form>

      {loading && <p className="app-loading">Loading...</p>}
      {error && <p className="app-error">Error: {error}</p>}
      {!loading && !error && genre && (
        <div>
          <h2 className="app-result-heading">Genre for {location}</h2>
          <p className="app-result-text">{genre}</p>
          <h2 className="app-result-heading">Weather for {location}</h2>
          <p className="app-result-text">
            {weather.temp} °C, {weather.description}
          </p>

          {tracks && tracks.length > 0 ? (
            <div>
              <h2 className="app-result-heading">Song Recommendations for Your Playlist:</h2>
              <ul className="app-tracks-list">
                {tracks.map((track) => (
                  <li
                    key={track.id}
                    className="app-track"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      margin: "10px 0",
                    }}
                  >
                    <img
                      className="app-track-image"
                      src={track.album.images[0].url}
                      alt={`Album art for ${track.name}`}
                      style={{ width: "50px", height: "50px" }}
                    />
                    <div className="app-track-details">
                      <div className="app-track-info">
                        <div>
                          <h3 className="app-track-name">{track.name}</h3>
                          <p className="app-track-artists">
                            {track.artists.map((artist) => artist.name).join(", ")}
                          </p>
                        </div>
                        <div className="app-track-right">
                          <p className="app-track-album">Album: {track.album.name}</p>
                          <p className="app-track-release-date">
                            Release Date: {track.album.release_date}
                          </p>
                        </div>
                      </div>
                    </div>

                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="app-no-tracks">No tracks found.</p>
          )}
        </div>
      )}

      {!loading && !error && !genre && (
        <p className="app-start-message">Enter a location to get weather and music recommendations</p>
      )}
    </div>

  );
      }
// }
export default Recommendations
