import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './ChangePassword.css';

const ChangePasswordPage = () => {
    useEffect(() => {
        const fetchUserEmail = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch("http://localhost:5000/auth/users", {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setPasswordDetails(prevState => ({
                        ...prevState,
                        email: data.email
                    }));
                } else {
                    setError("Failed to fetch user email");
                }
            } catch (error) {
                console.error("Error fetching user email:", error);
                setError("Failed to fetch user email");
            }
        };

        fetchUserEmail();
    }, []);

    const [isProcessing, setIsProcessing] = useState(false);
    const [passwordDetails, setPasswordDetails] = useState({
        email: "",
        oldPassword: "",
        newPassword: ""
    });
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleInput = (e) => {
        const { name, value } = e.target;
        setPasswordDetails((prevState) => ({
            ...prevState,
            [name]: value
        }));

        if (name === 'oldPassword') {
            setShowOldPassword(value !== "");
        } else if (name === 'newPassword') {
            setShowNewPassword(value !== "");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isProcessing) return;
        setIsProcessing(true);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(passwordDetails.email)) {
            setIsProcessing(false);
            setError('Invalid email format');
            setTimeout(() => {
                setError('');
            }, 5000);
            return;
        }

        fetch("http://localhost:5000/auth/checkemail", {
            method: "POST",
            body: JSON.stringify({ email: passwordDetails.email }),
            headers: {
                "Content-Type": "application/json",
            }
        })
        .then(response => {
            if (response.status === 404) {
                setIsProcessing(false);
                setError("Email not found in database");
                setTimeout(() => {
                    setError('');
                }, 5000);
                return Promise.reject("Email not found in database");
            }
            return response.json();
        })
        .then(() => {
            fetch("http://localhost:5000/auth/requestpasswordotp", {
                method: "POST",
                body: JSON.stringify({ email: passwordDetails.email, oldPassword: passwordDetails.oldPassword }),
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(response => {
                setIsProcessing(false);
                if (response.ok) {
                    navigate('/new-otp', { state: { userDetails: { email: passwordDetails.email, password: passwordDetails.newPassword } } });
                    setPasswordDetails({
                        email: "",
                        oldPassword: "",
                        newPassword: ""
                    });
                } else {
                    setError("The old password you entered is incorrect. Please try again.");
                }
            })
            .catch(error => {
                setIsProcessing(false);
                console.error("Error sending OTP:", error);
            });
        })
        .catch(error => {
            setIsProcessing(false);
            console.error("Error:", error);
        });
    };

    const toggleShowOldPassword = () => {
        if (passwordDetails.oldPassword) {
            setShowOldPassword(!showOldPassword);
        }
    };

    const toggleShowNewPassword = () => {
        if (passwordDetails.newPassword) {
            setShowNewPassword(!showNewPassword);
        }
    };

    return (
        <div className="change-password-container">
            <h2>Change Password</h2>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <form onSubmit={handleSubmit}>
                <div className="input-groups">
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="Email" 
                        value={passwordDetails.email} 
                        onChange={handleInput} 
                        required 
                        readOnly 
                    />
                </div>
                <div className="input-groups password-input-group">
                    <input 
                        type={showOldPassword ? "password" : "text"} 
                        name="oldPassword" 
                        placeholder="Old Password" 
                        value={passwordDetails.oldPassword} 
                        onChange={handleInput} 
                        required 
                    />
                    {passwordDetails.oldPassword && (
                        <span className="password-toggle-iconn" onClick={toggleShowOldPassword}>
                            <FontAwesomeIcon icon={showOldPassword ? faEye : faEyeSlash} />
                        </span>
                    )}
                </div>
                <div className="input-groups password-input-group">
                    <input 
                        type={showNewPassword ? "password" : "text"} 
                        name="newPassword" 
                        placeholder="New Password" 
                        value={passwordDetails.newPassword} 
                        onChange={handleInput} 
                        required 
                    />
                    {passwordDetails.newPassword && (
                        <span className="password-toggle-iconn" onClick={toggleShowNewPassword}>
                            <FontAwesomeIcon icon={showNewPassword ? faEye : faEyeSlash} />
                        </span>
                    )}
                </div>
                <button
                    type="submit"
                    className={`submit-btn ${isProcessing ? 'processing' : ''}`}
                    disabled={isProcessing}
                >
                    {isProcessing ? 'Processing...' : 'Change Password'}
                </button>
            </form>
        </div>
    );
};

export default ChangePasswordPage;
