import React, { useState} from 'react';
import { useNavigate } from 'react-router-dom';
import './signup.css';

const SignupPage = () => {
    const navigate = useNavigate(); 

    const [userDetails, setUserDetails] = useState({
        name:"",
        email: "",
        password: ""
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

    const handleLogin=()=>{
        navigate("/")
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(userDetails);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userDetails.email)) {
            setError('Invalid email format');
            return;
        }

        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(userDetails.name)) {
            setError('Name cannot contain numbers');
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
        .then((response) => {
            if (response.status === 400) {
                setError("User already exists");
            }

            return response.json();
        })
        .then((data) => {
            // setMessage({ type: "success", text: data.message });

            setUserDetails({
                name:"",
                email: "",
                password: ""
            });

            setTimeout(() => {
                setMessage({ type: "invisible-msg", text: "Dummy Msg" });
            }, 5000);

            navigate('/');

        })
        .catch((err) => {
            console.log(err);
        });
    };

    return (
        <div className="container">
            <div className="left-panel-new">
            <div className="help-link-new">Need Help?</div>
                <h1 className='account'>Create Account</h1>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="text"
                            name="name"
                            placeholder="Name"
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
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={userDetails.password}
                            onChange={handleInputChange}
                            required
                        />
                        <button type="submit" className="signup-btn-new">SIGN UP</button>
                    </div>
                    
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