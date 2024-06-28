import React, { useState } from 'react';
import './NewUser.css';
import { useNavigate } from 'react-router-dom';

const NewUserForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [devices, setDevices] = useState('');
  const [deviceIPs, setDeviceIPs] = useState([]);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [buttonText, setButtonText] = useState('SAVE');
  const [emailError, setEmailError] = useState('');
  const navigate = useNavigate();

  const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = () => {
    return name !== '' && isEmailValid(email) && devices !== '';
  };

  const handleDevicesChange = (e) => {
    setDevices(e.target.value);
  };

  const handleDeviceIPChange = (index, value) => {
    const newDeviceIPs = [...deviceIPs];
    newDeviceIPs[index] = value;
    setDeviceIPs(newDeviceIPs);
  };

  const checkEmailExists = async (email) => {
    try {
      const response = await fetch('http://localhost:5000/admin/checkemail', {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      return;
    }

    const emailExists = await checkEmailExists(email);
    if (!emailExists) {
      setEmailError('Email does not exist in the database');
      return;
    }

    const numDevices = Number(devices);
    setDeviceIPs(Array(numDevices).fill(''));
    setIsFormSubmitted(true);
    setButtonText('SAVED');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found in localStorage');
      }

      const response = await fetch('http://localhost:5000/admin/adduser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          email,
          noofdevices: numDevices
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('User added successfully:', data);

      // Update number of devices for the user
      // const updateResponse = await fetch(`http://localhost:5000/admin/${email}/updatedevices`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify({
      //     noofdevices: numDevices
      //   })
      // });

      // if (!updateResponse.ok) {
      //   throw new Error('Failed to update devices count');
      // }

      // console.log('Devices count updated successfully');
    } 
    catch (error) {
      console.error('Error:', error);
    }
  };

  const handleIPSubmission = () => {
    if (deviceIPs.includes('')) {
      alert('Please fill in all device IPs');
      return;
    }
    navigate('/admin', { state: { name, devices } });
  };

  return (
    <div className="container">
      <div className="left-screen">
        <h1 className='new-user'>NEW USER</h1>
      </div>
      <div className="right-screen">
        <form className='input-form' onSubmit={handleSubmit}>
          <label htmlFor="name" className='box'>Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            className='textbox'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label htmlFor="email" className='box'>Email:</label>
          <input
            type="text"
            id="email"
            name="email"
            className='textbox'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={async () => {
              const emailExists = await checkEmailExists(email);
              if (!emailExists) {
                setEmailError('Email does not exist in the database');
              } else {
                setEmailError('');
              }
            }}
          />
          {emailError && <div className="error-message">{emailError}</div>}

          <label htmlFor="device" className='box'>No. of Devices:</label>
          <input
            type="number"
            id="device"
            name="device"
            className='textbox'
            value={devices}
            onChange={handleDevicesChange}
          />

          <button type="submit" className='save-btn' disabled={!isFormValid()}>{buttonText}</button>
        </form>

        {isFormSubmitted && (
          <div className="device-ip-form">
            <h2>Enter IP Address:</h2>
            {Array.from({ length: Number(devices) }).map((_, index) => (
              <div key={index}>
                <label htmlFor={`device${index + 1}`} className='boxs'>{`Device${index + 1}:`} </label>
                <input
                  type="text"
                  id={`device${index + 1}`}
                  name={`device${index + 1}`}
                  className='textboxs'
                  value={deviceIPs[index] || ''}
                  onChange={(e) => handleDeviceIPChange(index, e.target.value)}
                />
              </div>
            ))}
            <button onClick={handleIPSubmission} className='save-btn'>Submit IPs</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewUserForm;
