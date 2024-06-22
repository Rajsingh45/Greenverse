import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import './signup.css'

const SignupPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); // use useNavigate hook

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Invalid email format');
            return;
        }

        // Basic password format validation
        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        // Password match validation
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Navigate to login page
        navigate('/login');
    };

    return (
        <>
        <div className="signup-page">
            <h2>Sign Up</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input type="email" value={email} onChange={handleEmailChange} required />
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" value={password} onChange={handlePasswordChange} required />
                </div>
                <div>
                    <label>Confirm Password:</label>
                    <input type="password" value={confirmPassword} onChange={handleConfirmPasswordChange} required />
                </div>
                <button type="submit">Sign Up</button>
            </form>
            <p className="switch-link">Already have an account? <Link to="/login">Sign In</Link></p> 
        </div>
        </>
    );
};

export default SignupPage;