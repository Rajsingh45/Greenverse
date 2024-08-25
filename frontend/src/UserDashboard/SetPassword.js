import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SetPassword.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const SetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
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

  const toggleShowNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handlePasswordSubmit = async () => {
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      setTimeout(() => {
        setPasswordError('');
      }, 5000);
      return;
    }

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
          otp: otpFromState || otp,
          newPassword,
          confirmPassword,
        }),
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message || 'Failed to update password');
      }
      window.alert('Your password has been successfully updated. You can now log in with your new password.');
      navigate('/');
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
        
        <div className="input-groups">
          <input
            type={showNewPassword ? "text" : "password"}
            name="newPassword"
            placeholder="Enter new password"
            value={newPassword}
            onChange={handlePasswordChange}
            className="password-input"
            required
          />
          {newPassword.length > 0 && (
            <span className="password-toggle-iconnn" onClick={toggleShowNewPassword}>
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          )}
        </div>

        <div className="input-groups">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={handlePasswordChange}
            className="password-input"
            required
          />
          {confirmPassword.length > 0 && (
            <span className="password-toggle-iconnn" onClick={toggleShowConfirmPassword}>
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          )}
        </div>
        
        <button onClick={handlePasswordSubmit} className="submit-password-btn">
          Update Password
        </button>
      </div>
    </div>
  );
};

export default SetPassword;
