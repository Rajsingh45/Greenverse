import React, { useState, useEffect } from 'react';
import Admin from './AdminDashboard/Admin';

const DashboardPage = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

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

        // Ensure only the `users` array is processed
        if (Array.isArray(data.users)) {
          setUsers(data.users);
          setFilteredUsers(data.users);
        } else {
          console.error('Data.users is not an array:', data.users);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredUsers(
        users.filter(user =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  return (
    <div>
      {/* <Layout searchQuery={searchQuery} setSearchQuery={setSearchQuery} /> */}
      <Admin users={filteredUsers} setUsers={setUsers} />
    </div>
  );
};

export default DashboardPage;
