import React, { Component } from "react";
import axios from "axios";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

class Reccomendations extends Component {
  constructor(props) {
    super(props);

    this.state = {
      location: "",
      coordinates: null,
      weather: { temp: null, description: null },
      loading: false,
      error: null,
      apiResponse: "",
      genre: null,
      tracks: null,
    };
  }

  // Function to map weather to Spotify genre
  mapWeatherToSpotifyGenre(temp, description) {
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
        genre = "chill";
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
    if (temp <= 10) {
      genre = "classical";
    } else if (temp <= 20) {
      genre = "indie";
    } else if (temp <= 30) {
      genre = "pop";
    } else {
      genre = "reggae";
    }

    return genre;
  }

  callAPI() {
    fetch("http://localhost:9000/weatherAPI")
      .then(res => res.text())
      .then(res => this.setState({ apiResponse: res }));
  }

  componentDidMount() {
    this.callAPI();
  }

  handleSubmit = async (event) => {
    event.preventDefault();
  
    // Check if location is empty
    if (!this.state.location.trim()) {
      alert("Please enter a valid location");
      return;
    }
  
    try {
      this.setState({ loading: true, error: null });
  
      const response = await axios.get(
        `http://localhost:9000/weatherAPI?location=${this.state.location}`
      );
      const data = response.data;

      // Map weather to Spotify genre
      const genre = this.mapWeatherToSpotifyGenre(
        data.weather.main.temp,
        data.weather.weather[0].description
      );

      // Get track recommendations from Spotify
      const accessToken = this.props.accessToken;
      const token = await accessToken
      const url = `https://api.spotify.com/v1/recommendations?seed_genres=${genre}&limit=10`;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const tracksResponse = await axios.get(url, config);
      const tracks = tracksResponse.data.tracks;

      

      this.setState({
        location: data.location,
        coordinates: data.coordinates,
        weather: {
          temp: data.weather.main.temp,
          description: data.weather.weather[0].description,
        },
        loading: false,
        error: null,
        genre,
        tracks,
      });
    } catch (error) {
      this.setState({
        error: error.message,
        location: "",
        coordinates: null,
        weather: { temp: null, description: null },
        loading: false,
        genre: null,
        tracks: null,
      });
    }
  };

  render() {
    const {
      location,
      coordinates,
      weather,
      loading,
      error,
      genre,
      tracks,
    } = this.state;
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <TextField
            variant="standard"
            label="Enter location"
            value={this.state.location}
            onChange={(event) =>
              this.setState({ location: event.target.value })
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
  
            <h2>Track recommendations</h2>
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
}
export default Reccomendations
