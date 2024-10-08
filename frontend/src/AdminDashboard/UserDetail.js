import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import axios from 'axios';
import device1 from '../images/device1.png';
import device2 from '../images/device2.png';
import device3 from '../images/device3.png';
import device4 from '../images/device4.jpg';
import device5 from '../images/device5.png';
import device6 from '../images/device6.jpg';
import Layout from '../Layout';
const backendURL=process.env.REACT_APP_BACKEND_URL

const UserDetail = () => {
  const { email } = useParams();
  const [deviceCount, setDeviceCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 6;
  const images = [device1, device2, device3, device4, device5, device6];
  const [totalPages, setTotalPages] = useState(1);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [deviceNames, setDeviceNames] = useState([]); 
  
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const token = localStorage.getItem('token');
        const endpoint = searchQuery 
        ? `${backendURL}/admin/device-names` 
        :
           `${backendURL}/admin/user/devices`;
          
        const response = await axios.get(endpoint, {
          params: searchQuery ? { name: searchQuery } : { email },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const { deviceNames } = response.data;
        setDeviceNames(deviceNames || []);
        setTotalPages(Math.ceil(deviceNames.length / imagesPerPage));
      } catch (error) {
        console.error('Error fetching devices:', error);
      }
    };
  
    fetchDevices();
  }, [searchQuery, email]); 

  const [filteredDeviceNames, setFilteredDeviceNames] = useState([]);

  useEffect(() => {
    const filteredDevices = deviceNames.filter(deviceName =>
      deviceName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredDeviceNames(filteredDevices);
    setDeviceCount(filteredDevices.length);
    setTotalPages(Math.ceil(filteredDevices.length / imagesPerPage));
    setCurrentPage(1);
  }, [searchQuery, deviceNames]);
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const renderDeviceCards = () => {
    if (filteredDeviceNames.length === 0) {
      return <div className="no-devices-message"><b>No devices found!</b></div>;
    }
    const startIndex = (currentPage - 1) * imagesPerPage;
    const endIndex = startIndex + imagesPerPage;
    const cards = [];
    for (let i = startIndex; i < endIndex && i < filteredDeviceNames.length; i++) {
      const image = images[i % images.length];
      const deviceName = filteredDeviceNames[i]; 
      cards.push(
        <div className="gallery-item" key={i}>
          <div className="image-container">
            <img src={image} alt={`Device ${i + 1}`} />
            <div className="device-name-card" onClick={() => handleNameClick(deviceName)}>
              <p className="device-text">{deviceName}</p>
            </div>
          </div>
        </div>
      );
    }
    return cards;
  };
  

  const handleNameClick = (deviceName) => {
    window.location.href = `/device/${deviceName}`;
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${backendURL}/admin/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (Array.isArray(data.users)) {
          setUsers(data.users);
          setFilteredUsers(data.users);
        } else {
          console.error('Unexpected data format:', data);
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
    <div className="dashboard">
      <Layout searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <div className="dash">
        <div className="gallery">
          {renderDeviceCards()}
        </div>
        <div className="pagination">
          <button
            className="pagination-button"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            <FaArrowLeft />
          </button>
          <span className="page-number">
          {filteredDeviceNames.length > 0 ? `${currentPage} / ${totalPages}` : '0 / 1'}
          </span>
          <button
            className="pagination-button"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
