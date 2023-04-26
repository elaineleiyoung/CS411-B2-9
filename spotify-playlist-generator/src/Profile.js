import { useState, useEffect } from 'react';
import axios from 'axios';

function Profile({ accessToken }) {
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = await accessToken;
        const response = await axios.get('https://api.spotify.com/v1/me', {
          headers: {
            'Authorization': 'Bearer ' + token
          }
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
      <h2>{profileData.display_name}</h2>
      <p>Email: {profileData.email}</p>
      <p>Spotify ID: {profileData.id}</p>
      <p>Followers: {profileData.followers.total}</p>
    </div>
  );
}

export default Profile;
