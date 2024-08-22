import React, { useState, useEffect,useRef } from 'react';
import './UserInfo.css';
import { TextField, Button, Typography, Avatar } from '@mui/material';
import UserNavbar from '../UserNavbar';
import Layout from '../Layout';
import { MoreVert } from '@mui/icons-material';

const UserProfile = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const storedAdminCredentials = JSON.parse(localStorage.getItem('adminCredentials'));
  const isAdmin = (storedAdminCredentials && storedAdminCredentials.email === "admin@example.com" && storedAdminCredentials.password === "adminpassword");
  const [searchQuery, setSearchQuery] = useState('');

  const [user, setUser] = useState({});
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownVisible(!dropdownVisible);
  };

  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setDropdownVisible(false);
    }
  };
  
  const handleEditName = () => {
    setIsEditingName(true);
    setDropdownVisible(false);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleDeleteProfilePic = async () => {
    if (!profilePic) {
      alert('No profile picture to delete.');
      return;
    }
    const token = localStorage.getItem('token');
  
    try {
      const response = await fetch('http://localhost:5000/auth/delete-profile-picture', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      const data = await response.json();
      if (data.message === 'Profile picture deleted successfully') {
        alert('Profile picture deleted successfully.');
        setProfilePic(null);
        setProfilePicFile(null);
        window.location.reload();
      } else {
        console.error('Error deleting profile picture:', data);
        alert('Failed to delete profile picture.');
      }
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      alert('An error occurred while deleting the profile picture.');
    }
  };

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

  const handleProfilePicChange = async (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png') && file.size <= 1048576) {
      const previewURL = URL.createObjectURL(file);
      setProfilePic(previewURL);
      setProfilePicFile(file);
  
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('profilePicture', file);
  
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
          alert('Profile picture uploaded successfully.');
          setProfilePic(previewURL); // Update the displayed profile picture
          setProfilePicFile(null); // Clear the file input
          window.location.reload();
        } else {
          console.error('Error uploading profile picture:', data);
          alert('Failed to upload profile picture.');
        }
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        alert('An error occurred while uploading the profile picture.');
      }
    } else {
      alert('Please select a JPG or PNG image smaller than 1MB.');
    }
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
        window.location.reload();
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
    <>
      {isAdmin ? <Layout searchQuery={searchQuery} setSearchQuery={setSearchQuery} /> : <UserNavbar searchDisabled={true} />}
      
    <div className="profile-container">
      <div className="header">
    <MoreVert
      className="more-vert-icon"
      onClick={toggleDropdown}
    />
    {dropdownVisible && (
      <div ref={dropdownRef} className="dropdown-menus">
        <Button
          onClick={handleEditName}
          className="dropdown-itemu"
        >
          Edit Username
        </Button>
        <Button
          onClick={handleDeleteProfilePic}
          className="dropdown-itemu"
        >
          Delete Profile Picture
        </Button>
      </div>
    )}
  </div>
      <Avatar
        src={profilePic}
        alt="Profile"
        className="profile-avatar"
        onClick={openModal}
      />
      <Typography variant="h4" className="title-profile">User Profile</Typography>
      
      <div className="profile-field">
        <TextField
          label="Username"
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
            Save Username
          </Button>
        ) 
        :  null
        }
        <Button
    variant="contained"
    component="label"
    className="profile-button"
  >
    {profilePic ? 'Edit Profile Picture' : 'Upload Profile Picture'}
    <input
      type="file"
      hidden
      accept="image/jpeg, image/png"
      onChange={handleProfilePicChange}
    />
  </Button>
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
    </>
  );
};

export default UserProfile;
