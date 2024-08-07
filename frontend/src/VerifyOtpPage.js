import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './verifyotp.css';

const VerifyOtpPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userDetails } = location.state;
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(60);

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
            const response = await fetch("http://localhost:5000/auth/verifysignupotp", {
                method: "POST",
                body: JSON.stringify({
                    email: userDetails.email,
                    otp: enteredOtp,
                    name: userDetails.name,
                    password: userDetails.password,
                    contactNumber: userDetails.contactNumber
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (response.status === 200) {
                navigate('/');
            } else {
                const data = await response.json();
                setError(data.message || "Invalid OTP");
            }
        } catch (err) {
            console.error('Error during OTP verification:', err);
        }
    };

    const handleResendOtp = async () => {
        if (resendTimer === 0) {
            try {
                const response = await fetch("http://localhost:5000/auth/requestsignupotp", {
                    method: "POST",
                    body: JSON.stringify({ email: userDetails.email }),
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                if (response.status === 200) {
                    setResendTimer(60);
                } else {
                    const data = await response.json();
                    setError(data.message || "Failed to resend OTP");
                }
            } catch (err) {
                console.error('Error during OTP resend:', err);
            }
        }
    };

    const handleBack = () => {
        navigate('/signup');
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
                <button className="resend-btn" onClick={handleResendOtp} disabled={resendTimer > 0}>
                    Resend OTP {resendTimer > 0 && `in ${resendTimer} sec`}
                </button>
                <button className="back-btn" onClick={handleBack}>Back</button>
            </div>
        </div>
    );
};

export default VerifyOtpPage;
