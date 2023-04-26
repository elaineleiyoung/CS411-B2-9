import { useState, useEffect } from 'react';
import axios from 'axios';

export function UseSpotifyToken() {
  const CLIENT_ID = process.env.REACT_APP_CLIENT_ID
  const REDIRECT_URI = "http://localhost:3000"
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"
  const [token, setToken] = useState("");

  useEffect(() => {
    const hash = window.location.hash
    let token = window.localStorage.getItem("token")

    if (!token && hash) {
        token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

        window.location.hash = ""
        window.localStorage.setItem("token", token)
    }

    setToken(token);

  }, []);

  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
  }

  async function fetchProfile(token) {
    const result = await axios("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });
    console.log(result)
    return result.data;
  }
  return [token, fetchProfile, logout];
}
