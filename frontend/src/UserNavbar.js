import React, { useState, useEffect, useRef } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import './Navbar.css';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import { alpha, styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const Navbar = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [userName, setUserName] = useState(''); // State for storing user name
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const dropdownRef = useRef(null); // Ref for the dropdown menu
  const navigate=useNavigate();

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
    navigate('/')
  };

  const handleChangePassword = () => {
    navigate('/change-password')
  };

  const handleUserInfo = () => {
    navigate('/user-info');
  };

  const handleSearchChange = async (event) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (query.length >= 1) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/admin/search-user?name=${query}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
        } else {
          console.error('Failed to search users');
        }
      } catch (error) {
        console.error('Error searching users:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="navbar sticky-top">
      <h1 className="navbar-title">AQI Dashboard</h1>
      <Search>
        <SearchIconWrapper>
          <SearchIcon />
        </SearchIconWrapper>
        <StyledInputBase
          placeholder="Search by user name…"
          inputProps={{ 'aria-label': 'search' }}
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </Search>
      {userName && <span className="user-greeting">Hi {userName}!</span>}
      <div className="profile-icon-container">
        {profilePic ? (
          <img src={profilePic} alt="Profile" className="profile-icon" onClick={toggleDropdown} />
        ) : (
          <FaUserCircle className="profile-icon" onClick={toggleDropdown} />
        )}
        {dropdownVisible && (
          <div ref={dropdownRef} className="dropdown-menu">
            <p onClick={handleChangePassword}>Change Password</p>
            <p onClick={handleUserInfo}>User Profile</p>
          </div>
        )}
      </div>
      <button className="logout-button" onClick={handleLogout}>Logout</button>
      {/* {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((user) => (
            <div key={user._id} className="search-result-item">
              {user.name}
            </div>
          ))}
        </div>
      )} */}
    </div>
  );
};

export default Navbar;
