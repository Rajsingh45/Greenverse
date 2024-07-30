import React, { useState, useEffect } from 'react';
import './DeviceDetail.css';
import { useParams, useNavigate } from 'react-router-dom';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import 'dayjs/locale/en-gb';
import UserNavbar from './UserNavbar';
import TextField from '@mui/material/TextField';
import Layout from './Layout';
import IconButton from '@mui/material/IconButton';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const DeviceDetailPage = () => {
    const { deviceId } = useParams();
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState(dayjs());
    const [endDate, setEndDate] = useState(dayjs());
    const [selectedOption, setSelectedOption] = useState('');
    const [error, setError] = useState('');
    const [liveData, setLiveData] = useState(null);
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    // Check if user is admin
    const storedAdminCredentials = JSON.parse(localStorage.getItem('adminCredentials'));
    const isAdmin = (storedAdminCredentials && storedAdminCredentials.email === "admin@example.com" && storedAdminCredentials.password === "adminpassword");
    const [searchQuery, setSearchQuery] = useState('');

    console.log("Is Admin:", isAdmin);

    const column1Data = ['A', 'B', 'C', 'D', 'E'];

    const handleStartDateChange = (newValue) => {
        if (newValue.isAfter(endDate)) {
            setEndDate(newValue);
        }
        setStartDate(newValue);
    };

    const handleEndDateChange = (newValue) => {
        if (newValue.isBefore(startDate)) {
            setStartDate(newValue);
        }
        setEndDate(newValue);
    };

    const handleSubmit = () => {
        if (!startDate || !endDate || !selectedOption) {
            setError('All fields must be filled.');
        } else {
            setError('');
            navigate(`/graph/${deviceId}`, {
                state: {
                    startDate: startDate.format('YYYY-MM-DDTHH:mm:ss'),
                    endDate: endDate.format('YYYY-MM-DDTHH:mm:ss'),
                    parameter: selectedOption
                }
            });
        }
    };

    useEffect(() => {
        // Set up WebSocket connection
        const socket = new WebSocket('ws://localhost:8080');

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setLiveData(data);
        };

        return () => {
            socket.close();
        };
    }, []);

    const handleDatePickerToggle = () => {
        setDatePickerOpen(!datePickerOpen);
    };

    const handleDateSelection = (newValue) => {
        setSelectedDate(newValue);
        setDatePickerOpen(false);
    };

    return (
        <>
            {/* <UserNavbar /> */}
            {isAdmin ? <Layout searchQuery={searchQuery} setSearchQuery={setSearchQuery} /> : <UserNavbar />}
            <div className="device-detail-page">
                <div className="table-section">
                    <div className="calendar-icon-container">
                        <IconButton onClick={handleDatePickerToggle}>
                            <CalendarTodayIcon />
                        </IconButton>
                        {datePickerOpen && (
                            <LocalizationProvider dateAdapter={AdapterDayjs} locale="en-gb">
                            <DateTimePicker
                                value={startDate}
                                onChange={handleStartDateChange}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </LocalizationProvider>
                        )}
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Column 1</th>
                                <th>Column 2</th>
                            </tr>
                        </thead>
                        <tbody>
                            {column1Data.map((item, index) => (
                                <tr key={index}>
                                    <td>{item}</td>
                                    <td>{liveData ? `Live Data: ${liveData.value}` : 'Waiting for data...'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="filter-section">
                    <h3>Filter by Date and Time</h3>
                    <div className="date-picker">
                        <label>From:</label>
                        <LocalizationProvider dateAdapter={AdapterDayjs} locale="en-gb">
                            <DateTimePicker
                                value={startDate}
                                onChange={handleStartDateChange}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </LocalizationProvider>
                    </div>
                    <div className="date-picker">
                        <label>To:</label>
                        <LocalizationProvider dateAdapter={AdapterDayjs} locale="en-gb">
                            <DateTimePicker
                                value={endDate}
                                onChange={handleEndDateChange}
                                renderInput={(params) => <TextField {...params} />}
                                minDate={startDate}
                            />
                        </LocalizationProvider>
                    </div>
                    <div className="dropdown-section">
                        <label>Select Parameter:</label>
                        <select
                            value={selectedOption}
                            onChange={(e) => setSelectedOption(e.target.value)}
                        >
                            <option value="" disabled>Select an option</option>
                            {column1Data.map((item, index) => (
                                <option key={index} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <div>
                        <button type="button" className="graph-button" onClick={handleSubmit}>
                            Show Graph
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DeviceDetailPage;
