import './App.css';
import Login from './Login.js'
import Playlists from './Playlists';
// import Weather from './Weather';
import {useEffect, useState} from 'react';
import axios from 'axios';
import WeatherAPI from './WeatherAPI.js'


function App() {
  

  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify Playlist Generator</h1>
        <WeatherAPI />
        {/* <Weather /> */}
        <Login />
        <Playlists />
      </header>
    </div>
  );
}

export default App;
