import React, { useState, useEffect } from 'react';
import './UserInfo.css';
import { TextField, Button, Typography, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const [user, setUser] = useState({});
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
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
        if (data && data.email && data.name && data.contactNumber) {
          setUser(data);

          const profilePicResponse = await fetch('http://localhost:5000/auth/profile-picture', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (profilePicResponse.ok) {
            const profilePicBlob = await profilePicResponse.blob();
            const profilePicURL = URL.createObjectURL(profilePicBlob);
            setProfilePic(profilePicURL);
          }
        } else {
          console.error('Invalid user data:', data);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  const handleProfilePicChange = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png') && file.size <= 1048576) {
      setProfilePic(URL.createObjectURL(file));
      setProfilePicFile(file);
    } else {
      alert('Please select a JPG or PNG image smaller than 1MB.');
    }
  };

  const handleSubmitProfilePic = async () => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('profilePicture', profilePicFile);

    try {
      const response = await fetch('http://localhost:5000/auth/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.message === 'Profile picture uploaded successfully') {
        alert('Profile picture updated successfully.');
        const imageURL = URL.createObjectURL(profilePicFile);
        setProfilePic(imageURL);
        setProfilePicFile(null);
      } else {
        console.error('Error uploading profile picture:', data);
        alert('Failed to upload profile picture.');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('An error occurred while uploading the profile picture.');
    }
  };

  const handleEditNameClick = () => {
    setIsEditingName(true);
  };

  const handleNameChange = (event) => {
    setUser({ ...user, name: event.target.value });
  };

  const handleSubmitName = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:5000/auth/rename', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: user.email, newName: user.name })
      });

      const data = await response.json();
      if (data.message === 'Name updated successfully in both collections') {
        alert('Name updated successfully.');
        setIsEditingName(false);
      } else {
        console.error('Error updating name:', data);
        alert('Failed to update name.');
      }
    } catch (error) {
      console.error('Error updating name:', error);
      alert('An error occurred while updating the name.');
    }
  };

  const openModal = (e) => {
    e.stopPropagation();
    setModalVisible(true);
  };

  const closeModal = (e) => {
    e.stopPropagation();
    setModalVisible(false);
  };

  return (
    <div className="profile-container">
      <Avatar
        src={profilePic}
        alt="Profile"
        className="profile-avatar"
        onClick={openModal}
      />
      <Typography variant="h4" className="title-profile">User Profile</Typography>
      
      <div className="profile-field">
        <TextField
          label="Name"
          value={user.name || ''}
          onChange={handleNameChange}
          InputProps={{ readOnly: !isEditingName }}
          variant="outlined"
          fullWidth
        />
      </div>
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
          label="Contact Number"
          value={user.contactNumber || ''}
          InputProps={{ readOnly: true }}
          variant="outlined"
          fullWidth
        />
      </div>
      <div className="buttons-container">
        {isEditingName ? (
          <Button
            variant="contained"
            onClick={handleSubmitName}
            className="profile-button"
          >
            Submit Name
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleEditNameClick}
            className="profile-button"
          >
            Edit Name
          </Button>
        )}
        {profilePicFile ? (
          <Button
            variant="contained"
            onClick={handleSubmitProfilePic}
            className="profile-button"
          >
            Submit Profile Picture
          </Button>
        ) : (
          <Button
            variant="contained"
            component="label"
            className="profile-button"
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
      {modalVisible && (
        <div className="modal" onClick={closeModal}>
          <span className="close" onClick={closeModal}>&times;</span>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={profilePic} alt="Enlarged Profile" />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
