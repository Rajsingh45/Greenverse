import React, { useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import './Navbar.css';

const Navbar = ({ profilePic }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);

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
