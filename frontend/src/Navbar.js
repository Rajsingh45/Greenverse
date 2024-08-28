import React, { useState, useEffect, useRef } from 'react';
import { FaUserCircle, FaBars, FaTimes, FaKey, FaSignOutAlt } from 'react-icons/fa';
import './Navbar.css';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import { alpha, styled } from '@mui/material/styles';
import newlogo from './images/new-logo.png';
import { useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';

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

const Navbar = ({ searchQuery, setSearchQuery, searchDisabled, user }) => {
  const [userName, setUserName] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const { email: currentUserEmail } = useParams();
  const [placeholderText, setPlaceholderText] = useState('Search by user name…');
  
  const isUserDetailPage = location.pathname === `/user/${currentUserEmail}`;

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/auth/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
  
        if (response.ok) {
          const userData = await response.json();
          setUserName(userData.name);
        } else {
          console.error('Failed to fetch user name');
        }
      } catch (error) {
        console.error('Error fetching user name:', error);
      }
    };
  
    fetchUserName();
  }, []);

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
  
  const toggleMenu = () => {
    setMenuVisible(prev => !prev);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 395) {
        setPlaceholderText(''); 
      }
      else if (window.innerWidth < 490) {
        setPlaceholderText('Search'); 
      }
      else if (window.innerWidth < 560) {
        setPlaceholderText(''); 
      } else if (window.innerWidth < 685) {
        setPlaceholderText('Search');
      } else {
        setPlaceholderText(isUserDetailPage ? 'Search by device…' : 'Search by user name…');
      }
    };
  
    handleResize();
    window.addEventListener('resize', handleResize);
  
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isUserDetailPage]);

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
    localStorage.removeItem('startDate');
    localStorage.removeItem('endDate');
    window.location.href = '/';
  };

  const handleSearchChange = async (event) => {
    if (searchInputDisabled) return;
  
    const query = event.target.value;
    setSearchQuery(query);
  };

  const isAdminPage = location.pathname === '/admin';
  const searchInputDisabled = !(isUserDetailPage || isAdminPage);

  return (
    <div className="navbar sticky-top">
      <img src={newlogo} alt='Logo' className='newlogo' />
      <span className="user-greeting">Hi {userName}!</span>

      <div className={`navbar-links ${menuVisible ? 'visible' : ''}`}>
        <a href="/admin" className="navbar-link sect">Home</a>
        <a href="/about-us" className="navbar-link sect">About</a>
      </div>

      <div className={`profile-icon-container ${searchInputDisabled ? 'disabled' : ''}`}>
        <div className={`search-container ${searchInputDisabled ? 'disabled' : ''}`}>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder={placeholderText}
              inputProps={{ 'aria-label': 'search' }}
              value={searchQuery}
              onChange={handleSearchChange}
              className='device-name'
              disabled={searchInputDisabled}
            />
          </Search>
        </div>

        <div className="hamburger-menu" onClick={toggleMenu}>
          {menuVisible ? <FaTimes /> : <FaBars />}
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
          <div ref={dropdownRef} className={`dropdown-menus ${dropdownVisible ? 'show' : ''}`}>
            <FaTimes className="close-icon" onClick={toggleDropdown} />
            <p onClick={handleUserInfo}><FaUserCircle className="dropdown-icons" /> User Profile</p>
            <p onClick={handleChangePassword}><FaKey className="dropdown-icons" /> Change Password</p>
            <p onClick={handleLogout}><FaSignOutAlt className="dropdown-icons" /> Logout</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
