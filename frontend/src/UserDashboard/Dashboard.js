import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import axios from 'axios';
import device1 from '../images/device1.png';
import device2 from '../images/device2.png';
import device3 from '../images/device3.png';
import device4 from '../images/device4.jpg';
import device5 from '../images/device5.png';
import device6 from '../images/device6.jpg';

import UserNavbar from '../UserNavbar';
import { useParams } from 'react-router-dom';
const backendURL= "https://greenverse.onrender.com"

const Dashboard = ({ isReadOnly = false }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const { email } = useParams();
  const imagesPerPage = 6;
  const images = [device1, device2, device3, device4, device5, device6];

  const [totalPages, setTotalPages] = useState(1);
  const [profilePic, setProfilePic] = useState(null); 
  const [deviceCount, setDeviceCount] = useState(0);
  const [deviceNames, setDeviceNames] = useState([]); 
  const [searchQuery, setSearchQuery] = useState(''); 

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

  useEffect(() => {
    const fetchDeviceData = async () => {
      try {
        const token = localStorage.getItem('token');

        const countResponse = await axios.get(`${backendURL}/admin/devices`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const { noofdevices } = countResponse.data;
        setDeviceCount(noofdevices);

        const namesResponse = await axios.get(`${backendURL}/admin/device-names`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setDeviceNames(namesResponse.data.deviceNames || []);
      } catch (error) {
        console.error('Error fetching device data:', error);
      }
    };

    fetchDeviceData();
  }, [email]);

  useEffect(() => {
    const filteredDevices = deviceNames.filter(deviceName =>
      deviceName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setDeviceCount(filteredDevices.length);
    setTotalPages(Math.ceil(filteredDevices.length / imagesPerPage));
    setCurrentPage(1);
  }, [searchQuery, deviceNames]);

  const renderDeviceCards = () => {
    const startIndex = (currentPage - 1) * imagesPerPage;
    const endIndex = startIndex + imagesPerPage;
    const cards = [];
    const filteredDeviceNames = deviceNames.filter(deviceName =>
      deviceName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    for (let i = startIndex; i < endIndex && i < filteredDeviceNames.length; i++) {
      const image = images[i % images.length];
      const deviceName = filteredDeviceNames[i] || `Device ${i + 1}`; 
      cards.push(
        <div className="gallery-item" key={i}>
          <div className="image-container">
            <img src={image} alt={`Device ${i + 1}`} />
            <div className={`device-name-card ${isReadOnly ? 'readonly' : ''}`} onClick={() => handleNameClick(deviceName)}>
              <p className="device-text">{deviceName}</p>
            </div>
          </div>
        </div>
      );
    }
    return cards;
  };

  const handleNameClick = (deviceName) => {
    if (!isReadOnly) {
      window.location.href = `/device/${deviceName}`;
    }
  };

  return (
    <div className="dashboard">
      <UserNavbar profilePic={profilePic} setSearchQuery={setSearchQuery} />
      <div className="dash">
        <div className="gallery">
          {deviceCount > 0 ? (
            renderDeviceCards()
          ) : (
            <div className="no-devices-message"><b>No such device found!</b></div>
          )}
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
            {totalPages > 0 ? `${currentPage} / ${totalPages}` : '0 / 1'}
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
