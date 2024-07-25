import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import axios from 'axios'; // Import axios for HTTP requests
import device1 from './images/device1.png';
import device2 from './images/device2.png';
import device3 from './images/device3.png';
import device4 from './images/device4.png';
import device5 from './images/device5.png';
import device6 from './images/device6.png';
import UserNavbar from './UserNavbar';

const Dashboard = ({ isReadOnly = false }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deviceCount, setDeviceCount] = useState(0);
  const imagesPerPage = 6;
  const images = [device1, device2, device3, device4, device5, device6];

  const [profilePic, setProfilePic] = useState(null); // Initialize profilePic state
  
  // Function to handle profile picture change
  const handleProfilePicChange = (file) => {
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png') && file.size <= 1048576) {
      setProfilePic(URL.createObjectURL(file));
    } else {
      alert('Please select a JPG or PNG image smaller than 1MB.');
    }
  };

  useEffect(() => {
    const fetchDeviceCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/admin/devices', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const { noofdevices } = response.data;
        setDeviceCount(noofdevices);
        const totalPages = Math.ceil(noofdevices / imagesPerPage);
        setTotalPages(totalPages);
      } catch (error) {
        console.error('Error fetching device count:', error);
      }
    };

    fetchDeviceCount();
  }, []);

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
    if (!isReadOnly) {
      window.location.href = `/device/${deviceId}`;
    }
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
            <div className={`device-name-card ${isReadOnly ? 'readonly' : ''}`} onClick={() => handleNameClick(i + 1)}>
              <p className="device-text">Device {i + 1}</p>
            </div>
          </div>
        </div>
      );
    }
    return cards;
  };

  return (
    <div className="dashboard">
      <UserNavbar profilePic={profilePic} />
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

export default Dashboard;
