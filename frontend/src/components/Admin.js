import React, { useState } from 'react';
import './Admin.css';
import { useNavigate } from 'react-router-dom';

const Admin=()=> {
  const navigate = useNavigate();

const handleNew=()=>{
  navigate("/newuser")
}

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
            <tr>
              <td>User A</td>
              <td>50</td>
            </tr>
            <tr>
              <td>User B</td>
              <td>20</td>
            </tr>
          </tbody>
        </table>
        <button className="add-user-btn" onClick={handleNew}>Add New User</button>
      </div>
      <div className="right">
        <h1 className="dashboard-title">Admin Dashboard</h1>
      </div>
    </div>
  );
}

export default Admin;