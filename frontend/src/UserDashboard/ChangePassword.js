import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './ChangePassword.css';
import { ArrowBack } from '@mui/icons-material';
const backendURL= "https://greenverse.onrender.com"

const ChangePasswordPageUnique = () => {
    const token = localStorage.getItem('token');
    // const storedAdminCredentials = JSON.parse(localStorage.getItem('adminCredentials'));
    const isAdmin = token ? JSON.parse(atob(token.split('.')[1])).role === 'admin' : false;

    useEffect(() => {
        const fetchUserEmail = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${backendURL}/auth/users`, {
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

    const handleBackToHome = () => {
        if (!isAdmin) {
            navigate('/dashboard');
        }
        else {
            navigate('/admin')
        }
    };

    const handleInput = (e) => {
        const { name, value } = e.target;
        setPasswordDetails((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();

        if (passwordDetails.newPassword.length < 8) {
            setError("The new password must be at least 8 characters long.");
            return;
        }

        if (isProcessing) return;
        setIsProcessing(true);

        fetch(`${backendURL}/auth/requestpasswordotp`, {
            method: "POST",
            body: JSON.stringify({ email: passwordDetails.email, oldPassword: passwordDetails.oldPassword }),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                setIsProcessing(false);
                if (response.ok) {
                    navigate('/new-otp', { state: { userDetails: { email: passwordDetails.email, password: passwordDetails.newPassword, oldPassword: passwordDetails.oldPassword } } });
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
    };

    const toggleShowOldPassword = () => {
        setShowOldPassword(prevShowOldPassword => !prevShowOldPassword);
    };

    const toggleShowNewPassword = () => {
        setShowNewPassword(prevShowNewPassword => !prevShowNewPassword);
    };

    return (
        <div className="unique-change-password-container">
            <div className="unique-change-password-image-container">
                {/* <img src="../images/fp.png" alt="fp" /> */}
            </div>
            <div className="unique-change-password-form-container">
                <div className="unique-change-password-box">
                    <h2>Reset Password</h2>
                    <p className='unique-new-text'>Ready to change your password?</p>
                    <p className='unique-new-text'>Confirm your current password and set a new one.</p>
                    {error && <p className="unique-error-message">{error}</p>}
                    {success && <p className="unique-success-message">{success}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className="unique-input-groups">
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
                        <div className="unique-input-groups unique-password-input-group">
                            <input
                                type={showOldPassword ? "text" : "password"}
                                name="oldPassword"
                                placeholder="Old Password"
                                value={passwordDetails.oldPassword}
                                onChange={handleInput}
                                required
                            />
                            {passwordDetails.oldPassword && (
                                <span className="unique-password-toggle-icon" onClick={toggleShowOldPassword}>
                                    <FontAwesomeIcon icon={showOldPassword ? faEyeSlash : faEye} />
                                </span>

                            )}
                        </div>
                        <div className="unique-input-groups unique-password-input-group">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                name="newPassword"
                                placeholder="New Password"
                                value={passwordDetails.newPassword}
                                onChange={handleInput}
                                required
                            />
                            {passwordDetails.newPassword && (
                                <span className="unique-password-toggle-icon" onClick={toggleShowNewPassword}>
                                    <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
                                </span>

                            )}
                        </div>
                        <button
                            type="submit"
                            className={`unique-submit-btn ${isProcessing ? 'processing' : ''}`}
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'Processing...' : 'Reset Password'}
                        </button>
                    </form>
                    <div className="unique-back-to-home-container">
                        <ArrowBack className="back-iconn" />
                        <span onClick={handleBackToHome}>Back to Home Page</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordPageUnique;
