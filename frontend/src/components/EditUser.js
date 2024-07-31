import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, MenuItem, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import './EditUser.css';

const EditUserForm = ({ onUserUpdated }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = location.state;
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [devices, setDevices] = useState(user.noofdevices);
  const [espTopics, setEspTopics] = useState(user.espTopics || []); // Changed from deviceIPs
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(null);
  const [newTopic, setNewTopic] = useState('');
  const [isAddingTopic, setIsAddingTopic] = useState(false);

  useEffect(() => {
    setEspTopics(user.espTopics || []); // Changed from deviceIPs
  }, [user.espTopics]);

  const handleMenuClick = (event, index) => {
    setAnchorEl(event.currentTarget);
    setSelectedTopicIndex(index);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTopicIndex(null);
  };

  const handleDeleteTopic = () => {
    if (selectedTopicIndex !== null) {
      const newEspTopics = espTopics.filter((_, index) => index !== selectedTopicIndex);
      setEspTopics(newEspTopics);
      setDevices(newEspTopics.length);
      handleMenuClose();
    }
  };

  const handleAddTopicClick = () => {
    setIsAddingTopic(true);
  };

  const handleAddTopic = () => {
    if (newTopic === '') {
      alert('Please enter a valid topic');
      return;
    }

    const uniqueTopics = new Set(espTopics);
    if (uniqueTopics.has(newTopic)) {
      alert('Topic already exists');
      return;
    }

    setEspTopics([...espTopics, newTopic]);
    setDevices(devices + 1);
    setNewTopic('');
    setIsAddingTopic(false);
  };

  const handleTopicSubmission = async () => {
    const uniqueTopics = new Set(espTopics);
    if (espTopics.length !== uniqueTopics.size) {
      alert('Please ensure all topics are unique');
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
          espTopics // Changed from deviceIPs
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
        espTopics // Changed from deviceIPs
      });

      navigate('/admin');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="container-main">
      <div className="header-main">
        <h1 className='new-user-edit'>EDIT AWS Topics</h1>
      </div>
      <div className="content">
        <div className="right-screen-exist">
          <h2>Current AWS Topics:</h2>
          <table className="ip-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Current AWS Topic</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {espTopics.map((topic, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{topic}</td>
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
                      open={Boolean(anchorEl) && selectedTopicIndex === index}
                      onClose={handleMenuClose}
                    >
                      <MenuItem onClick={handleDeleteTopic}>
                        Delete
                      </MenuItem>
                    </Menu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="button-container">
            <div className="add-ip-container"> {/* Keeping class name as it is */}
              {isAddingTopic ? (
                <>
                  <input
                    type="text"
                    value={newTopic} // Renamed from newIP
                    onChange={(e) => setNewTopic(e.target.value)} // Renamed from setNewIP
                    placeholder="Enter new IP address"
                    className="textboxs"
                  />
                  <button onClick={handleAddTopic} className="add-ip-btn">Save AWS Topic</button> {/* Keeping class name as it is */}
                </>
              ) : (
                <button onClick={handleAddTopicClick} className="add-ip-btn">Add AWS Topic</button> 
              )}
            </div>
            <button onClick={handleTopicSubmission} className='save-btn'>Submit AWS Topics</button> {/* Keeping class name as it is */}
          </div>
        </div>
      </div>
    </div>
  );
};

EditUserForm.defaultProps = {
  onUserUpdated: () => {},
};

export default EditUserForm;
