import React, { useState, useEffect } from 'react';
import './ContactUs.css';
import UserNavbar from '../UserNavbar';
import axios from 'axios';
const backendURL= "https://greenverse.onrender.com"

const ContactUsu = () => {
  
  const [profilePic, setProfilePic] = useState(null); 
  
  const [searchQuery, setSearchQuery] = useState(''); 
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '', isSignedUp: true }); 

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${backendURL}/auth/users`, {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Name validation: only letters and spaces
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(formData.name)) {
      alert('Please enter a valid name. Only letters and spaces are allowed.');
      return;
    }

    // Phone number validation: 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }

    // Email validation: proper email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address.');
      return;
    }

    // Message validation: minimum 10 characters
    if (formData.message.length < 10) {
      alert('Please enter at least 10 characters in the message.');
      return;
    }

    try {
      const response = await fetch(`${backendURL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Pass the token if available
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert('Your query has been submitted successfully.');
        setFormData(prevData => ({
          name: '', 
          phone: '', 
          email: prevData.email, 
          message: '', 
          isSignedUp: true 
      }));
      } else {
        alert('There was an error submitting your query. Please try again later.');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert('There was an error submitting your query. Please try again later.');
    }
  };

  return (
    <>
    <UserNavbar profilePic={profilePic} setSearchQuery={setSearchQuery} />
      <div className="contact-us-containerur">
        <div className="contact-us-contentur">
          <h2 className="h2u">Contact Us</h2>
          <p className="pur">If you have any questions or need assistance, please fill out the form below, and we'll get back to you as soon as possible.</p>
          <form onSubmit={handleSubmit}>
            <div className="form-groupu">
              <label htmlFor="name" className="form-labelu">Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                className="form-inputu"
                pattern="^[A-Za-z\s]+$" // HTML5 validation for only letters and spaces
                title="Please enter a valid name. Only letters and spaces are allowed."
              />
            </div>
            <div className="form-groupu">
              <label htmlFor="phone" className="form-labelu">Phone</label>
              <input 
                type="tel" 
                id="phone" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                required 
                className="form-inputu"
                pattern="^\d{10}$" // HTML5 validation for 10 digits
                title="Please enter a 10-digit phone number"
              />
            </div>
            <div className="form-groupu">
              <label htmlFor="email" className="form-labelu">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                className="form-inputu"
                pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$" // HTML5 validation for email format
                title="Please enter a valid email address"
              />
            </div>
            <div className="form-groupu">
              <label htmlFor="message" className="form-labelu">Message</label>
              <textarea 
                id="message" 
                name="message" 
                rows="2" 
                value={formData.message} 
                onChange={handleChange} 
                required 
                className="form-inputu"
                minLength="10" // HTML5 validation for min length
                title="Please enter at least 10 characters"
              />
            </div>
            <button type="submit" className="submit-buttonu">Submit</button>
          </form>
        </div>
      </div>
      </>
  );
};

export default ContactUsu;
