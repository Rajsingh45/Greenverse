import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './verifyotp.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const backendURL="https://greenverse-fp31.onrender.com";

const VerifyOtpPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userDetails } = location.state;
    
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(60);
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setResendTimer((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;
        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        if (element.nextSibling) {
            element.nextSibling.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const enteredOtp = otp.join('');

        try {
            const response = await fetch(`${backendURL}/auth/verifypasswordotp`, {
                method: "PUT",
                body: JSON.stringify({
                    email: userDetails.email,
                    otp: enteredOtp,
                    password: userDetails.password
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (response.status === 200) {
                toast.success('Password changed successfully. Redirecting to login page.', {
                    onClose: () => navigate('/'),
                    autoClose: 5000,
                  });
            } else {
                const data = await response.json();
                setError(data.message || "Invalid OTP");
            }
        } catch (err) {
            console.error('Error during OTP verification:', err);
        }
    };

    const handleResendOtp = async () => {
        if (resendTimer === 0  && !isResending) {
            setIsResending(true);
            try {
                const response = await fetch(`${backendURL}/auth/requestpasswordotp`, {
                    method: "POST",
                    body: JSON.stringify({ email: userDetails.email, oldPassword: userDetails.oldPassword  }),
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

    const handleBack = () => {
        navigate('/change-password');
    };

    return (
        <div className="otp-container">
            <div className="otp-box">
                <h2>Please verify your email</h2>
                <p>Enter the One Time Password (OTP) which has been sent to ({userDetails.email})</p>
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
                                onFocus={(e) => e.target.select()}
                            />
                        ))}
                    </div>
                    <button type="submit" className="verify-btn">Verify Email</button>
                </form>
                <button className="resend-btn" onClick={handleResendOtp} disabled={resendTimer > 0 || isResending}>
    {isResending ? 'Resending...' : `Resend OTP ${resendTimer > 0 ? `in ${resendTimer} sec`:''}`}
</button>
                <button className="back-btn" onClick={handleBack}>Back</button>
            </div>
          <ToastContainer />
        </div>
    );
};

export default VerifyOtpPage;
