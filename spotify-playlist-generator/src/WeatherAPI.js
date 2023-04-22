import React, { Component } from "react";
import axios from 'axios';

class WeatherAPI extends Component {
  state = {
    location: "",
    coordinates: null,
    weather: { temp: null, description: null },
    loading: false,
    error: null,
    apiResponse: ""
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

    try {
      this.setState({ loading: true, error: null });

      const response = await axios.get(`http://localhost:9000/weatherAPI?location=${this.state.location}`);
      const data = response.data;
      this.setState({ 
        location: data.location,
        coordinates: data.coordinates,
        weather: { temp: data.weather.main.temp, description: data.weather.weather[0].description },
        loading: false,
        error: null
      });
    } catch (error) {
      this.setState({ 
        error: error.message,
        location: "",
        coordinates: null,
        weather: { temp: null, description: null },
        loading: false
      });
    }
  };

  render() {
    const { location, coordinates, weather, loading, error, apiResponse } = this.state;
    return (
      <div>
        <h1>Weather App</h1>
        <form onSubmit={this.handleSubmit}>
          <input
            type="text"
            value={location}
            onChange={(event) => this.setState({ location: event.target.value })}
            placeholder="Enter location"
          />
          <button type="submit">Search</button>
        </form>
        <p className="App-intro"></p>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {weather.description && (
          <div>
            <h2>Weather for {location}</h2>
            <p>Temperature: {weather.temp}°C</p>
            <p>Description: {weather.description}</p>
          </div>
        )}
      </div>
    );
  }
}

export default WeatherAPI;