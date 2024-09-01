import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, MenuItem, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import './EditUser.css';
import Navbar from '../Navbar.js';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
const backendURL="https://greenverse-d0ch.onrender.com"


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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
const [topicToDelete, setTopicToDelete] = useState(null);



  useEffect(() => {
    setEspTopics(user.espTopics || []);
  }, [user.espTopics]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
  
    window.addEventListener('beforeunload', handleBeforeUnload);
  
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]); 
  
  const handleMenuClick = (event, index) => {
    setAnchorEl(event.currentTarget);
    setSelectedTopicIndex(index);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTopicIndex(null);
  };

// Function to set the topic to delete and show confirmation
const handleDeleteTopic = (topic) => {
  setTopicToDelete(topic);
  setShowConfirmation(true);
};

// Function to confirm deletion
const confirmDeleteTopic = async () => {
  if (selectedTopicIndex !== null) {
    const topicToDelete = espTopics[selectedTopicIndex];

    // Remove the topic from the espTopics array immediately
    const newEspTopics = espTopics.filter((_, index) => index !== selectedTopicIndex);
    setEspTopics(newEspTopics);
    setDevices(newEspTopics.length);

    // Close the menu
    handleMenuClose();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found in localStorage');
      }

      const response = await fetch(`${backendURL}/admin/deletetopic`, {
        method: 'DELETE',
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
      console.log('Device deleted successfully:', data);

      setHasUnsavedChanges(true);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Close the confirmation dialog
  setShowConfirmation(false);
  setTopicToDelete(null);
};



  // const handleDeleteTopic = async () => {
  //   if (selectedTopicIndex !== null) {
  //     const topicToDelete = espTopics[selectedTopicIndex];
  //     const isConfirmed = window.confirm(`Are you sure you want to delete "${topicToDelete}" Device?`);
  
  //     if (isConfirmed) {
  //       // Remove the topic from the espTopics array immediately
  //       const newEspTopics = espTopics.filter((_, index) => index !== selectedTopicIndex);
  //       setEspTopics(newEspTopics);
  //       setDevices(newEspTopics.length);
  
  //       // Close the menu
  //       handleMenuClose();
        
  //       try {
  //         const token = localStorage.getItem('token');
  //         if (!token) {
  //           throw new Error('No token found in localStorage');
  //         }
  
  //         const response = await fetch(`${backendURL}/admin/deletetopic`, {
  //           method: 'DELETE',
  //           headers: {
  //             'Content-Type': 'application/json',
  //             'Authorization': `Bearer ${token}`
  //           },
  //           body: JSON.stringify({ name, topic: topicToDelete })
  //         });
  
  //         if (!response.ok) {
  //           throw new Error('Network response was not ok');
  //         }
  
  //         const data = await response.json();
  //         console.log('Device deleted successfully:', data);
  
  //         setHasUnsavedChanges(true);
  //       } catch (error) {
  //         console.error('Error:', error);
  //       }
  //     }
  //   }
  // };
  
  
  const handleAddTopicClick = () => {
    const lastTopicNumber = espTopics.length > 0 ?
      Math.max(...espTopics.map(topic => parseInt(topic.replace(/[^\d]/g, ''), 10))) : 0;
    setNewTopic(`${name}${lastTopicNumber + 1}`);
    setIsAddingTopic(true);
  };

  const handleAddTopic = () => {
    if (newTopic === '') {
      alert('Please enter a valid device name');
      return;
    }

    const uniqueTopics = new Set(espTopics);
    if (uniqueTopics.has(newTopic)) {
      alert('Device already exists');
      return;
    }

    setEspTopics([...espTopics, newTopic]);
    setDevices(devices + 1);
    setNewTopic('');
    setIsAddingTopic(false);
    setHasUnsavedChanges(true);
  };

  const handleTopicSubmission = async () => {
    const uniqueTopics = new Set(espTopics);
    if (espTopics.length !== uniqueTopics.size) {
      alert('Please ensure all device names are unique');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found in localStorage');
      }

      const response = await fetch(`${backendURL}/admin/updatedevices`, {
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

      setHasUnsavedChanges(false);
      navigate('/admin');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="full-height-container">
        <div className="container-main">
          <div className="header-main">
            <h1 className="new-user-edit">EDIT DEVICE DETAILS</h1>
          </div>
          <div className="content">
            <div className="right-screen-exist">
              <table className="ip-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Current Devices</th>
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
                          <MenuItem onClick={() => handleDeleteTopic(topic)}>
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
                        placeholder="Enter new Device Name"
                        className="textboxsu"
                      />
                      <button onClick={handleAddTopic} className="add-ip-btn">Save Device</button>
                      <button 
                        onClick={() => { 
                          setIsAddingTopic(false); 
                          setNewTopic(''); 
                        }} 
                        className="cancel-btn"
                      >
                        Cancel
                      </button>
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
          <button onClick={handleTopicSubmission} className="save-btnu">Submit Devices</button>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the "{topicToDelete}" device?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmation(false)} color="primary">Cancel</Button>
          <Button onClick={confirmDeleteTopic} color="secondary">Yes</Button>
        </DialogActions>
      </Dialog>
    </>
  );  
};

EditUserForm.defaultProps = {
  onUserUpdated: () => { },
};

export default EditUserForm;
