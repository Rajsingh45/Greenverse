import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './VerifyOTP.css';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleSubmit = async () => {
    const enteredOtp = otp.join('');

    if (enteredOtp.length !== 6) {
      setError('OTP must be 6 digits');
      setTimeout(() => setError(''), 5000);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/auth/verifyforgotpasswordotp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp: enteredOtp }),
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message || 'Failed to verify OTP');
      }

      navigate('/set-password', { state: { email, otp: enteredOtp } });

    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError('Invalid OTP entered. Please try again.');
      setTimeout(() => setError(''), 5000);
    }
  };

  return (
    <div className="verify-otp-container">
      <div className="verify-otp-box">
        <h2 className='verify-title'>Verify OTP</h2>
        <p>An OTP has been sent to {email}</p>
        {error && <p className="error-message">{error}</p>}
        <div className="otp-inputs">
          {otp.map((data, index) => (
            <input
              type="text"
              name="otp"
              maxLength="1"
              key={index}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              className="otp-input"
              onFocus={(e) => e.target.select()}
            />
          ))}
        </div>
        <button onClick={handleSubmit} className="submit-otp-btn">
          Submit OTP
        </button>
        {/* <button onClick={handleBack} className="back-btn">Back</button> */}
      </div>
    </div>
  );
};

export default VerifyOTP;
