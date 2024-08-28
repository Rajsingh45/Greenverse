import React, { useState, useEffect, useRef } from 'react';
import { FaUserCircle, FaTimes, FaKey, FaSignOutAlt } from 'react-icons/fa'; // Import additional icons
import './Navbar.css';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import { alpha, styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
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

const Navbar = ({ setSearchQuery, searchDisabled }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [userName, setUserName] = useState('');
  const [searchQuery, setSearchQueryLocal] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userResponse = await fetch('http://localhost:5000/auth/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserName(userData.name);
        } else {
          console.error('Failed to fetch user data');
        }

        const profileResponse = await fetch('http://localhost:5000/auth/profile-picture', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (profileResponse.ok) {
          const profilePicBlob = await profileResponse.blob();
          const profilePicURL = URL.createObjectURL(profilePicBlob);
          setProfilePic(profilePicURL);
        } else {
          console.error('Failed to fetch profile picture');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
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
    setDropdownVisible(!dropdownVisible);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('startDate');
    localStorage.removeItem('endDate');
    navigate('/');
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  const handleUserInfo = () => {
    navigate('/user-info');
  };

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQueryLocal(query);
    setSearchQuery(query);
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  return (
    <div className="navbar sticky-top">
      <img src={newlogo} alt='Error' className='newlogo' />
      {userName && <span className="user-greeting">Hi {userName}!</span>}

      <div className={`navbar-links ${menuVisible ? 'visible' : ''}`}>
        <a href="/dashboard" className="navbar-link">Home</a>
        <a href="/about-us" className="navbar-link">About</a>
        <a href="/contact-us" className="navbar-link">Contact Us</a>
        <a href="/api-generation" className="navbar-link">Maps</a>
      </div>
      
      <div className={`profile-icon-container ${searchDisabled ? 'disabled' : ''}`}>
        <div className={`search-container ${searchDisabled ? 'disabled' : ''}`}>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search by device…"
              inputProps={{ 'aria-label': 'search' }}
              value={searchQuery}
              onChange={handleSearchChange}
              className='device-name'
            />
          </Search>
        </div>

        {profilePic ? (
          <img src={profilePic} alt="Profile" className="profile-icon" onClick={toggleDropdown} />
        ) : (
          <FaUserCircle className="profile-icon" onClick={toggleDropdown} />
        )}

        {dropdownVisible && (
          <div ref={dropdownRef} className={`dropdown-menus ${dropdownVisible ? 'show' : ''}`}>
            <p onClick={handleUserInfo}><FaUserCircle className="dropdown-icons" /> User Profile</p>
            <p onClick={handleChangePassword}><FaKey className="dropdown-icons" /> Change Password</p>
            <p onClick={handleLogout}><FaSignOutAlt className="dropdown-icons" /> Logout</p>
            <FaTimes className="close-icon" onClick={toggleDropdown} />
          </div>
        )}

        <div
          className={`hamburger-menu ${!menuVisible ? 'visible' : ''}`}
          onClick={toggleMenu}
        >
          ☰
        </div>
      </div>
    </div>
  );
};

export default Navbar;
