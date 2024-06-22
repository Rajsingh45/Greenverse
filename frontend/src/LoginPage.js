import React, { useState } from 'react';
import { Link } from 'react-router-dom'; 
import './login.css'

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loggedIn, setLoggedIn] = useState(false);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
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

        // Add login logic here
        console.log('Logging in with:', email, password);

        // If login is successful, set loggedIn to true
        setLoggedIn(true);
    };

    return (
        <>
        <div className="login-page">
            <h2>Login</h2>
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
                <button type="submit">Login</button>
            </form>
            {loggedIn && ( // Conditionally render the Link component
                <p>
                    Login successful! Proceed to{' '}
                    <Link to="/book">Personalized Bookshelf</Link>
                </p>
            )}
        </div>
        </>
    );
};

export default LoginPage;
