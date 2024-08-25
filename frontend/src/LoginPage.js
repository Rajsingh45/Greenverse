import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import { UserContext } from "./UserContext";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons
import logo from './images/logo.png';

const LoginPage = () => {
    const [userDetails, setUserDetails] = useState({
        email: "",
        password: ""
    });
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [showPasswordIcon, setShowPasswordIcon] = useState(false); // New state to control password icon visibility
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

    useEffect(() => {
        const storedCredentials = JSON.parse(localStorage.getItem('rememberedUsers')) || {};
        const rememberedUser = storedCredentials[userDetails.email];
        if (rememberedUser) {
            setUserDetails((prevState) => ({ ...prevState, password: rememberedUser }));
            setRememberMe(true);
        } else {
            setUserDetails((prevState) => ({ ...prevState, password: '' }));
            setRememberMe(false);
        }
    }, [userDetails.email]);

    useEffect(() => {
        // Show the password toggle icon only when there is input in the password field
        setShowPasswordIcon(userDetails.password !== "");
    }, [userDetails.password]);

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

    const handleNeedHelp = () => {
        navigate("/need-help");
    };

    return (
        <div className="container">
            <div className="left-panel">
                <div className="logo">
                    <img src={logo} alt="Company Logo" style={{ height: '100px' }} />
                </div>
                <div className="help-link" onClick={handleNeedHelp}>Need Help?</div>
                <div className="form-container">
                    <h2 className="h1title">Welcome Back!</h2>
                    {error && <p className="error-message">{error}</p>}
                    <form onSubmit={handleSubmit} className='new-form'>
                        <div>
                            <div className="input-group">
                                <input className="size" type="email" name="email" placeholder="Email" value={userDetails.email} onChange={handleInput} />
                            </div>
                            <div className="input-group password-group">
                                <input className="size"
                                    type={passwordVisible ? "text" : "password"}
                                    name="password"
                                    placeholder="Password"
                                    value={userDetails.password}
                                    onChange={handleInput}
                                />
                                {showPasswordIcon && (
                                    <span
                                        className="password-toggle-icon"
                                        onClick={() => setPasswordVisible(!passwordVisible)}
                                    >
                                        {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                )}
                            </div>
                            <div className="remember-container">
                                <label className="remember-me-label">
                                    <input type="checkbox" checked={rememberMe} onChange={handleCheckboxChange} className='remember-me' />
                                    Remember Me
                                </label>
                                <p className='forgot-pass' onClick={handleForgot}>Forgot Password?</p>
                            </div>
                        </div>

                        <div>
                            <button type="submit" className="signin-btn">LOGIN</button>
                            <div className="or-container">
                                <div className="line"></div>
                                <span className="or-text">OR</span>
                                <div className="line"></div>
                            </div>
                            <p className="signup-text">Don't have an account? <a href="/signup"> Sign up</a></p>
                        </div>
                    </form>

                </div>

            </div>
            <div className="right-panel">
            </div>
        </div>
    );
}

export default LoginPage;