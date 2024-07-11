import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SelectUser.css';

const SelectUser = () => {
  const [users, setUsers] = useState([]);
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

  const handleEditUser = (user) => {
    navigate('/edit-user', { state: { user } });
  };

  return (
    <div className="select-user-container">
      <h1>Select User to Edit</h1>
      <ul className="user-list">
        {users.map((user) => (
          <li key={user._id} onClick={() => handleEditUser(user)}>
            {user.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SelectUser;
