import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, MenuItem, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';
import './EditUser.css';

const EditUserForm = ({ onUserUpdated }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = location.state;
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [devices, setDevices] = useState(user.noofdevices);
  const [deviceIPs, setDeviceIPs] = useState(user.deviceIPs || []);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedIPIndex, setSelectedIPIndex] = useState(null);
  const [newIP, setNewIP] = useState(''); 
  const [isAddingIP, setIsAddingIP] = useState(false);

  useEffect(() => {
    setDeviceIPs(user.deviceIPs || []);
  }, [user.deviceIPs]);

  const handleMenuClick = (event, index) => {
    setAnchorEl(event.currentTarget);
    setSelectedIPIndex(index);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedIPIndex(null);
  };

  const handleDeleteIP = () => {
    if (selectedIPIndex !== null) {
      const newDeviceIPs = deviceIPs.filter((_, index) => index !== selectedIPIndex);
      setDeviceIPs(newDeviceIPs);
      setDevices(newDeviceIPs.length);
      handleMenuClose();
    }
  };

  const handleAddIP = () => {
    if (newIP === '') {
      alert('Please enter a valid IP address');
      return;
    }
  
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(newIP)) {
      alert('Please enter a valid IP address');
      return;
    }
  
    setDeviceIPs([...deviceIPs, newIP]);
    setDevices(devices + 1);
    setNewIP(''); // Clear the new IP input field after adding
  };

  const handleDeviceIPChange = (index, value) => {
    const newDeviceIPs = [...deviceIPs];
    newDeviceIPs[index] = value;
    setDeviceIPs(newDeviceIPs);
  };

  const handleIPSubmission = async () => {
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    if (deviceIPs.includes('') || deviceIPs.some(ip => !ipRegex.test(ip))) {
      alert('Please fill in all device IPs with valid IP addresses');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found in localStorage');
      }

      const response = await fetch(`http://localhost:5000/admin/updatedevices`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          email,
          noofdevices: Number(devices),
          deviceIPs
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('User updated successfully:', data);

      onUserUpdated({
        id: user._id,
        name,
        noofdevices: Number(devices),
        deviceIPs
      });
      
      navigate('/admin')
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="container-main">
      <div className="header-main">
        <h1 className='new-user-edit'>EDIT IP Addresses</h1>
      </div>
      <div className="content">
        <div className="right-screen-exist">
          <h2>Current IP Addresses:</h2>
          <table className="ip-table">
            <thead>
              <tr>
                <th>Serial No.</th>
                <th>Current IP Addresses</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deviceIPs.map((ip, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{ip}</td>
                  <td>
                    <IconButton
                      aria-label="more"
                      aria-controls="long-menu"
                      aria-haspopup="true"
                      onClick={(e) => handleMenuClick(e, index)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      id="long-menu"
                      anchorEl={anchorEl}
                      keepMounted
                      open={Boolean(anchorEl) && selectedIPIndex === index}
                      onClose={handleMenuClose}
                    >
                      <MenuItem onClick={handleDeleteIP}>
                        Delete
                      </MenuItem>
                    </Menu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="button-container">
            
            <button onClick={handleAddIP} className="add-ip-btn">Add IP Address</button>
            <button onClick={handleIPSubmission} className='save-btn'>Submit IPs</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUserForm;
