import React, { useState, useEffect } from "react";
import axios from "axios";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import {firebase} from "./firebase.js";
import { collection, getDocs } from "firebase/firestore";

// const db = firebase.firestore();

function Recommendations() {
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [weather, setWeather] = useState({ temp: null, description: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState("");
  const [genre, setGenre] = useState(null);
  const [tracks, setTracks] = useState(null);

  const [accessToken, setAccessToken] = useState("");

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


    if (temp < 10) {
      acousticness = (Math.random() * (1.0 - 0.7) + 0.7).toFixed(2);
    } else if (temp >= 10 && temp <= 25) {
      acousticness = (Math.random() * (0.7 - 0.3) + 0.3).toFixed(2);
    } else {
      acousticness = (Math.random() * (0.3 - 0.0) + 0.0).toFixed(2);
    }
    

    return { genre, acousticness };
  };
  

  const callWeatherAPI = async (location) => {
    const response = await axios.get(
      `http://localhost:9000/weatherAPI?location=${location}`
    );
    console.log(response.data)
    return response.data;
  };

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
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <TextField
          variant="standard"
          label="Enter location"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
        />
        <Button variant="contained" type="submit">
          Get weather and music recommendations
        </Button>
      </form>
  
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && !error && genre && (
        <div>
          <h2>Genre for {location}</h2>
          <p>{genre}</p>
          <h2>Weather for {location}</h2>
          <p>
            {weather.temp} °C, {weather.description}
          </p>
  
          {tracks && tracks.length > 0 ? (
            <div>
              <h2>Playlist Recommendation</h2>
              <ul>
                {tracks.map((track) => (
                  <li
                    key={track.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      margin: "10px 0",
                    }}
                  >
                    <img
                      src={track.album.images[0].url}
                      alt={`Album art for ${track.name}`}
                      style={{ width: "50px", height: "50px" }}
                    />
                    <div>
                      <h3 style={{ marginBottom: "5px" }}>{track.name}</h3>
                      <p style={{ fontSize: "14px", color: "#888" }}>
                        {track.artists.map((artist) => artist.name).join(", ")}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No tracks found.</p>
          )}
        </div>
      )}
  
      {!loading && !error && !genre && (
        <p>Enter a location to get weather and music recommendations</p>
      )}
    </div>
  );
      }
// }
export default Recommendations
