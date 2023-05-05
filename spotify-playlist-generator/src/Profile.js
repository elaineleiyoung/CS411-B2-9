import { useState, useEffect } from "react";
import axios from "axios";

function Profile({ accessToken }) {
  const [profileData, setProfileData] = useState(null);

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

  if (!profileData) {
    return <p>Loading profile...</p>;
  }

  return (
    <div>
    <div style={{ display: "flex", alignItems: "center" }}>
      {profileData.images && profileData.images.length > 0 && (
        <img
          src={profileData.images[0].url}
          alt={`${profileData.display_name}'s profile`}
          style={{ borderRadius: "50%", width: "100px", height: "100px", marginRight: "20px" }}
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
