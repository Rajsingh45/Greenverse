import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, MenuItem, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import './EditUser.css';
import Navbar from '../Navbar.js';

const EditUserForm = ({ onUserUpdated }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = location.state;
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [devices, setDevices] = useState(user.noofdevices);
  const [espTopics, setEspTopics] = useState(user.espTopics || []);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(null);
  const [newTopic, setNewTopic] = useState('');
  const [isAddingTopic, setIsAddingTopic] = useState(false);

  useEffect(() => {
    setEspTopics(user.espTopics || []);
  }, [user.espTopics]);

  const handleMenuClick = (event, index) => {
    setAnchorEl(event.currentTarget);
    setSelectedTopicIndex(index);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTopicIndex(null);
  };

  const handleDeleteTopic = async () => {
    if (selectedTopicIndex !== null) {
      const topicToDelete = espTopics[selectedTopicIndex];
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found in localStorage');
        }

        const response = await fetch('http://localhost:5000/admin/deletetopic', {
          method: 'Delete',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name, topic: topicToDelete })
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Topic deleted successfully:', data);

        const newEspTopics = espTopics.filter((_, index) => index !== selectedTopicIndex);
        setEspTopics(newEspTopics);
        setDevices(newEspTopics.length);
        handleMenuClose();
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleAddTopicClick = () => {
    const lastTopicNumber = espTopics.length > 0 ?
      Math.max(...espTopics.map(topic => parseInt(topic.replace(/[^\d]/g, ''), 10))) : 0;
    setNewTopic(`${name}${lastTopicNumber + 1}`);
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
          espTopics
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
        espTopics
      });

      navigate('/admin');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <>
      <Navbar />
      <div className='full-height-container'>
        <div className="container-main">
          <div className="header-main">
            <h1 className='new-user-edit'>EDIT AWS Topics</h1>
          </div>
          <div className="content">
            <div className="right-screen-exist">
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
                <div className="add-ip-container">
                  {isAddingTopic ? (
                    <>
                      <input
                        type="text"
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        placeholder="Enter new AWS topic"
                        className="textboxsu"
                      />
                      <button onClick={handleAddTopic} className="add-ip-btn">Save Device</button>
                    </>
                  ) : (
                    <button onClick={handleAddTopicClick} className="add-ip-btn">Add Device</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="submit-button-containeru">
          <button onClick={handleTopicSubmission} className='save-btnu'>Submit AWS Topics</button>
        </div>
      </div>
    </>
  );
};

EditUserForm.defaultProps = {
  onUserUpdated: () => { },
};

export default EditUserForm;
