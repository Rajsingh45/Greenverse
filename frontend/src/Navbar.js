import React, { useState, useEffect, useRef } from 'react';
import { FaUserCircle, FaBars, FaTimes, FaKey, FaSignOutAlt } from 'react-icons/fa';
import './Navbar.css';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import { alpha, styled } from '@mui/material/styles';
import newlogo from './images/new-logo.png';
import { useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
const backendURL=process.env.REACT_APP_BACKEND_URL;

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

const drawerWidth = 240;
const navItems = [
  { text: 'Home', href: '/admin' },
  { text: 'About', href: '/about-us' },
];

const Navbar = ({ searchQuery, setSearchQuery, searchDisabled, user }) => {
  const [userName, setUserName] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const { email: currentUserEmail } = useParams();
  const [placeholderText, setPlaceholderText] = useState('Search by user name…');

  const isUserDetailPage = location.pathname === `/user/${currentUserEmail}`;

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${backendURL}/auth/users`, {
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
        const response = await fetch(`${backendURL}/auth/profile-picture`, {
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
    const handleResize = () => {
      if (window.innerWidth < 395) {
        setPlaceholderText('Search');
      }
      else if (window.innerWidth < 490) {
        setPlaceholderText('Search');
      }
      else if (window.innerWidth < 560) {
        setPlaceholderText('Search by user name...');
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

  const drawer = (
    <Box onClick={() => setDrawerOpen(false)} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2, color: 'green' }}>
        Greenverse
      </Typography>
      <List>
        {navItems.map(({ text, href }) => (
          <ListItem key={text} disablePadding>
            <ListItemButton sx={{ textAlign: 'center' }} component="a" href={href}>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

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

        <div className="hamburger-menu" onClick={() => setDrawerOpen(true)}>
          {drawerOpen ? <FaTimes /> : <FaBars />}
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

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          display: { xs: 'block', sm: 'none' }, // Ensure drawer shows up for screen sizes below 768px
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>
    </div>
  );
};

export default Navbar;
