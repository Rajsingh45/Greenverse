import React, { useState, useEffect } from 'react';
import './NeedHelp.css';
import axios from 'axios';

const NeedHelp = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(formData.name)) {
      alert('Please enter a valid name. Only letters and spaces are allowed.');
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address.');
      return;
    }

    if (formData.message.length < 10) {
      alert('Please enter at least 10 characters in the message.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Pass the token if available
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert('Your query has been submitted successfully.');
        setFormData({ name: '', phone: '', email: '', message: '' });
      } else {
        alert('There was an error submitting your query. Please try again later.');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert('There was an error submitting your query. Please try again later.');
    }finally {
      setIsSubmitting(false); 
  }
  };

  return (
    <div className="contact-us-containeru">
      <div className="contact-us-contentu">
        <h2 className="h2u">Contact Us</h2>
        <p className="pu">If you have any questions or need assistance, please fill out the form below, and we'll get back to you as soon as possible.</p>
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
              rows="5" 
              value={formData.message} 
              onChange={handleChange} 
              required 
              className="form-inputu"
              minLength="10" // HTML5 validation for min length
              title="Please enter at least 10 characters"
            />
          </div>
          <button type="submit" className="submit-buttonu" disabled={isSubmitting}>
    {isSubmitting ? 'Processing...' : 'Submit'}
</button>
        </form>
      </div>
    </div>
  );
};

export default NeedHelp;
