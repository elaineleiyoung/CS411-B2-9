import { useEffect, useState } from 'react';
import { accessToken, login, logout } from './spotify';
import Button from '@mui/material/Button';
import Profile from './Profile.js'
import Recommendations from './Recommendations';
import './App.css';
import axios from "axios";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  const handleLogin = async () => {
    console.log('handleLogin called');
    localStorage.setItem('loginClicked', 'true');
    try {
      const token = await login();
      console.log('accessToken resolved:', token);
      setIsLoggedIn(token);
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const refreshAccessToken = () => {
    const storedRefreshToken = localStorage.getItem('spotify_refresh_token');
    if (storedRefreshToken) {
      axios.get(`http://localhost:9000/spotify/refresh_token?refresh_token=${storedRefreshToken}`)
        .then((response) => {
          localStorage.setItem('spotify_access_token', response.data.access_token);
          localStorage.setItem('spotify_token_expire_time', response.data.expires_in);
          setIsLoggedIn(response.data.access_token);
        })
        .catch((error) => {
          console.log('Error refreshing token:', error);
        });
    }
  };

  useEffect(() => {
    (async () => {
      const url = window.location.href;
      const queryParams = new URLSearchParams(url.split('?')[1]);
  
      const accessToken = queryParams.get('access_token');
      const refreshToken = queryParams.get('refresh_token');
      const expiresIn = queryParams.get('expires_in');
  
      if (accessToken && refreshToken && expiresIn) {
        localStorage.setItem('spotify_access_token', accessToken);
        localStorage.setItem('spotify_refresh_token', refreshToken);
        localStorage.setItem('spotify_token_expire_time', expiresIn);
        setIsLoggedIn(accessToken);
      } else {
        refreshAccessToken();
      }
    })();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_token_expire_time');
    setIsLoggedIn(null);
    logout();
  
    // Remove access_token, refresh_token, and expires_in from the URL
    const url = new URL(window.location.href);
    url.searchParams.delete('access_token');
    url.searchParams.delete('refresh_token');
    url.searchParams.delete('expires_in');
    window.history.pushState({}, '', url);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify Playlist Generator</h1>
        <Recommendations />
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
            {/* Pass isLoggedIn state to the Profile component */}
            <Profile accessToken={isLoggedIn} />
          </>
        )}
      </header>
    </div>
  );
}

export default App;
