import React, { useState, useEffect, useRef } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import './Navbar.css';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import { alpha, styled } from '@mui/material/styles';
import newlogo from './images/new-logo.png';
import { useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';

// Styled components for the Navbar
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

const Navbar = ({ searchQuery, setSearchQuery, searchDisabled,user }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const { email: currentUserEmail } = useParams();
  console.log(currentUserEmail)

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
    window.location.href = '/change-password';
  };

  const handleUserInfo = () => {
    window.location.href = '/user-info';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const handleSearchChange = async (event) => {
    if (searchInputDisabled) return;
  
    const query = event.target.value; // Define query here
    setSearchQuery(query);
  };

  const isUserDetailPage = location.pathname === `/user/${currentUserEmail}`;
  const isAdminPage = location.pathname === '/admin';
  const searchInputDisabled = !(isUserDetailPage || isAdminPage);

  return (
    <div className="navbar sticky-top">
      <img src={newlogo} alt='Logo' className='newlogo' />
      <span className="user-greeting">Hi Admin!</span>

      <div className="navbar-links">
        <a href="/admin" className="navbar-link">Home</a>
        <a href="/about-us" className="navbar-link">About</a>
      </div>

      <div className="profile-icon-container">
        <div className={`search-container ${searchInputDisabled ? 'disabled' : ''}`}>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
  placeholder={isUserDetailPage ? "Search by device…" : "Search by user name…"}
  inputProps={{ 'aria-label': 'search' }}
  value={searchQuery}
  onChange={handleSearchChange}
  className='device-name'
  disabled={searchInputDisabled}
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
