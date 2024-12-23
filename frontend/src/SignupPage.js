import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './signup.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import logo from './images/logo.png';
const backendURL=process.env.REACT_APP_BACKEND_URL

function RegisterForm() {

  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    contactNumber: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userDetails.name) {
      checkNameAvailability(userDetails.name);
    }
  }, [userDetails.name]);

  // useEffect(() => {

    useEffect(() => {
      // Ensure password visibility is off by default
      setShowPassword(false);
      setShowConfirmPassword(false);
    }, []); 
  //   setShowPassword(userDetails.password !== "");
  //   setShowConfirmPassword(userDetails.confirmPassword !== "");
  // }, [userDetails.password, userDetails.confirmPassword]);

  const checkNameAvailability = async (name) => {
    try {
      const response = await fetch(`${backendURL}/auth/check-name?name=${name}`);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || error) return;
    setIsSubmitting(true);
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userDetails.email)) {
      setError('Invalid email format');
      setTimeout(() => setError(''), 5000);
      setIsSubmitting(false);
      return;
    }

    const contactNumberRegex = /^\d{10}$/;
    if (!contactNumberRegex.test(userDetails.contactNumber)) {
      setError('Invalid contact number');
      setTimeout(() => setError(''), 5000);
      setIsSubmitting(false);
      return;
    }

    if (userDetails.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setTimeout(() => setError(''), 5000);
      setIsSubmitting(false);
      return;
    }

    if (userDetails.password !== userDetails.confirmPassword) {
      setError('Passwords do not match');
      setTimeout(() => setError(''), 5000);
      setIsSubmitting(false);
      return;
    }

    if (error) {
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${backendURL}/auth/requestsignupotp`, {
        method: "POST",
        body: JSON.stringify({ 
          email: userDetails.email,
          contactNumber: userDetails.contactNumber
        }),
        headers: {
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      if (response.status === 200) {
        const adminEmail = process.env.ADMIN_EMAIL;
        const role = userDetails.email === adminEmail ? "admin" : "user";
        navigate('/verifysignupotp', { state: { userDetails, role } });
      } else {
        setError(data.message || "Failed to send OTP");
        setTimeout(() => setError(''), 5000);
      }
    } catch (err) {
      console.error('Error during OTP request:', err);
      setError('An error occurred. Please try again.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(prevShowPassword => !prevShowPassword);
};

const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(prevShowConfirmPassword => !prevShowConfirmPassword);
};

  const handleNeedHelp = () => {
    navigate("/need-help");
  };

  return (
    <>
      <div className="containerq">
        <div className="left-sideq">
          <div className="logo">
            <img src={logo} alt="Company Logo" style={{ height: '100px' }} />
          </div>
          <div className="help-link" onClick={handleNeedHelp}>Need Help?</div>
          <div className="form-containerq">
            <form className="formq" onSubmit={handleSubmit}>
              <h2 className="titleq">Get Started Now</h2>
              {error && <p className="error-message">{error}</p>}
              <input
                type="text"
                placeholder="Username"
                name="name"
                value={userDetails.name}
                onChange={handleInputChange}
                className="inputq"
                required
              />
              <input
                type="email"
                placeholder="Email"
                name="email"
                value={userDetails.email}
                onChange={handleInputChange}
                className="inputq"
                required
              />
              <input
                type="text"
                placeholder="Contact Number"
                name="contactNumber"
                value={userDetails.contactNumber}
                onChange={handleInputChange}
                className="inputq"
                required
              />
              <div className="password-containerq">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  name="password"
                  value={userDetails.password}
                  onChange={handleInputChange}
                  className="inputq"
                  required
                />
                {userDetails.password && (
                  <span className="password-toggleq" onClick={toggleShowPassword}>
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash :  faEye} />
                  </span>
                )}
              </div>
              <div className="password-containerq">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  name="confirmPassword"
                  value={userDetails.confirmPassword}
                  onChange={handleInputChange}
                  className="inputq"
                  required
                />
                {userDetails.confirmPassword && (
                  <span className="password-toggleq" onClick={toggleShowConfirmPassword}>
                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                  </span>
                )}
              </div>
              <p className="policyq">
                Your personal data will be used to support your experience throughout this website, to manage access to your account, and for other purposes described in our <a href="#" className="privacy-linkq">privacy policy</a>.
              </p>
              <button type="submit" className="register-btnq" disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Register'}
              </button>
            </form>
          </div>
          <div className="or-containerq">
            <div className="lineq"></div>
            <span className="or-textq">OR</span>
            <div className="lineq"></div>
          </div>
          <p className="login-linkq">Already have an account? <a href="/">Log in</a></p>
        </div>
        <div className="background-imageq"></div>
      </div>
    </>
  );
}

export default RegisterForm;

