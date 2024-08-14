import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './signup.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const SignupPage = () => {
    const navigate = useNavigate();

    const [userDetails, setUserDetails] = useState({
        name: "",
        email: "",
        password: "",
        contactNumber: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (userDetails.name) {
            checkNameAvailability(userDetails.name);
        }
    }, [userDetails.name]);

    const checkNameAvailability = async (name) => {
        try {
            const response = await fetch(`http://localhost:5000/auth/check-name?name=${name}`);
            if (response.status === 400) {
                const data = await response.json();
                setError(data.message);
            } else {
                setError('');
            }
        } catch (err) {
            console.error('Error during name check:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserDetails(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleLogin = () => {
        navigate("/");
    };

const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userDetails.email)) {
        setError('Invalid email format');
        return;
    }

    const contactNumberRegex = /^\d{10}$/;
    if (!contactNumberRegex.test(userDetails.contactNumber)) {
        setError('Invalid contact number');
        setTimeout(() => {
          setError('');
        }, 5000);
        return;
    }

    if (error) {
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/auth/requestsignupotp", {
            method: "POST",
            body: JSON.stringify({ email: userDetails.email }),
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status === 200) {
            navigate('/verifysignupotp', { state: { userDetails } });
        } else {
            const data = await response.json();
            setError(data.message || "Failed to send OTP");
        }
    } catch (err) {
        console.error('Error during OTP request:', err);
    }
};

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleNeedHelp = () => {
        navigate("/need-help");
    };

    return (
        <div className="container">
            <div className="left-panel-new">
                <div className="help-link-new" onClick={handleNeedHelp}>Need Help?</div>
                <h1 className='account'>Create Account</h1>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="text"
                            name="name"
                            placeholder="Username"
                            value={userDetails.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={userDetails.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="text"
                            name="contactNumber"
                            placeholder="Contact Number"
                            value={userDetails.contactNumber}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            value={userDetails.password}
                            onChange={handleInputChange}
                            required
                        />
                        <span className="password-toggle" onClick={toggleShowPassword}>
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                        </span>
                    </div>
                    <button type="submit" className="signup-btn-new">Next</button>
                </form>
            </div>
            <div className="right-panel-new">
                <h1 className='welcome'>Welcome Back!</h1>
                <p className='connected'>To keep connected with us please login with your personal info</p>
                <button className="signin-btn-new" onClick={handleLogin}>SIGN IN</button>
            </div>
        </div>
    );
}

export default SignupPage;
