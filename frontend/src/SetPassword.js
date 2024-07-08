import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SetPassword.css';

const SetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email; 

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    if (name === 'newPassword') {
      setNewPassword(value);
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
    }
  };

  const handlePasswordSubmit = () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      setTimeout(() => {
        setPasswordError('');
      }, 5000);
      return;
    }

    navigate('/'); 
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
