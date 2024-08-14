import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import { UserContext } from "./UserContext";
import { FaUserCircle, FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons
import logo from './images/logo.png';

const LoginPage = () => {
    const [userDetails, setUserDetails] = useState({
        email: "",
        password: ""
    });
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const navigate = useNavigate();
    const loggedData = useContext(UserContext);

    useEffect(() => {
        const lastUsedCredentials = JSON.parse(localStorage.getItem('lastUsedCredentials')) || {};
        if (lastUsedCredentials.email && lastUsedCredentials.password) {
            setUserDetails({
                email: lastUsedCredentials.email,
                password: lastUsedCredentials.password
            });
            setRememberMe(true);
        }
    }, []);

    // Load password if email matches a remembered user
    useEffect(() => {
        const storedCredentials = JSON.parse(localStorage.getItem('rememberedUsers')) || {};
        const rememberedUser = storedCredentials[userDetails.email];
        if (rememberedUser) {
            setUserDetails((prevState) => ({ ...prevState, password: rememberedUser }));
            setRememberMe(true); // Keep checkbox ticked if the user was remembered
        } else {
            setUserDetails((prevState) => ({ ...prevState, password: '' }));
            setRememberMe(false); // Untick checkbox if the user was not remembered
        }
    }, [userDetails.email]);

    const handleInput = (e) => {
        const { name, value } = e.target;
        setUserDetails((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleCheckboxChange = () => {
        setRememberMe(!rememberMe);
    };

    const handleForgot = () => {
        navigate("/forgot-password");
    };

    const handleSign = () => {
        navigate("/signup");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userDetails.email)) {
            setError('Invalid email format');
            return;
        }

        fetch("http://localhost:5000/auth/login", {
            method: "POST",
            body: JSON.stringify({ ...userDetails, rememberMe }),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then((response) => {
                if (response.status === 404) {
                    setError("Email doesn't exist");
                } else if (response.status === 400) {
                    setError("Incorrect Password");
                }

                setTimeout(() => {
                    setError("");
                }, 5000);

                return response.json();
            })
            .then((data) => {
                if (data.token !== undefined) {
                    localStorage.setItem("token", data.token);
                    loggedData.setLoggedUser(data);

                    const storedCredentials = JSON.parse(localStorage.getItem('rememberedUsers')) || {};

                    if (rememberMe) {
                        storedCredentials[userDetails.email] = userDetails.password;
                        localStorage.setItem('rememberedUsers', JSON.stringify(storedCredentials));
                        localStorage.setItem('lastUsedCredentials', JSON.stringify(userDetails));
                    } else {
                        delete storedCredentials[userDetails.email];
                        localStorage.setItem('rememberedUsers', JSON.stringify(storedCredentials));
                        localStorage.removeItem('lastUsedCredentials');
                    }

                    if (userDetails.email === "admin@example.com" && userDetails.password === "adminpassword") {
                        navigate("/admin");
                        localStorage.setItem('adminCredentials', JSON.stringify(userDetails));
                    } else {
                        navigate("/dashboard");
                        localStorage.setItem('adminCredentials', JSON.stringify(userDetails));
                    }
                }
            })
            .catch((err) => {
                console.log(err);
                setError("An error occurred. Please try again.");
            });
    };

    return (
        <div className="container">
            <div className="left-panel">
                <div className="logo">
                    <img src={logo} className='photo' alt="GreenVerse Logo" />
                </div>
                <h1 className='title'>GreenVerse</h1>
                <p className='personal-details'>Enter your personal details to start the journey with us</p>
                <button className="signup-btn" onClick={handleSign}>SIGN UP</button>
            </div>
            <div className="right-panel">
                <div className="help-link">Need Help?</div>
                <div className="form-container">
                    <div className="avatar">
                        <FaUserCircle className="avatar-icon" />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <input type="email" name="email" placeholder="Email" value={userDetails.email} onChange={handleInput} />
                        </div>
                        <div className="input-group password-group">
                            <input 
                                type={passwordVisible ? "text" : "password"} 
                                name="password" 
                                placeholder="Password" 
                                value={userDetails.password} 
                                onChange={handleInput} 
                            />
                            <span 
                                className="password-toggle-icon" 
                                onClick={() => setPasswordVisible(!passwordVisible)}
                            >
                                {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        <div className="remember-container">
                            <label className="remember-me-label">
                                <input type="checkbox" checked={rememberMe} onChange={handleCheckboxChange} className='remember-me' />
                                Remember Me
                            </label>
                            <p className='forgot-pass' onClick={handleForgot}>Forgot Password?</p>
                        </div>
                        <button type="submit" className="signin-btn">SIGN IN</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
