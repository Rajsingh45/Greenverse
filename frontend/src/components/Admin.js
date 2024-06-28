import React, { useState, useEffect } from 'react';
import './Admin.css';
import { useNavigate, useLocation } from 'react-router-dom';

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([
    { name: 'User A', devices: 50 },
    { name: 'User B', devices: 20 },
  ]);

  const handleNew = () => {
    navigate('/newuser');
  };

  useEffect(() => {
    if (location.state && location.state.name && location.state.devices) {
      const newUser = {
        name: location.state.name,
        devices: location.state.devices
      };
      setUsers((prevUsers) => [...prevUsers, newUser]);
      // Clear location state after adding the user to prevent duplicate entries on reload
      navigate('/admin', { replace: true });
    }
  }, [location.state, navigate]);

  return (
    <div className="container">
      <div className="left">
        <table className="user-table">
          <thead>
            <tr>
              <th>Users</th>
              <th>Devices</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={index}>
                <td>{user.name}</td>
                <td>{user.devices}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="add-user-btn" onClick={handleNew}>Add New User</button>
      </div>
      <div className="right">
        <h1 className="dashboard-title">Admin Dashboard</h1>
      </div>
    </div>
  );
};

export default Admin;
