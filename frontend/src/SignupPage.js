import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './signup.css';
import { UserContext } from "./UserContext"; // Ensure this path is correct
// import SignupPage from './LoginPage';
import { FaUserCircle } from "react-icons/fa";

const SignupPage = () => {
    const [userDetails, setUserDetails] = useState({
        email: "",
        password: ""
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const loggedData = useContext(UserContext); // Ensure UserContext is properly imported and used

    const handleInput = (e) => {
        const { name, value } = e.target;
        setUserDetails((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleLogin=()=>{
        navigate("/")
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userDetails.email)) {
            setError('Invalid email format');
            return;
        }
         if (userDetails.password.length < 8) {
             setError('Password must be at least 8 characters long');
             return;
         }

        fetch("http://localhost:5000/auth/login", {
            method: "POST",
            body: JSON.stringify(userDetails),
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
                     localStorage.setItem("nutrify-user", JSON.stringify(data));
                    loggedData.setLoggedUser(data);
                    
                    if (userDetails.email === "admin@example.com" && userDetails.password === "adminpassword") {
                        navigate("/admin");
                    } else {
                        navigate("/dashboard");
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
            <div className="left-panel-new">
            <div className="help-link-new">Need Help?</div>
                <h1 className='account'>Create Account</h1>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="text"
                            name="name"
                            placeholder="Name"
                            value={userDetails.name}
                            onChange={handleInput}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={userDetails.email}
                            onChange={handleInput}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={userDetails.password}
                            onChange={handleInput}
                            required
                        />
                        <button type="submit" className="signup-btn">SIGN UP</button>
                    </div>
                    
                </form>
            </div>
            <div className="right-panel-new">
                <h1 className='welcome'>Welcome Back!</h1>
                <p className='connected'>To keep connected with us please login with your personal info</p>
                <button className="signin-btn" onClick={handleLogin}>SIGN IN</button>
            </div>
        </div>
    );

}

export default SignupPage;