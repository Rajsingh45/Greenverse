import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import './signup.css'

const SignupPage = () => {
    const navigate = useNavigate(); 

    const [userDetails, setUserDetails] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        age: ""
    });

    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserDetails(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const [message, setMessage] = useState({
        type: "invisible-msg",
        text: "Dummy Msg"
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(userDetails);

        if (userDetails.password !== userDetails.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setError('');

        fetch("http://localhost:5000/auth/register", {
            method: "POST",
            body: JSON.stringify(userDetails),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then((response) => response.json())
        .then((data) => {
            setMessage({ type: "success", text: data.message });

            setUserDetails({
                email: "",
                password: "",
                confirmPassword: "",
                age: ""
            });

            setTimeout(() => {
                setMessage({ type: "invisible-msg", text: "Dummy Msg" });
            }, 5000);

            navigate('/login');

        })
        .catch((err) => {
            console.log(err);
        });
    };

    return (
        <>
        <div className="signup-page">
            <h2>Sign Up</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input type="email" name="email" value={userDetails.email} onChange={handleInputChange} required />
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" name="password" value={userDetails.password} onChange={handleInputChange} required />
                </div>
                <div>
                    <label>Confirm Password:</label>
                    <input type="password" name="confirmPassword" value={userDetails.confirmPassword} onChange={handleInputChange} required />
                </div>
                <button type="submit">Sign Up</button>
            </form>
            <p className="switch-link">Already have an account? <Link to="/login">Sign In</Link></p> 
            {message.type !== "invisible-msg" && <p className={message.type}>{message.text}</p>}
        </div>
        </>
    );
};

export default SignupPage;
