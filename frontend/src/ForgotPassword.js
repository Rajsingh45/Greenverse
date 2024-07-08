import React, { useState } from 'react';
import './ForgotPassword.css';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGenerateOTP = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      setError('Email is required');
      setTimeout(() => {
        setError('');
      }, 5000);
      return;
    }

    if (!emailRegex.test(email)) {
      setError('Invalid email format');
      setTimeout(() => {
        setError('');
      }, 5000);
      return;
    }

    console.log(`OTP generated for email: ${email}`);
    navigate('/verify-otp', { state: { email } }); // Pass email in the state object
    setError('');
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-box">
        <h2 className='pass-forgot'>Forgot Password</h2>
        {error && <p className="error-message">{error}</p>}
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="email-input"
          required
        />
        <button onClick={handleGenerateOTP} className="generate-otp-btn">
          Generate OTP
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
