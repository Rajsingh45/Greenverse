import React, { useState } from 'react';
import './ForgotPassword.css';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleGenerateOTP = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      setError('Email is required');
      setTimeout(() => {
        setError('');
      }, 5000);
      setIsProcessing(false);
      return;
    }

    if (!emailRegex.test(email)) {
      setError('Invalid email format');
      setTimeout(() => {
        setError('');
      }, 5000);
      setIsProcessing(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/auth/requestforgotpasswordotp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Error requesting OTP');
      }

      navigate('/verify-otp', { state: { email } });
      setError('');
    } catch (error) {
      console.error('Error requesting OTP:', error);
      setError('Email not registered! Please SignUp');
    }finally {
      setIsProcessing(false); 
    }
  };

  const handleBackToLogin = () => {
    navigate('/');
  };

  return (
    <div className="forgot-password-wrapper">
      <div className="forgot-password-image"></div>
      <div className="forgot-password-container">
        <div className="forgot-password-box">
          <h2 className='pass-forgot'>Forgot Your Password?</h2>
          <p className='new-text'>Enter your email to receive an OTP for password recovery. We’re here to help you get back in.</p>
          {error && <p className="error-message">{error}</p>}
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="email-input"
            required
          />
          <button
            onClick={handleGenerateOTP}
            className="generate-otp-btn"
            disabled={isProcessing} // Disable button while processing
          >
            {isProcessing ? 'Processing...' : 'Generate OTP'}
          </button>
          <div className="back-to-login">
        <ArrowBack className="back-icon" />
        <span onClick={handleBackToLogin}>Back to Login Page</span>
      </div>
        </div>
        
      </div>
      
    </div>   
  );
};

export default ForgotPassword;