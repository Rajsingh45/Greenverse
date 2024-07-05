import React, { useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleChangePassword = () => {
    window.location.href = '/change-password';
  };

  return (
    <div className="navbar">
      <h1 className="navbar-title">AQI Dashboard</h1>
      <div className="profile-icon-container">
        <FaUserCircle className="profile-icon" onClick={toggleDropdown} />
        {dropdownVisible && (
          <div className="dropdown-menu">
            <p onClick={handleChangePassword}>Change Password</p>
            <p>Option 2</p>
            <p>Option 3</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
