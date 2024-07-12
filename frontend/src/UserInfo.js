import React, { useState, useEffect } from 'react';
import './UserInfo.css';
import { TextField, Button, Typography, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const [user, setUser] = useState({});
  const [profilePic, setProfilePic] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/auth/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (data && data.email && data.name) {
          setUser(data);
        } else {
          console.error('Invalid user data:', data);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  const handleSubmit = () => {
    navigate('/dashboard');
  };

  const handleProfilePicChange = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png') && file.size <= 1048576) {
      setProfilePic(URL.createObjectURL(file));
    } else {
      alert('Please select a JPG or PNG image smaller than 1MB.');
    }
  };

  return (
    <div className="profile-container">
      <Avatar
        src={profilePic}
        alt="Profile"
        className="profile-avatar"
      />
      <Typography variant="h4" className="title-profile">User Profile</Typography>
      <div className="profile-field">
        <TextField
          label="Email"
          value={user.email || ''}
          InputProps={{ readOnly: true }}
          variant="outlined"
          fullWidth
        />
      </div>
      <div className="profile-field">
        <TextField
          label="Name"
          value={user.name || ''}
          InputProps={{ readOnly: true }}
          variant="outlined"
          fullWidth
        />
      </div>
      <div className="profile-field">
        {profilePic ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        ) : (
          <Button
            variant="contained"
            component="label"
          >
            Upload Profile Picture
            <input
              type="file"
              hidden
              accept="image/jpeg, image/png"
              onChange={handleProfilePicChange}
            />
          </Button>
        )}
      </div>
      {/* {profilePic && (
        <div className="profile-pic-container">
          <img src={profilePic} alt="Profile" className="profile-pic" />
        </div>
      )} */}
    </div>
  );
};

export default UserProfile;
