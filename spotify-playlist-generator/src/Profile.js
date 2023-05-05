import { useState, useEffect } from "react";
import axios from "axios";
import './style/Profile.css';

// Profile component: Displays user's profile information
function Profile({ accessToken }) {
  const [profileData, setProfileData] = useState(null);

  // Fetch user's profile data using the accessToken
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = await accessToken;
        const response = await axios.get("http://localhost:9000/spotify/profile", {
          headers: {
            "Authorization": "Bearer " + token,
          },
        });
        setProfileData(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProfileData();
  }, [accessToken]);

  // Display a loading message if profile data is not yet available
  if (!profileData) {
    return <p>Loading profile...</p>;
  }

  // Render the user's profile information
  return (
    <div className="profile-info-container">
      <div className="profile-info-label">Profile Information:</div>
      <div className="profile-info-content">
        {profileData.images && profileData.images.length > 0 && (
          <img
            className="profile-image"
            src={profileData.images[0].url}
            alt={`${profileData.display_name}'s profile`}
          />
        )}
        <div>
          <h2>{profileData.display_name}</h2>
          <p>Email: {profileData.email}</p>
          <p>Spotify ID: {profileData.id}</p>
          <p>Followers: {profileData.followers.total}</p>
        </div>
      </div>
    </div>
  );
  
}

export default Profile;