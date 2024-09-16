import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './VerifyOTP.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const backendURL=process.env.REACT_APP_BACKEND_URL;

const VerifyOTP = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const [resendTimer, setResendTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (resendTimer > 0) {
      const timerId = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    }
  }, [resendTimer]);


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
      const response = await fetch(`${backendURL}/auth/verifyforgotpasswordotp`, {
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

  const handleBack = () => {
    navigate('/forgot-password');
  };

  const handleResendOtp = async () => {
    if (resendTimer === 0 && !isResending) {
      setIsResending(true);
      try {
        const response = await fetch(`${backendURL}/auth/requestforgotpasswordotp`, {
          method: "POST",
          body: JSON.stringify({ email }),
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (response.status === 200) {
          setResendTimer(60);
          toast.success('OTP has been resent successfully.', {
            autoClose: 5000,
            closeOnClick: true,
          });
        } else {
          const data = await response.json();
          setError(data.message || "Failed to resend OTP");
        }
      } catch (err) {
        console.error('Error during OTP resend:', err);
      } finally {
        setIsResending(false);
      }
    }
  };


  return (
    <div className="otp-container">
      <div className="otp-box">
        <h2>Please verify your email</h2>
        <p>An OTP has been sent to {email}</p>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="otp-inputs">
            {otp.map((data, index) => (
              <input
                type="text"
                name="otp"
                maxLength="1"
                key={index}
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                className="otp-input"  // Ensure this class exists in your CSS for styling
                onFocus={(e) => e.target.select()}
              />
            ))}
          </div>
          <button type="submit" className="verify-btn" onClick={(e) => {
            e.preventDefault();  // Prevent form submission and navigation
            handleSubmit();
          }}>
            Verify Email
          </button>

        </form>
        <button className="resend-btn" onClick={handleResendOtp} disabled={resendTimer > 0 || isResending}>
          {isResending ? 'Resending...' : `Resend OTP ${resendTimer > 0 ? `in ${resendTimer} sec` : ''}`}
        </button>
        <button className="back-btn" onClick={handleBack}>Back</button>

      </div>
      <ToastContainer />
    </div>

  );
};

export default VerifyOTP;
