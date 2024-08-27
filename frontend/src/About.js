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
            <h2 className="section-title">Our Origin</h2>
            <div className="origin-content">
              <div className="origin-text">
                <p className='first-para section-text'>
                  Driven by a vision of cleaner air for all, we embarked on the AirBuddi journey in January 2020. Diwali worsened my respiratory issues due to hazardous pollution. Despite trying various air purifiers, none were effective, leading to hospitalization. This experience inspired me to pursue a goal: creating a solution to eliminate harmful particles, gases from homes, preventing air pollution impact on health.
                </p>
                <p className='first-para section-text'>
                  With the crucial support of IIT BHU's Cisco Things Qtbator incubator, the first functional prototype, AirBuddi, materialized in June 2021.
                </p>
                <p className='first-para section-text'>
                  Since then, AirBuddi has rapidly gathered momentum, boasting a honed business plan, nearly complete market research, and promising early engagement on web and social media platforms. The recent deployment of 250 customized AirBuddi units in Greater Noida apartments, gathering invaluable local feedback, is just the first step.
                </p>
                <p className='first-para section-text'>
                  Our unwavering focus now lies on flooding local markets and transforming feedback into fuel for growth. By December 2024, AirBuddi will conquer the Indian market, bringing fresh air to Agra, Delhi, Mumbai, Lucknow, and beyond.
                </p>
              </div>
              <div className="origin-photo">
                <img src={founder} alt="Founder" />
              </div>
            </div>
          </section>

          <section className="about-mission">
            <h2 className="section-title">Our Mission - Redefining the Way We Breathe</h2>
            <div className="origin-contents">
              <div className="origin-texts">
                <p className="section-text">
                  Pioneering a breath of fresh air in homes, we're committed to providing unparalleled air purifiers for an elevated and healthier living experience.
                </p>
                <p className="section-text">
                  Our mission is to redefine home environments with cutting-edge air purifiers, ensuring optimal air quality and fostering well-being for healthier and more comfortable living.
                </p>
                <p className="section-text">
                  Dedicated to transforming living spaces, we strive to deliver state-of-the-art air purifiers, enhancing indoor air quality and promoting wellness for a healthier home ambiance.
                </p>
              </div>
              <div className="origin-photo">
                <img src={founder} alt="Founder" />
              </div>
            </div>
          </section>

          <section className="about-achievements">
            <h2 className="section-title key-achieve">Key Achievements</h2>
            <ul className="achievements-list">
              <li>We recently graduated from Atal Incubation Center – Bimtech.</li>
              <li>We were selected in top 5 handpicked startups for AIM iLeap – Fighting with air pollution program across India.</li>
              <li>We were a part of Startup India Innovation Week and set up our stall there.</li>
              <li>We are associated with IAAPC (Indian Association of Air Pollution Control Board).</li>
              <li>We are also closely working together with CPCB (Central Pollution Control Board) to bring a massive change in Air Quality.</li>
              <li>We were also among the finalists of Chunauti 2.0 and selected by STPI Medtech Coe.</li>
              <li>Associated with Brinc and B Entrepreneur Organization from Bahrain and represented AirBuddi internationally on the show Preparing for Apocalypse.</li>
              <li>IIT BHU- IDAPT Hackathon - Winner 2nd prize</li>
              <li>iCreate- Roadshow at Sharda University - Winner 1st prize</li>
            </ul>
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
