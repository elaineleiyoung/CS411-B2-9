require('dotenv').config();
var express = require("express");

// const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
var router = express.Router();
// const PORT = process.env.PORT || 9000;

const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

// app.use(cors());
app.use(express.json());

router.get("/", async (req, res) => {
  try {
    const location = req.query.location;
    if (!location || location === "") {
      return res.status(400).json({ error: "Location not specified" });
    }

    const coordinatesResponse = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${location}&key=${OPENCAGE_API_KEY}`
    );
    const coordinatesData = await coordinatesResponse.json();

    try {
      const coordinates = coordinatesData.results[0].geometry;
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lng}&units=metric&appid=${OPENWEATHER_API_KEY}`
      );
      const weatherData = await weatherResponse.json();
      res.json({ location, coordinates, weather: weatherData });
    } catch (error) {
      console.error("Error fetching weather: ", error);
      return res.status(500).send("Error fetching weather.");
    }
  } catch (error) {
    console.error("Error fetching coordinates: ", error);
    res.status(500).json({ error: "Something went wrong" });
  }
  //res.send("API WoRKS");
});

// Use the router
module.exports = router;

