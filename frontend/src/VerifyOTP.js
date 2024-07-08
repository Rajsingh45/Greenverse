import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './VerifyOTP.css';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email; // Corrected destructuring

  const handleOtpChange = (e) => {
    const { value } = e.target;
    if (/^\d{0,6}$/.test(value)) {
      setOtp(value);
    }
  };

  const handleOtpSubmit = () => {
    if (otp.length !== 6) {
      setOtpError('OTP must be 6 digits');
      setTimeout(() => {
        setOtpError('');
      }, 5000);
      return;
    }

    setOtpError('');

    if (otp === '123456') {
      navigate('/set-password', { state: { email } });
    } else {
      setOtpError('Invalid OTP entered');
      setTimeout(() => {
        setOtpError('');
      }, 5000);
    }
  };

  return (
    <div className="verify-otp-container">
      <div className="verify-otp-box">
        <h2 className='verify-title'>Verify OTP</h2>
        <p>An OTP has been sent to {email}</p>
        {otpError && <p className="error-message">{otpError}</p>}
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={handleOtpChange}
          className="otp-input"
          maxLength="6"
        />
        <button onClick={handleOtpSubmit} className="submit-otp-btn">
          Submit OTP
        </button>
      </div>
    </div>
  );
};

export default VerifyOTP;
