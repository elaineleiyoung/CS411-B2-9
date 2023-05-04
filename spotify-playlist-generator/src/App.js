import { useEffect, useState } from 'react';
import { accessToken, login, logout } from './spotify';
import Button from '@mui/material/Button';
// import WeatherAPI from './todelete/WeatherAPI.js';
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
      const token = await accessToken;
      console.log('accessToken resolved:', token);
      setIsLoggedIn(token);
      await login();
      refreshAccessToken();
    } catch (error) {
      console.error('Error during login:', error);
    }
  };
  

  

  const refreshAccessToken = () => {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (storedRefreshToken) {
      axios.get(`http://localhost:9000/spotify/refresh_token?refresh_token=${storedRefreshToken}`)
        .then((response) => {
          localStorage.setItem('accessToken', response.data.access_token);
          localStorage.setItem('expiresIn', response.data.expires_in);
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
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('expiresIn', expiresIn);
        setIsLoggedIn(accessToken);
      }
  
      const loginClicked = localStorage.getItem('loginClicked');
      if (loginClicked === 'true') {
        const accessToken = localStorage.getItem('accessToken');
        const expiresIn = localStorage.getItem('expiresIn');
        const currentTime = Math.floor(new Date().getTime() / 1000);
  
        if (accessToken && expiresIn && currentTime >= expiresIn) {
          await refreshAccessToken();
        } else {
          setIsLoggedIn(accessToken);
        }
  
        console.log('The login button was clicked before the URL was redirected');
        localStorage.removeItem('loginClicked');
      }
    })();
  }, []);
  

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
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
