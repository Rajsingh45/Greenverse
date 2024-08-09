import React, { useState,useEffect } from 'react';
import axios from 'axios';
import UserNavbar from '../UserNavbar'

const ContactUs = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/contact', formData);
      window.alert('Your query has been submitted successfully.');
      setFormData({ name: '', phone: '', email: `${formData.email}`, message: '' });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      window.alert('There was an error submitting your query. Please try again later.');
    }
  };

  useEffect(() => {
  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const userData = response.data;
      if (userData && userData.email) {
        setFormData(prevData => ({ ...prevData, email: userData.email }));
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  fetchUserDetails();
}, []);

  return (
    <>
   <UserNavbar searchDisabled={true}/>
    <div className="contact-us">
          <h2>Contact Us</h2>
          <form onSubmit={handleSubmit}>
            <div className='name-phone'>
              <div className="form-group form-new">
                <label className='fields' htmlFor="name">Name:</label>
                <input type="text" id="name" name="name" className='name-field' value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group form-news">
                <label className='fields' htmlFor="phone">Phone:</label>
                <input type="number" id="phone" name="phone" className='name-field' value={formData.phone} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label className='fields' htmlFor="email">Email:</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required disabled/>
            </div>
            <div className="form-group">
              <label className='fields' htmlFor="message">Message:</label>
              <textarea id="message" name="message" rows="4" value={formData.message} onChange={handleChange} required></textarea>
            </div>
            <button type="submit" className="submit-button">Submit</button>
          </form>
        </div>
        </>
  );
};

export default ContactUs;
