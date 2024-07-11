import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SetPassword.css';

const SetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState(''); // Add OTP state
  const [passwordError, setPasswordError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  
  // Extract OTP from location state
  const otpFromState = location.state?.otp;

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    if (name === 'newPassword') {
      setNewPassword(value);
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else if (name === 'otp') {
      setOtp(value);
    }
  };

  const handlePasswordSubmit = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      setTimeout(() => {
        setPasswordError('');
      }, 5000);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/auth/resetpassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp: otpFromState || otp, // Use OTP from state if available
          newPassword,
          confirmPassword,
        }),
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message || 'Failed to update password');
      }

      navigate('/'); // Redirect to login page after successful password update
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordError('Failed to update password. Please try again.');
      setTimeout(() => {
        setPasswordError('');
      }, 5000);
    }
  };

  return (
    <div className="set-password-container">
      <div className="set-password-box">
        <h2 className='set-password-title'>Set New Password</h2>
        <p>Enter your new password below:</p>
        {passwordError && <p className="error-message">{passwordError}</p>}
        <input
          type="password"
          name="newPassword"
          placeholder="Enter new password"
          value={newPassword}
          onChange={handlePasswordChange}
          className="password-input"
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={handlePasswordChange}
          className="password-input"
          required
        />
        <button onClick={handlePasswordSubmit} className="submit-password-btn">
          Update Password
        </button>
      </div>
    </div>
  );
};

export default SetPassword;
