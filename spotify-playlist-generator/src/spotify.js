import { useState, useEffect } from 'react';
import axios from 'axios';
import {firebase} from './firebase.js';
import {
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  setDoc,
  updateDoc,
  where,
  get,
  doc,
  orderBy,
  limit,
  query,
} from 'firebase/firestore';

const LOCALSTORAGE_KEYS = {
  accessToken: 'spotify_access_token',
  refreshToken: 'spotify_refresh_token',
  expireTime: 'spotify_token_expire_time',
  timestamp: 'spotify_token_timestamp',
};

const spotifyTokensCollection = collection(firebase, 'spotifyTokensCollection');

export const getAccessToken = async () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const queryParams = {
    accessToken: urlParams.get('access_token'),
    refreshToken: urlParams.get('refresh_token'),
    expireTime: urlParams.get('expires_in'),
  };
  const hasError = urlParams.get('error');
  const hasFailure = urlParams.get('failure');
  if (hasFailure) {
    window.location.href = 'http://localhost:3000';
    return null;
  }

  // If there's an error OR the token in Firebase has expired, refresh the token
  if (hasError || await hasTokenExpired()) {
    await refreshToken();
  }

  // Check if token is present in local storage
  const userToken = window.localStorage.getItem(LOCALSTORAGE_KEYS.accessToken);
  if (userToken) {
    return userToken;
  }

  // If there is a token in the URL query params, user is logging in for the first time
  if (queryParams.accessToken) {
    // Store the query params in localStorage
    window.localStorage.setItem(LOCALSTORAGE_KEYS.accessToken, queryParams.accessToken);
    window.localStorage.setItem(LOCALSTORAGE_KEYS.refreshToken, queryParams.refreshToken);
    window.localStorage.setItem(LOCALSTORAGE_KEYS.expireTime, queryParams.expireTime);
    window.localStorage.setItem(LOCALSTORAGE_KEYS.timestamp, Date.now().toString());

    // Store the query params in Firebase
    try {
      await addDoc(spotifyTokensCollection, {
        accessToken: queryParams.accessToken,
        refreshToken: queryParams.refreshToken,
        expireTime: Date.now() + Number(queryParams.expireTime),
        timestamp: Date.now().toString(),
      });
    } catch (error) {
      console.error("Error adding document: ", error);
    }

    // Return access token from query params
    return queryParams.accessToken;
  }

  // If no token found in local storage or URL query params, redirect to login
  // window.location.href = 'http://localhost:9000/spotify/login';
  return null;
};

const hasTokenExpired = async () => {
  const tokenData = {
    expireTime: Number(window.localStorage.getItem(LOCALSTORAGE_KEYS.expireTime)),
    timestamp: Number(window.localStorage.getItem(LOCALSTORAGE_KEYS.timestamp)),
  };

  if (!tokenData.expireTime || !tokenData.timestamp) {
    return false;
  }

  const millisecondsElapsed = Date.now() - tokenData.timestamp;
  return (millisecondsElapsed / 1000) > Number(tokenData.expireTime);
};


const refreshToken = async () => {
  try {
    const q = query(collection(firebase, "spotifyTokensCollection"), orderBy("expireTime", "desc"), limit(1));
    const snapshot = await getDocs(q);
    console.log(snapshot)
    if (snapshot.empty) {
      console.error('No refresh token available');
      logout();
      return;
    }
    const tokenData = snapshot.docs[0].data();
    const tokenId = snapshot.docs[0].id;
    const refreshTokenValue = tokenData.refreshToken;
    console.log(refreshTokenValue)

    const now = Date.now();
    const threshold = 60 * 1000; // 1 minute

    if (tokenData.expireTime - now > threshold) {
      console.log('Token is still valid');
      return;
    }

    if (!refreshTokenValue || refreshTokenValue === 'undefined') {
      console.error('No refresh token available');
      logout();
      return;
    }

    const { data } = await axios.get(`http://localhost:9000/spotify/refresh_token?refresh_token=${refreshTokenValue}`);

    if (!data.access_token || !data.expires_in) {
      console.error('Error refreshing token');
      logout();
      return;
    }

    const newTokenData = {
      expireTime: now + (data.expires_in * 1000),
      refreshToken: data.refresh_token || refreshTokenValue,
      userToken: data.access_token,
    };

    // Update the token data in Firebase
    await updateDoc(doc(collection(firebase, "spotifyTokensCollection"), tokenId), newTokenData);

    // Store the new token data in local storage
    window.localStorage.setItem(LOCALSTORAGE_KEYS.accessToken, newTokenData.userToken);
    window.localStorage.setItem(LOCALSTORAGE_KEYS.refreshToken, newTokenData.refreshToken);
    window.localStorage.setItem(LOCALSTORAGE_KEYS.expireTime, newTokenData.expireTime.toString());
    window.localStorage.setItem(LOCALSTORAGE_KEYS.timestamp, Date.now().toString());

    console.log('Token refreshed');
  } catch (e) {
    console.error(e);
    logout();
  }
};

const refreshUserToken = async (refreshToken) => {
  try {
    const response = await axios.get(`http://localhost:9000/spotify/refresh_token?refresh_token=${refreshToken}`);
    return response.data.access_token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};

/**
 * Clear out all localStorage items we've set and reload the page
 * @returns {void}
 */

export const logout = async () => {
  try {
    // Remove token from Firebase collection
    const query = collection(firebase, "spotifyTokensCollection");
    const snapshot = await getDocs(query);
    snapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  } catch (e) {
    console.error("Error deleting token from Firebase collection: ", e);
  }

  // Clear all localStorage items
  for (const property in LOCALSTORAGE_KEYS) {
    window.localStorage.removeItem(LOCALSTORAGE_KEYS[property]);
  }

  // Navigate to homepage
  window.location = window.location.origin;
  
};

export const login = async () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const accessToken = urlParams.get('access_token');
  const refreshToken = urlParams.get('refresh_token');
  const expireTime = urlParams.get('expires_in');
  console.log("hello", accessToken)
  if (!accessToken) {
    // User is not logged in
    const newAccessToken = await getAccessToken();
    window.location.href = 'http://localhost:9000/spotify/login';
    return newAccessToken;
  } else {
    // Refresh the access token
    const refreshedAccessToken = await refreshUserToken(refreshToken);

    // User is logged in
    const spotifyTokensCollection = collection(firebase, 'spotifyTokensCollection');
    const tokenData = {
      accessToken: refreshedAccessToken,
      refreshToken,
      expireTime: Date.now() + Number(expireTime),
    };

    try {
      const docRef = await addDoc(spotifyTokensCollection, tokenData);
      console.log('Access token added to the database with ID: ', docRef.id);
      window.localStorage.setItem(LOCALSTORAGE_KEYS.accessToken, refreshedAccessToken);
      window.localStorage.setItem(LOCALSTORAGE_KEYS.refreshToken, refreshToken);
      window.localStorage.setItem(LOCALSTORAGE_KEYS.expireTime, expireTime);
      window.localStorage.setItem(LOCALSTORAGE_KEYS.timestamp, Date.now().toString());
    } catch (error) {
      console.error('Error adding access token to the database: ', error);
    }

    return refreshedAccessToken;
  }
};






export const accessToken = getAccessToken();