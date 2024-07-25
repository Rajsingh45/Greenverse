import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Dashboard from './Dashboard';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import axios from 'axios';
import device1 from './images/device1.png';
import device2 from './images/device2.png';
import device3 from './images/device3.png';
import device4 from './images/device4.png';
import device5 from './images/device5.png';
import device6 from './images/device6.png';
import UserNavbar from './UserNavbar';

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
  const [profilePic, setProfilePic] = useState(null); // Initialize profilePic state
  const [deviceCount, setDeviceCount] = useState(0);

  // Function to handle profile picture change
  const handleProfilePicChange = (file) => {
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png') && file.size <= 1048576) {
      setProfilePic(URL.createObjectURL(file));
    } else {
      alert('Please select a JPG or PNG image smaller than 1MB.');
    }
  };

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

export default UserDetail;
