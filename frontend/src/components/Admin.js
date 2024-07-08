import React, { useState, useEffect } from 'react';
import './Admin.css';
import NewUserForm from './NewUser';
import EditUserForm from './EditUser';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [showEditUserForm, setShowEditUserForm] = useState(false);

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
  };

  const handleUserAdded = (newUser) => {
    setUsers((prevUsers) => [...prevUsers, newUser]);
    setShowNewUserForm(false); 
  };

  const handleEditUser = () => {
    setShowEditUserForm(true);
  };

  const handleDeleteUser = () => {
    console.log("Delete User clicked");
  };

  return (
    <div className="container">
      {showNewUserForm ? (
        <NewUserForm onUserAdded={handleUserAdded} />
      ) : (
        <>
          <div className="left">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Users</th>
                  <th>Devices</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.noofdevices}</td>
                    <td>
                      <button className="action-btn" onClick={() => handleEditUser(user._id)}>Edit</button>
                      <button className="action-btn" onClick={handleDeleteUser}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="button-group">
              <button className="action-btn" onClick={handleNewUser}>Add New User</button>
            </div>
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
