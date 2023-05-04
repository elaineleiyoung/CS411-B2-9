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
  const mapWeatherToSpotifyGenre = (temp, description) => {
    let genre;

    // Map weather description to Spotify genre using switch statement
    switch (description.toLowerCase()) {
      case "clear sky":
        genre = "pop";
        break;
      case "few clouds":
        genre = "indie pop";
        break;
      case "scattered clouds":
        genre = "indie";
        break;
      case "broken clouds":
        genre = "alternative rock";
        break;
      case "shower rain":
        // genre = "chill";
        genre="rainy-day"
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

    // Map temperature range to Spotify genre
    // if (temp <= 10) {
    //   genre = "classical";
    // } else if (temp <= 20) {
    //   genre = "indie";
    // } else if (temp <= 30) {
    //   genre = "pop";
    // } else {
    //   genre = "reggae";
    // }

    return genre;
  }

  const callAPI = async (location) => {
    const response = await axios.get(
      `http://localhost:9000/weatherAPI?location=${location}`
    );
    console.log(response.data)
    return response.data;
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

    const data = await callAPI(location);


    // Map weather to Spotify genre
    const genre = mapWeatherToSpotifyGenre(
      data.weather.main.temp,
      data.weather.weather[0].description
    );

    // Get track recommendations from Spotify
    const token = accessToken
    console.log(token)
    const url = `https://api.spotify.com/v1/recommendations?seed_genres=${genre}&limit=10`;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const tracksResponse = await axios.get(url, config);
    const tracks = tracksResponse.data.tracks;
    setLocation(data.location);
    setCoordinates(data.coordinates);
    setWeather({
      temp: data.weather.main.temp,
      description: data.weather.weather[0].description,
    });
    setLoading(false);
    setError(null);
    setGenre(genre);
    setTracks(tracks);
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
            onChange={(event) =>
              setLocation(event.target.value)
            }
          />
          <Button variant="contained" type="submit">Get weather and music recommendations</Button>
        </form>
  
        {loading && <p>Loading...</p>}
        {error && <p>Error: {error}</p>}
        {!loading && !error && genre && (
          <div>
            <h2>Genre for {location}</h2>
            <p>{genre}</p>
            <h2>Weather for {location}</h2>
            <p>{weather.temp} °C, {weather.description}</p>
  
            <h2>Playlist Reccomendation</h2>
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
        )}
  
        {!loading && !error && !genre && (
          <p>Enter a location to get weather and music recommendations</p>
        )}
      </div>
    );
  }
// }
export default Recommendations
