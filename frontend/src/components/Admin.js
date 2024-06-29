import React, { useState, useEffect } from 'react';
import './Admin.css';
import NewUserForm from './NewUser'; // Import the NewUserForm component

const Admin = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'User A', devices: 50 },
    { id: 2, name: 'User B', devices: 20 },
  ]);
  const [showNewUserForm, setShowNewUserForm] = useState(false);

  const handleNewUser = () => {
    setShowNewUserForm(true);
  };

  const handleUserAdded = (newUser) => {
    setUsers((prevUsers) => [...prevUsers, newUser]);
    setShowNewUserForm(false); // Hide the form after adding the user
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
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.devices}</td>
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
