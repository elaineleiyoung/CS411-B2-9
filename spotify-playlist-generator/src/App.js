import { useEffect, useState } from 'react';
import { accessToken, login, logout } from './spotify';
import Button from '@mui/material/Button';
import WeatherAPI from './WeatherAPI.js';
import Profile from './Profile.js'
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  const handleLogin = () => {
    accessToken.then((token) => {
      setIsLoggedIn(token);
      login();
    });
  };

  // useEffect(() => {
  //   const accessToken = localStorage.getItem('accessToken');
  // }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsLoggedIn(null);
    logout();
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify Playlist Generator</h1>
        <WeatherAPI />
        {!isLoggedIn ? (
          <Button variant="contained" onClick={handleLogin}>
            Log in to Spotify
          </Button>
        ) : (
          <>
            <h1>Logged in!</h1>
            <Button variant="contained" onClick={handleLogout}>
              Log Out
            </Button>
            <Profile accessToken={accessToken} />
          </>
        )}
      </header>
    </div>
  );
}

export default App;
