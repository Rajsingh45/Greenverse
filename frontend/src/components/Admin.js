import React, { useState, useEffect } from 'react';
import './Admin.css';
import NewUserForm from './NewUser';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [showNewUserForm, setShowNewUserForm] = useState(false);

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
    // Append the new user to the users array
    setUsers((prevUsers) => [...prevUsers, newUser]);
    setShowNewUserForm(false); 
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
