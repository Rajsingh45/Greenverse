import React, { useState } from 'react';
import './About.css';
import UserNavbar from './UserNavbar';
import Layout from './Layout';
import founder from './images/founder.jpg';
import partner1 from './images/partner1.png'
import partner2 from './images/partner2.png'
import partner3 from './images/partner3.png'
import partner4 from './images/partner4.png'
import partner5 from './images/partner5.png'
import partner6 from './images/partner6.jpeg'
const backendURL ="https://greenverse-d0ch.onrender.com";

const About = () => {
  // const storedAdminCredentials = JSON.parse(localStorage.getItem('adminCredentials'));
  const token = localStorage.getItem('token');
  const isAdmin = token ? JSON.parse(atob(token.split('.')[1])).role === 'admin' : false;
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      {isAdmin ? <Layout searchQuery={searchQuery} setSearchQuery={setSearchQuery} /> : <UserNavbar searchDisabled={true} />}

      <section className="about">
        <div className="about-container">
          <header className="about-header">
            <h1 className="about-title">About Us</h1>
          </header>

          <section className="about-origin">
            <div className="origin-content">
              <div className="origin-text">
                <p className='first-para section-text'>
                  Our innovative Air Quality Monitoring Portal is designed to give users real-time insights and control over multiple air quality monitors from a single, user-friendly interface. With our advanced air quality monitors, you can track and manage indoor air quality parameters, including PM2.5, humidity, temperature, and VOC levels, ensuring a healthier environment for your family or workspace. The portal's efficiency lies in its capability to provide detailed analytics, historical data, and customizable alerts, allowing proactive measures to maintain optimal air quality. Our technology empowers you to make informed decisions about the air you breathe.
                </p>
                <p className='first-para section-text'>To know more visit us at <a className='website-link' href='https://www.airbuddi.in' target="_blank" rel="noopener noreferrer">www.airbuddi.in </a></p>
              </div>
              <div className="origin-photo">
                <img src={founder} alt="Founder" />
              </div>
            </div>
          </section>

          <section className="about-partners">
            <h2 className="section-title">Our Partners</h2>
            <p className="section-text last-para">
              We take immense pride in our collaboration with some of the brightest minds and top-notch incubators worldwide, making our endeavors truly exceptional and captivating.
            </p>
            <div className="partners-photos">
              <div className="partner-photo"><img src={partner1} alt="Partner 1" /></div>
              <div className="partner-photo"><img src={partner2} alt="Partner 2" /></div>
              <div className="partner-photo"><img src={partner5} alt="Partner 5" /></div>
              <div className="partner-photo"><img src={partner3} alt="Partner 3" /></div>
              <div className="partner-photo"><img src={partner4} alt="Partner 4" /></div>
              <div className="partner-photo"><img src={partner6} alt="Partner 6" /></div>
            </div>
          </section>

        </div>
      </section>
    </>
  );
};

export default About;
