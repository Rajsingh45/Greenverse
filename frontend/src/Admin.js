import React, { useState } from 'react';
import './Dashboard.css';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'; // Import icons from react-icons
import image1 from './images/device1.png';
import image2 from './images/device2.png';
import image3 from './images/device3.png';
import image4 from './images/device4.png';
import image5 from './images/device5.png';
import image6 from './images/device6.png';
import image7 from './images/device1.png';
import image8 from './images/device2.png';
import image9 from './images/device3.png';
import image10 from './images/device4.png';
import image11 from './images/device5.png';
import image12 from './images/device6.png';
import image13 from './images/device1.png';
import image14 from './images/device2.png';
import image15 from './images/device3.png';
import image16 from './images/device4.png';
import image17 from './images/device5.png';
import image18 from './images/device6.png';

const images = [
  image1, image2, image3, image4, image5, image6, image7, image8, image9, image10,
  image11, image12, image13, image14, image15, image16, image17, image18,
];

const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 12;
  const totalPages = Math.ceil(images.length / imagesPerPage);

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

  const currentImages = images.slice(
    (currentPage - 1) * imagesPerPage,
    currentPage * imagesPerPage
  );

  return (
    <div className="dash">
      <h1 className="title">AQI Dashboard</h1>
      <div className="gallery">
        {currentImages.map((image, index) => (
          <div className="gallery-item" key={index}>
          <img src={image} alt={`AQI Device ${index + 1}`} />
        </div>
        ))}
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
