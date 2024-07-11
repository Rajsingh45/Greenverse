import React, { useState, useEffect } from 'react';
import './Admin.css';
import NewUserForm from './NewUser';
import EditUserForm from './EditUser';
import { Menu, MenuItem, IconButton } from '@mui/material';
import MoreVert from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [showEditUserForm, setShowEditUserForm] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuUser, setMenuUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleNewUser = () => {
    setShowNewUserForm(true);
    setShowEditUserForm(false);
  };

  const handleUserAdded = (newUser) => {
    setUsers((prevUsers) => [...prevUsers, newUser]);
    setShowNewUserForm(false); 
  };

  const handleEditUser = (user) => {
    navigate('/edit-user', { state: { user } });
    setAnchorEl(null);
  };

  const handleUserUpdated = (updatedUser) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user._id === updatedUser.id ? updatedUser : user
      )
    );
    setShowEditUserForm(false);
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
        console.log(data.message); // User deleted successfully
  
        setUsers((prevUsers) => prevUsers.filter(user => user._id !== userId));
        setAnchorEl(null);
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
      }
    }
  };
  
  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setMenuUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuUser(null);
  };

  return (
    <div className="container">
      {showNewUserForm ? (
        <NewUserForm onUserAdded={handleUserAdded} />
      ) : showEditUserForm ? (
        <EditUserForm user={selectedUser} onUserUpdated={handleUserUpdated} />
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
                  <tr key={user._id}>
                    <td>{user.name}</td>
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
                        open={Boolean(anchorEl) && menuUser?._id === user._id}
                        onClose={handleMenuClose}
                      >
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
  );
};

export default Admin;
