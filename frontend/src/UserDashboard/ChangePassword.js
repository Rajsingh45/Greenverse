import React, { useState } from 'react';
import './ChangePassword.css';

const ChangePasswordPage = () => {
    const [passwordDetails, setPasswordDetails] = useState({
        email: "",
        oldPassword: "",
        newPassword: ""
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleInput = (e) => {
        const { name, value } = e.target;
        setPasswordDetails((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(passwordDetails.email)) {
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
                setError("Email not found in database");
                setTimeout(() => {
                    setError('');
                }, 5000);
                return Promise.reject("Email not found in database");
            }
            return response.json();
        })
        .then(() => {
            const token = localStorage.getItem('token');
            fetch("http://localhost:5000/auth/changepassword", {
                method: "PUT",
                body: JSON.stringify({
                    email: passwordDetails.email,
                    oldPassword: passwordDetails.oldPassword,
                    newPassword: passwordDetails.newPassword
                }),
                headers: {
                    'Authorization': `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            })
            .then(response => {
                if (!response.ok) {
                    setError("Old Password is incorrect");
                    setTimeout(() => {
                        setError('');
                    }, 5000); 
                    return Promise.reject("Failed to change password");
                }
                setSuccess("Password changed successfully");
                setTimeout(() => {
                    setSuccess('');
                }, 5000);
                setPasswordDetails({
                    email: "",
                    oldPassword: "",
                    newPassword: ""
                });
            })
            .catch(error => {
                console.error("Error:", error);
            });
        })
        .catch(error => {
            console.error("Error:", error);
        });
    };

    return (
        <div className="change-password-container">
            <h2>Change Password</h2>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <form onSubmit={handleSubmit}>
                <div className="input-groups">
                    <input type="email" name="email" placeholder="Email" value={passwordDetails.email} onChange={handleInput} required />
                </div>
                <div className="input-groups">
                    <input type="password" name="oldPassword" placeholder="Old Password" value={passwordDetails.oldPassword} onChange={handleInput} required />
                </div>
                <div className="input-groups">
                    <input type="password" name="newPassword" placeholder="New Password" value={passwordDetails.newPassword} onChange={handleInput} required />
                </div>
                <button type="submit" className="submit-btn">Change Password</button>
            </form>
        </div>
    );
};

export default ChangePasswordPage;