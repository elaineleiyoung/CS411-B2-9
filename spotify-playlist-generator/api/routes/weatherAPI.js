// Import required modules and packages
require('dotenv').config();
var express = require("express");

const fetch = require("node-fetch");

const app = express();
var router = express.Router();

// Access environment variables
const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

app.use(express.json());

// Define a route for fetching weather information based on the location
router.get("/", async (req, res) => {
  try {
    const location = req.query.location;
    if (!location || location === "") {
      return res.status(400).json({ error: "Location not specified" });
    }

    // Fetch coordinates for the given location from OpenCage Geocoding API
    const coordinatesResponse = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${location}&key=${OPENCAGE_API_KEY}`
    );
    const coordinatesData = await coordinatesResponse.json();

    try {
      const coordinates = coordinatesData.results[0].geometry;

      // Fetch weather data for the given coordinates from OpenWeatherMap API
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lng}&units=metric&appid=${OPENWEATHER_API_KEY}`
      );
      const weatherData = await weatherResponse.json();
      
      // Return location, coordinates, and weather information
      res.json({ location, coordinates, weather: weatherData });
    } catch (error) {
      console.error("Error fetching weather: ", error);
      return res.status(500).send("Error fetching weather.");
    }
  } catch (error) {
    console.error("Error fetching coordinates: ", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Use the router
module.exports = router;
