import React, { useState, useEffect, useRef } from 'react';
import './UserInfo.css';
import { TextField, Button, Typography, Avatar } from '@mui/material';
import UserNavbar from '../UserNavbar';
import Layout from '../Layout';
import { MoreVert } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const backendURL=process.env.REACT_APP_BACKEND_URL

const UserProfile = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const storedAdminCredentials = JSON.parse(localStorage.getItem('adminCredentials'));
  // const isAdmin = (storedAdminCredentials && storedAdminCredentials.email === "admin@example.com" && storedAdminCredentials.password === "adminpassword");

  const token = localStorage.getItem('token');
  const isAdmin = token ? JSON.parse(atob(token.split('.')[1])).role === 'admin' : false;
  
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
      toast.success('No profile picture to delete.', {
        autoClose: 5000,
        closeOnClick: true,
      });
      return;
    }
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${backendURL}/auth/delete-profile-picture`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.message === 'Profile picture deleted successfully') {
        toast.success('Profile picture deleted successfully.', {
          autoClose: 5000,
          closeOnClick: true,
          onClose: () => {
            window.location.reload();
          },
        });
        setProfilePic(null);
        setProfilePicFile(null);
      } else {
        alert('Failed to delete profile picture.');
      }
    } catch (error) {
      alert('An error occurred while deleting the profile picture.');
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${backendURL}/auth/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (data && data.email && data.name && data.contactNumber) {
          setUser(data);

          const profilePicResponse = await fetch(`${backendURL}/auth/profile-picture`, {
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
        const response = await fetch(`${backendURL}/auth/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await response.json();
        if (data.message === 'Profile picture uploaded successfully') {
          toast.success('Profile picture updated successfully.', {
            autoClose: 5000,
            closeOnClick: true,
            onClose: () => {
              window.location.reload();
            },
          });
          setProfilePic(previewURL);
          setProfilePicFile(null); 
        } else {
          alert('Failed to upload profile picture.');
        }
      } catch (error) {
        toast.error('An error occurred while uploading the profile picture.', {
          autoClose: 5000,
          closeOnClick: true,
        });
        
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
      const response = await fetch(`${backendURL}/auth/rename`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: user.email, newName: user.name })
      });

      const data = await response.json();
      if (data.message === 'Name updated successfully in both collections') {
        toast.success('Name updated successfully.', {
          autoClose: 5000,
          closeOnClick: true,
          onClose: () => {
            window.location.reload();
          },
        });
        setIsEditingName(false);
      } else {
        alert('Failed to update name.');
        window.location.reload();
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
      <div className='outermost-container'>
        <div className="profile-container">
          <div className="avatar-container">
          <Avatar
            src={profilePic ? profilePic : ''}
            alt={profilePic ? "Profile" : "Default Icon"}
            className="profile-avatar"
            onClick={profilePic ? openModal : null}
          />
            <div className="header">
              <MoreVert
                className="more-vert-icon"
                onClick={toggleDropdown}
              />
              {dropdownVisible && (
                <div ref={dropdownRef} className="dropdown-menuz">
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
          </div>
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
              : null
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
      <ToastContainer />
      </div>
    </>
  );
};

export default UserProfile;
