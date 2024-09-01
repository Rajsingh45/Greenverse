import React, { useState, useEffect } from 'react';
import './NewUser.css';
import { useNavigate } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
const backendURL="https://greenverse-d0ch.onrender.com"

const NewUserForm = ({ onUserAdded }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [devices, setDevices] = useState('');
  const [espTopics, setEspTopics] = useState([]);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [buttonText, setButtonText] = useState('SAVE');
  const [emailError, setEmailError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (name && devices) {
      setEspTopics(Array.from({ length: Number(devices) }, (_, i) => `${name}${i + 1}`));
    } else {
      setEspTopics([]);
    }
  }, [name, devices]);

  const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = () => {
    return name !== '' && isEmailValid(email) && devices !== '' && Number(devices) > 0;
  };

  const handleDevicesChange = (e) => {
    setDevices(e.target.value);
  };

  const handleEspTopicChange = (index, value) => {
    const newEspTopics = [...espTopics];
    newEspTopics[index] = value;
    setEspTopics(newEspTopics);
  };

  const checkEmailExists = async (email) => {
    try {
      const response = await fetch(`${backendURL}/admin/checkemail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  const isNameValid = (name) => {
    const nameRegex = /^[A-Za-z]+$/; // Only allows alphabet characters, no spaces
    return nameRegex.test(name);
  };
  
  // Update the handleSubmit function with name validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isNameValid(name)) {
      alert('Name should only contain characters and no spaces');
      return;
    }
    
    if (!isFormValid()) {
      return;
    }
  
    const emailExists = await checkEmailExists(email);
    if (!emailExists) {
      setEmailError('Email already exists');
      return;
    }
  
    setEmailError('');
    setIsFormSubmitted(true);
    setButtonText('SAVED');
  };

  const handleTopicSubmission = async () => {
    const uniqueTopics = new Set(espTopics);
    if (espTopics.length !== uniqueTopics.size) {
      alert('Please ensure all topics are unique');
      return;
    }
  
    // Convert current date to IST format as a string
    const currentISTTime = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date());
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found in localStorage');
      }
  
      const response = await fetch(`${backendURL}/admin/adduser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          email,
          noofdevices: Number(devices),
          espTopics,
          dateAdded: currentISTTime // Add the IST date here
        })
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      console.log('User added successfully:', data);
      navigate('/admin');
  
      onUserAdded({
        id: Date.now(),
        name,
        email,
        noofdevices: Number(devices),
        espTopics
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  
  return (
    <div className='container-height'>
    <div className="single-container">
      <div className="icon-section">
        <PersonAddIcon style={{ fontSize: '100px', color: 'orange' }} />
        <h1 className='new-user'>NEW USER</h1>
      </div>
      <div className="form-section">
        <form className='input-form' onSubmit={handleSubmit}>
          <label htmlFor="name" className='box'>Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            className='textbox'
            value={name}
            onChange={(e) => {
              if (isNameValid(e.target.value) || e.target.value === '') {
                setName(e.target.value);
              } else {
                alert('Name should only contain characters and no spaces');
              }
            }}
            disabled={isFormSubmitted}
          />

          <label htmlFor="email" className='box'>Email:</label>
          <input
            type="text"
            id="email"
            name="email"
            className='textbox'
            value={email}
            disabled={isFormSubmitted}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={async () => {
              if (isEmailValid(email)) {
                const emailExists = await checkEmailExists(email);
                if (!emailExists) {
                  setEmailError('Email already exists');
                } else {
                  setEmailError('');
                }
              } else {
                setEmailError('Invalid email format');
              }
            }}
          />

          {emailError && <div className="error-message-new">{emailError}</div>}

          <label htmlFor="device" className='box'>No. of Devices:</label>
          <input
            type="number"
            id="device"
            name="device"
            className='textbox'
            value={devices}
            onChange={handleDevicesChange}
            disabled={isFormSubmitted}
          />

          <button type="submit" className='save-btn' disabled={!isFormValid() || isFormSubmitted}>{buttonText}</button>
        </form>
        {isFormSubmitted && (
      <div className="device-ip-form">
        <h2>Enter Device Name:</h2>
        {Array.from({ length: Number(devices) }).map((_, index) => (
          <div key={index}>
            <label htmlFor={`device${index + 1}`} className='boxs'>{`Device${index + 1}:`} </label>
            <input
              type="text"
              id={`device${index + 1}`}
              name={`device${index + 1}`}
              className='textboxs'
              value={espTopics[index] || ''}
              onChange={(e) => handleEspTopicChange(index, e.target.value)}
            />
          </div>
        ))}
        <button onClick={handleTopicSubmission} className='save-btn'>Submit Topics</button>
      </div>
    )}
      </div>
    </div>
    </div>
  );
};

export default NewUserForm;
