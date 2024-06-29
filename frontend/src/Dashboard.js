import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import axios from 'axios'; // Import axios for HTTP requests

const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // State to hold total pages
  const [deviceCount, setDeviceCount] = useState(0); // State to hold number of devices
  const imagesPerPage = 12;

  useEffect(() => {
    // Function to fetch number of devices from backend
    const fetchDeviceCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/admin/devices', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const { noofdevices } = response.data;
        setDeviceCount(noofdevices); // Set number of devices
        const totalPages = Math.ceil(noofdevices / imagesPerPage);
        setTotalPages(totalPages); // Set total pages for pagination
      } catch (error) {
        console.error('Error fetching device count:', error);
      }
    };

    fetchDeviceCount();
  }, []); // Run once on component mount to fetch device count

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

  const renderEmptyCards = () => {
    const cards = [];
    for (let i = 0; i < deviceCount; i++) {
      cards.push(
        <div className="gallery-item" key={i}>
          {/* You can customize the appearance of empty cards as needed */}
          <p>Device {i + 1}</p>
        </div>
      );
    }
    return cards;
  };

  return (
    <div className="dash">
      <h1 className="title">AQI Dashboard</h1>
      <div className="gallery">
        {/* Render empty cards based on device count */}
        {renderEmptyCards()}
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
  );
};

export default Dashboard;
