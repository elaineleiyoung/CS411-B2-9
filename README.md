# CS411-B2-9
## See API prototype: ON BRANCH PROTOTYPE

## Project Description:  
Spotify Playlist Generator is a project aimed at giving the users a Spotify playlist including ten recommended songs based on location and weather. It allows users to sign in through their Spotify account to access all paid features from the app. Users can search for specific city they are interested in or the city they currently live in to get the live weather, temperature, longitude and latitude updates. Spotify Playlist Generator will provide users 10 recommended songs available on Spotify that suits the weather condition. The goal for this project is to make it easier for people to gather songs that fit their mood with the current weather. By doing so, the project aims to increase users’ music experience.

This web app gets the recommended songs for users is by filtering both the weather and the temperature. The filtering system of Spotify Playlist Generator matches different weather with specific music genres. For example, rainy days are considered as moody, sleepy, and introspecting. In that case, the system considers any sort of Jazz goes great with a rainy day. To further separate different songs with each other, Spotify Playlist Generator's recommendation system reads the temperature which are passed as parameters to Spotify API to select the matching acoustics.

## Table of contents

- [Built with](#built-with)
- [Installation](#installation-npm-and-firebase)
- [Running the app](#running-the-app)
- [Snapshots](#snapshots)
- [About us](#about-us)

## Find our project: `cd spotify-playlist-generator`

## Built with:  
React frontend, Express backend, Firebase.

## Installation: npm and Firebase 
 
 Install dependencies:
### `npm i`
 Install firebase:
### `npm install firebase` 


## Running the App:

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## Snapshots:

<p float="left">
  <img height="300" src="https://github.com/elaineleiyoung/CS411-B2-9/blob/main/spotify-playlist-generator/screenshot1.png" alt="Screenshot 1" border="1" hspace="10">
  <img height="300" src="https://github.com/elaineleiyoung/CS411-B2-9/blob/main/spotify-playlist-generator/screenshot2.png" alt="Screenshot 2" border="1">
</p>

## About us:

This project is created by Team 9 in Lab B2 of CS411 at Boston University. Team members includes: [Elaine](https://github.com/elaineleiyoung), [Jackson](https://github.com/Swaggermuffin64), and [Jianing](https://github.com/trudali).

*Note: For some reason, one of our team member Jianing Li contributed with two accounts: trudali and 李嘉宁.
