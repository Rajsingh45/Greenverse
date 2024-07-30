import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import axios from 'axios';
import device1 from './images/device1.png';
import device2 from './images/device2.png';
import device3 from './images/device3.png';
import device4 from './images/device4.png';
import device5 from './images/device5.png';
import device6 from './images/device6.png';
import Layout from './Layout';

const UserDetail = ( devices = 0) => {
  const { email } = useParams();
//   const [deviceCount, setDeviceCount] = useState(0);

  useEffect(() => {
    const fetchUserDevices = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/admin/user/devices?email=${email}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const { devices } = response.data;  // Ensure this matches the backend response structure
        console.log('Fetched devices count:', devices);
        setDeviceCount(devices);
      } catch (error) {
        console.error('Error fetching user devices:', error);
      }
    };

    fetchUserDevices();
  }, [email]);

  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 6;
  const images = [device1, device2, device3, device4, device5, device6];

  // const totalPages = Math.ceil(devices / imagesPerPage);
  const [totalPages, setTotalPages] = useState(1);
  const [deviceCount, setDeviceCount] = useState(0);

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

  const handleNameClick = (deviceId) => {
    // if (!isReadOnly) {
      window.location.href = `/device/${deviceId}`;
    // }
  };

  const renderDeviceCards = () => {
    const startIndex = (currentPage - 1) * imagesPerPage;
    const endIndex = startIndex + imagesPerPage;
    const cards = [];
    for (let i = startIndex; i < endIndex && i < deviceCount; i++) {
      const image = images[i % images.length];
      cards.push(
        <div className="gallery-item" key={i}>
          <div className="image-container">
            <img src={image} alt={`Device ${i + 1}`} />
            <div className={`device-name-card `} onClick={() => handleNameClick(i + 1)}>
              <p className="device-text">Device {i + 1}</p>
            </div>
          </div>
        </div>
      );
    }
    return cards;
  };

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
        setUsers(data);
        setFilteredUsers(data);
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
      {/* <Navbar profilePic={profilePic} /> */}
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
            {currentPage} / {totalPages}
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
