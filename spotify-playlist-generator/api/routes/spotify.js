// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const cors = require('cors');

// Access the environment variables
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const router = express.Router();

// generateRandomString: generates a random string of specified length
const generateRandomString = length => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const stateKey = 'spotify_auth_state';

// Login route: generates an authorization URL and redirects the user to it
router.get('/login', function(req, res) {
  const state = generateRandomString(16);
  res.cookie(stateKey, state);

  const scope = 'user-read-private user-read-email';

  const queryParams = querystring.stringify({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    state: state,
    scope: scope,
    show_dialog: true,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

// Callback route: handles the response from Spotify after authorization
router.get('/callback', (req, res) => {
  const code = req.query.code || null;
  const error = req.query.error;
  if (error){
    console.log('callback error')
    res.redirect('http://localhost:3000');
  }
  else{
    // Request access and refresh tokens from Spotify
    axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI
      }),
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
      },
    })
    .then(response => {
      if (response.status === 200) {
        const { access_token, refresh_token, expires_in } = response.data;

        const queryParams = querystring.stringify({
          access_token,
          refresh_token,
          expires_in,
        });

        res.redirect(`http://localhost:3000/?${queryParams}`);

      } else {
        res.redirect(`/?${querystring.stringify({ error: 'invalid_token' })}`);
      }
    })
      .catch(error => {
        res.send(error);
      });
  }
});

// Refresh token route: refreshes access token using the refresh token
router.get('/refresh_token', (req, res) => {
  const { refresh_token } = req.query;

  axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    data: querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    }),
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
    },
  })
    .then(response => {
      res.send(response.data);
    })
    .catch(error => {
      res.send(error);
    });
});

module.exports = router;

// Recommendations route: fetches song recommendations based on genre and acousticness
router.get("/recommendations", (req, res) => {
  console.log("Received request");
  const access_token = req.headers.authorization.split(" ")[1];
  const genre = req.query.genre;
  const acousticness = req.query.acousticness;
  const limit = req.query.limit;

  // Make a request to the Spotify API for recommendations
  axios({
    method: "get",
    url: `https://api.spotify.com/v1/recommendations?seed_genres=${genre}&target_acousticness=${acousticness}&limit=${limit}`,
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })
    .then((response) => {
      console.log("Spotify API response:", response.data);
      res.json(response.data);
    })
    .catch((error) => {
      console.log("Error from Spotify API:", error.response.data);
      res.status(error.response.status).json(error.response.data);
    });
});

// Profile route: fetches user's profile information from the Spotify API
router.get("/profile", async (req, res) => {
  const accessToken = req.headers.authorization.split(" ")[1];

  try {
    // Make a request to the Spotify API for user's profile information
    const response = await axios.get("https://api.spotify.com/v1/me", {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch profile data from Spotify API" });
  }
});



