import React, { useState } from 'react';
import './Admin.css';
import { Menu, MenuItem, IconButton, TextField, Button } from '@mui/material';
import MoreVert from '@mui/icons-material/MoreVert';
import NewUserForm from './NewUser';
import EditUserForm from './EditUser';

const Admin = ({ users, setUsers }) => {
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [showEditUserForm, setShowEditUserForm] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [renamingUserEmail, setRenamingUserEmail] = useState(null);
  const [newName, setNewName] = useState('');
  const [menuUser, setMenuUser] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null); 

  const handleNewUser = () => {
    setShowNewUserForm(true);
    setShowEditUserForm(false);
  };

  const handleUserAdded = (newUser) => {
    setUsers((prevUsers) => [...prevUsers, newUser]);
    setShowNewUserForm(false);
  };

  const handleUserUpdated = (updatedUser) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user._id === updatedUser._id ? updatedUser : user))
    );
    setShowEditUserForm(false);
  };

  const handleEditUser = (user) => {
    setUserToEdit(user);
    setShowEditUserForm(true);
    setShowNewUserForm(false);
    setAnchorEl(null);
  };

  const handleRenameUser = (user) => {
    setRenamingUserEmail(user.email);
    setNewName(user.name);
    setAnchorEl(null);
  };

  const handleRenameChange = (event) => {
    setNewName(event.target.value);
  };

  const handleRenameSubmit = async () => {
    if (renamingUserEmail) {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:5000/auth/rename', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: renamingUserEmail, newName })
        });

        const data = await response.json();
        if (data.message === 'Name updated successfully in both collections') {
          const updatedUsers = users.map((user) =>
            user.email === renamingUserEmail ? { ...user, name: newName } : user
          );
          setUsers(updatedUsers);
          alert('Name updated successfully.');
        } else {
          alert('Failed to update name.');
        }
      } catch (error) {
        alert('An error occurred while updating the name.');
      }

      setRenamingUserEmail(null);
      setNewName('');
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this user?');
    if (confirmDelete) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/admin/deleteuser', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ id: userId })
        });

        if (!response.ok) {
          throw new Error('Failed to delete user');
        }

        const data = await response.json();
        setUsers((prevUsers) => prevUsers.filter(user => user._id !== userId));
        setAnchorEl(null);
      } catch (error) {
        alert('Error deleting user');
      }
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuUser(null);
  };


  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setMenuUser(user);
  };

  // const handleMenuClose = () => {
  //   setAnchorEl(null);
  //   setMenuUser(null);
  // };

  return (
    <>
    {/* <Navbar/> */}
    <div className="container">
      {showNewUserForm ? (
        <NewUserForm onUserAdded={handleUserAdded} />
      ) : showEditUserForm ? (
        <EditUserForm onUserUpdated={handleUserUpdated} />
      ) : (
        <>
          <div className="left">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Users</th>
                  <th>Devices</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.email}>
                    <td>
                      {renamingUserEmail === user.email ? (
                        <>
                          <TextField
                            value={newName}
                            onChange={handleRenameChange}
                            autoFocus
                          />
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleRenameSubmit}
                            className='save-button'
                          >
                            Save
                          </Button>
                        </>
                      ) : (
                        user.name
                      )}
                    </td>
                    <td>{user.noofdevices}</td>
                    <td>
                      <IconButton
                        aria-controls="simple-menu"
                        aria-haspopup="true"
                        onClick={(event) => handleMenuOpen(event, user)}
                      >
                        <MoreVert />
                      </IconButton>
                      <Menu
                        id="simple-menu"
                        anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(anchorEl) && menuUser?.email === user.email}
                        onClose={handleMenuClose}
                      >
                        <MenuItem onClick={() => handleRenameUser(user)}>Rename</MenuItem>
                        <MenuItem onClick={() => handleEditUser(user)}>Edit</MenuItem>
                        <MenuItem onClick={() => handleDeleteUser(user._id)}>Delete</MenuItem>
                      </Menu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="add-user-btn" onClick={handleNewUser}>Add New User</button>
          </div>
          <div className="right">
            <h1 className="dashboard-title">Admin Dashboard</h1>
          </div>
        </>
      )}
    </div>
    </>
  );
};

export default Admin;
