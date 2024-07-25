import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Dashboard from './Dashboard';
import axios from 'axios';

const UserDetail = () => {
  const { email } = useParams();
  const [userDevices, setUserDevices] = useState([]);

  useEffect(() => {
    const fetchUserDevices = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/admin/user/devices?email=${email}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const {devices}=response.data
        setUserDevices(devices);
      } catch (error) {
        console.error('Error fetching user devices:', error);
      }
    };
    console.log(userDevices)

    fetchUserDevices();
  }, [email]);

  return (
    <div>
      <h1>User Details for {email}</h1>
      <Dashboard isReadOnly={true} devices={userDevices} />
      
    </div>
  );
};

export default UserDetail;
