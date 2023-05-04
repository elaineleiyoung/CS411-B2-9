import { useEffect, useState } from 'react';
import { accessToken, login, logout } from './spotify';
import Button from '@mui/material/Button';
// import WeatherAPI from './todelete/WeatherAPI.js';
import Profile from './Profile.js'
import Recommendations from './Recommendations';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  const handleLogin = () => {
    console.log('handleLogin called');
    localStorage.setItem('loginClicked', 'true'); // Store a value indicating that the login button was clicked
    accessToken.then((token) => {
      console.log('accessToken resolved:', token);
      setIsLoggedIn(token);
      login();
    });
  };

  useEffect(() => {
    const loginClicked = localStorage.getItem('loginClicked'); // Retrieve the stored value
    if (loginClicked === 'true') {
      console.log('The login button was clicked before the URL was redirected');
      setIsLoggedIn(true); // Update the value of isLoggedIn
      localStorage.removeItem('loginClicked'); // Clear the stored value
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsLoggedIn(null);
    logout();
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
            <Profile accessToken={accessToken} />
          </>
        )}
      </header>
    </div>
  );
}

export default App;
