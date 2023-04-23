import './App.css';
import Login from './Login.js'
import Playlists from './Playlists';
// import Weather from './Weather';
import {useEffect, useState} from 'react';
import axios from 'axios';
import WeatherAPI from './WeatherAPI.js'
import { accessToken, logout } from './spotify';

import Button from '@mui/material/Button';


function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    setToken(accessToken);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify Playlist Generator</h1>
        <WeatherAPI />
        {!token ? (
          <Button variant="contained" href="http://localhost:9000/spotify/login">
            Log in to Spotify
          </Button>
        ) : (
          <>
            <h1>Logged in!</h1>
            <Button variant="contained" onClick={logout}>Log Out</Button>
          </>
        )}
        {/* <Weather /> */}
        {/* <Login />
        <Playlists /> */}
      </header>
    </div>
  );
}

export default App;
