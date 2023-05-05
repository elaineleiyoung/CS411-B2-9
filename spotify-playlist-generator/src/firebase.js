// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDCpYi_uZz538wIruBZdFDPVI2cDPngrGg",
  authDomain: "cs-411-spotify-generator.firebaseapp.com",
  databaseURL: "https://cs-411-spotify-generator-default-rtdb.firebaseio.com",
  projectId: "cs-411-spotify-generator",
  storageBucket: "cs-411-spotify-generator.appspot.com",
  messagingSenderId: "383338532269",
  appId: "1:383338532269:web:e922187b9421e1e7ebe524"
};



const app = initializeApp(firebaseConfig);
export const firebase = getFirestore(app);
export default firebase;

