import React, { useState } from 'react';
import './NeedHelp.css';

const ContactUsu = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
            />
          </div>
          <button type="submit" className="submit-buttonu">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default ContactUsu;
