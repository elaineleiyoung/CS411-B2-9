require('dotenv').config();

console.log(process.env.CLIENT_ID);

const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
// Import the CORS package
const cors = require('cors');




// var CLIENT_ID =  process.env.REACT_APP_CLIENT_ID;
var CLIENT_ID = "e687e857785e45aaa016ecbbb7f49ba0";
var CLIENT_SECRET = "8c555068a8b84c4ab992ea6cc4e4be55";
var REDIRECT_URI= "http://localhost:9000/spotify/callback";

const router = express.Router();

const generateRandomString = length => {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };
  
  
  const stateKey = 'spotify_auth_state';

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
  

router.get('/callback', (req, res) => {
    const code = req.query.code || null;

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
});

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

router.get("/recommendations", (req, res) => {
  console.log("Received request");
  const access_token = req.headers.authorization.split(" ")[1];
  const genre = req.query.genre;
  const acousticness = req.query.acousticness;
  const limit = req.query.limit;

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





