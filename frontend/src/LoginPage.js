import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import { UserContext } from "./UserContext"; // Ensure this path is correct

const LoginPage = () => {
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
        <div className="login-page">
            <h2>Login</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={userDetails.email}
                        onChange={handleInput}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        name="password"
                        value={userDetails.password}
                        onChange={handleInput}
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default LoginPage;