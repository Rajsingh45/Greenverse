import React, { useState, useEffect } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    const fetchProfilePic = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/auth/profile-picture', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const profilePicBlob = await response.blob();
          const profilePicURL = URL.createObjectURL(profilePicBlob);
          setProfilePic(profilePicURL);
        } else {
          console.error('Failed to fetch profile picture');
        }
      } catch (error) {
        console.error('Error fetching profile picture:', error);
      }
    };

    fetchProfilePic();
  }, []);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleChangePassword = () => {
    window.location.href = './change-password';
  };

  const handleUserInfo = () => {
    window.location.href = './user-info';
  };

  return (
    <div className="navbar">
      <h1 className="navbar-title">AQI Dashboard</h1>
      <div className="profile-icon-container">
        {profilePic ? (
          <img src={profilePic} alt="Profile" className="profile-icon" onClick={toggleDropdown} />
        ) : (
          <FaUserCircle className="profile-icon" onClick={toggleDropdown} />
        )}
        {dropdownVisible && (
          <div className="dropdown-menu">
            <p onClick={handleChangePassword}>Change Password</p>
            <p onClick={handleUserInfo}>User Profile</p>
            <p>Option 3</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
