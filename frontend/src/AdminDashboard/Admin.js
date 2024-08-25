import React, { useState, useEffect } from 'react';
import './Admin.css';
import Navbar from '../Navbar.js';
import NewUserForm from './NewUser.js';
import EditUserForm from './EditUser.js';
import { Menu, MenuItem, IconButton, TextField, Button, Pagination } from '@mui/material';
import MoreVert from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';

const Admin = ({ users = [], setUsers }) => {
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [showEditUserForm, setShowEditUserForm] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [renamingUserEmail, setRenamingUserEmail] = useState(null);
  const [newName, setNewName] = useState('');
  const [menuUser, setMenuUser] = useState(null);
  const [fetchedUsers, setFetchedUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const usersPerPage = 5;
  const navigate = useNavigate();
  const [fullUserList, setFullUserList] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/admin/users?page=${currentPage}&limit=${usersPerPage}&name=${searchQuery}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setFetchedUsers(data.users || []);
        setFullUserList(data.fullUserList || []);
        setTotalUsers(data.total || 0);
        const numOfPages = Math.ceil(data.total / usersPerPage);
        setTotalPages(numOfPages);

        if (currentPage > numOfPages) {
          setCurrentPage(1);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [currentPage, usersPerPage, searchQuery]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleNewUser = () => {
    setShowNewUserForm(true);
    setShowEditUserForm(false);
    navigate('/admin/new-user');
  };

  const handleUserAdded = (newUser) => {
    setUsers(prevUsers => Array.isArray(prevUsers) ? [...prevUsers, newUser] : [newUser]);
    setShowNewUserForm(false);
    navigate('/admin');
  };

  const handleEditUser = (user) => {
    navigate('/edit-user', { state: { user } });
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
        const response = await fetch('http://localhost:5000/admin/rename', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: renamingUserEmail, newName })
        });

        const data = await response.json();
        if (data.message === 'User renamed successfully') {
          const updatedUsers = users.map((user) =>
            user.email === renamingUserEmail ? { ...user, name: newName } : user
          );
          setUsers(updatedUsers);
          alert('Name updated successfully.');
          window.location.reload();
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

  const handleUserUpdated = (updatedUser) => {
    setUsers((prevUsers) =>
      Array.isArray(prevUsers)
        ? prevUsers.map(user =>
            user.email === updatedUser.email ? updatedUser : user
          )
        : [updatedUser]
    );
    setShowEditUserForm(false);
  };

  const handleDeleteUser = async (userEmail) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this user? This action will also delete all associated devices.');
    if (confirmDelete) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/admin/deleteuser', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email: userEmail })
            });

            if (!response.ok) {
                throw new Error('Failed to delete user');
            }

            const data = await response.json();
            console.log('User deleted successfully:', data);
            window.location.reload();
            setUsers(prevUsers => Array.isArray(prevUsers) ? prevUsers.filter(user => user.email !== userEmail) : []);
            setAnchorEl(null);
        } catch (error) {
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

  const [currentUserEmail, setCurrentUserEmail] = useState(null);

  const handleNameClick = (user, event) => {

    if (renamingUserEmail === user.email) {
      event.stopPropagation();
    } else {
      setCurrentUserEmail(user.email)
      console.log(currentUserEmail)
      navigate(`/user/${user.email}`);
    }
  };

  useEffect(() => {
    if (currentUserEmail) {
      console.log("Current User Email:", currentUserEmail);
    }
  }, [currentUserEmail]);

  const filteredUsers = searchQuery
    ? fullUserList.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : fullUserList;

    const formatDate = (dateString) => {
      const options = { day: '2-digit', month: 'short', year: 'numeric' };
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', options);
    };

  return (
    <>
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} currentUserEmail={currentUserEmail} onUserNameClick={handleNameClick}/>
      <div className="containers container">
        {showNewUserForm ? (
          <NewUserForm onUserAdded={handleUserAdded} />
        ) : showEditUserForm ? (
          <EditUserForm onUserUpdated={handleUserUpdated} />
        ) : (
          <>
            <div className="left">
              <table className="user-table">
                <thead className='heads-form'>
                  <tr>
                    <th>Users</th>
                    <th>Email</th>
                    <th>Date</th>
                    <th>Devices</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage).map(user => (
                    <tr key={user.email}>
                      <td
                        style={{ color: 'blue', cursor: 'pointer' }}
                        onClick={event => handleNameClick(user, event)}
                      >
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
                      <td>{user.email}</td>
                      <td>{formatDate(user.dateAdded)}</td>
                      <td>{user.noofdevices}</td>
                      <td>
                        <IconButton
                          aria-controls="simple-menu"
                          aria-haspopup="true"
                          onClick={event => handleMenuOpen(event, user)}
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
                          <MenuItem onClick={() => handleDeleteUser(user.email)}>Delete</MenuItem>
                        </Menu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="add-user-btn" onClick={handleNewUser}>Add New User</button>
              <div className="pagination-controls">
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  variant="outlined"
                  color="primary"
                />
              </div>
            </div>

            
          </>
        )}
      </div>
    </>
  );
};

export default Admin;
