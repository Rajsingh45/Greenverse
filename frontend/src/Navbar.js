import React, { useState, useEffect, useRef } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import './Navbar.css';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import { alpha, styled } from '@mui/material/styles';
import newlogo from './images/new-logo.png';

const Search = styled('div')(({ theme, showInput }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  display: 'flex',
  alignItems: 'center',
  width: showInput ? '300px' : 'auto',
  transition: 'width 0.3s ease',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  zIndex: 10,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    width: '100%',
    transition: theme.transitions.create('width'),
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const Navbar = ({ searchQuery, setSearchQuery }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const dropdownRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setDropdownVisible(prev => !prev);
  };

  const handleChangePassword = () => {
    window.location.href = './change-password';
  };

  const handleUserInfo = () => {
    window.location.href = './user-info';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = './';
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div className="navbar sticky-top">
      <img src={newlogo} alt='Logo' className='newlogo' />
      <span className="user-greeting">Hi Admin!</span>

      <div className="navbar-links">
        <a href="/admin" className="navbar-link">Home</a>
        <a href="/about-us" className="navbar-link">About</a>
      </div>

      <div className="profile-icon-container">
        <div className='search-container'>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search by user name…"
              inputProps={{ 'aria-label': 'search' }}
              value={searchQuery}
              onChange={handleSearchChange}
              className='device-name'
            />
          </Search>
        </div>

        {profilePic ? (
          <img
            src={profilePic}
            alt="Profile"
            className="profile-icon"
            onClick={toggleDropdown}
          />
        ) : (
          <FaUserCircle
            className="profile-icon"
            onClick={toggleDropdown}
          />
        )}

        {dropdownVisible && (
          <div ref={dropdownRef} className={`dropdown-menu ${dropdownVisible ? 'show' : ''}`}>
            <p onClick={handleChangePassword}>Change Password</p>
            <p onClick={handleUserInfo}>User Profile</p>
            <p onClick={handleLogout}>Logout</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
