import React, { useState, useEffect } from 'react';
import './DeviceDetail.css';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import 'dayjs/locale/en-gb';
import UserNavbar from './UserNavbar';
import Layout from './Layout';
import IconButton from '@mui/material/IconButton';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const DeviceDetailPage = () => {
    const { deviceName } = useParams();
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [selectedOption, setSelectedOption] = useState('');
    const [error, setError] = useState('');
    const [liveData, setLiveData] = useState(null);
    const [parameterOptions, setParameterOptions] = useState([]);
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [maxDate, setMaxDate] = useState(new Date());
    const [datePickerOpen, setDatePickerOpen] = useState(true);

    useEffect(() => {
        const fetchLiveData = async () => {
            try {
                const formattedDate = dayjs(calendarDate).format('YYYY-MM-DD');
                const formattedTime = dayjs(calendarDate).format('HH:mm:ss');
                const response = await fetch(`http://localhost:5000/api/device-data/${deviceName}`);
                const result = await response.json();

                if (result.length > 0) {
                    const data = result[0];
                    const headers = Object.keys(data).filter(key => key !== '_id' && key !== 'id' && key !== 'dateTime');
                    setParameterOptions(headers);
                    setLiveData(data);
                } else {
                    setParameterOptions([]);
                    setLiveData(null);
                }
            } catch (error) {
                console.error('Error fetching live data:', error);
            }
        };

        fetchLiveData();

        return () => {
            // Cleanup logic if needed
        };
    }, [deviceName, calendarDate]);

    useEffect(() => {
        const interval = setInterval(() => {
            setMaxDate(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleStartDateChange = (date) => {
        setStartDate(date);
        if (date > endDate) {
            setEndDate(date);
        }
    };

    const handleEndDateChange = (date) => {
        setEndDate(date);
        if (date < startDate) {
            setStartDate(date);
        }
    };

    const handleSubmit = () => {
        if (!startDate || !endDate || !selectedOption) {
            setError('All fields must be filled.');
        } else {
            setError('');
            navigate(`/graph/${deviceName}`, {
                state: {
                    startDate: dayjs(startDate).format('YYYY-MM-DDTHH:mm:ss'),
                    endDate: dayjs(endDate).format('YYYY-MM-DDTHH:mm:ss'),
                    parameter: selectedOption
                }
            });
        }
    };

    const handleDateSelection = (date) => {
        setCalendarDate(date);
        // No need to call fetchDataAndParameters here as it is already handled in useEffect
    };

    const handleIconClick = () => {
        setCalendarDate(dayjs().toDate());
        setDatePickerOpen(true);
    };

    const filterFutureTimes = (time) => {
        const now = new Date();
        return time.getTime() <= now.getTime();
    };

    const storedAdminCredentials = JSON.parse(localStorage.getItem('adminCredentials'));
    const isAdmin = (storedAdminCredentials && storedAdminCredentials.email === "admin@example.com" && storedAdminCredentials.password === "adminpassword");

    return (
        <>
            {isAdmin ? <Layout /> : <UserNavbar />}
            <div className="device-detail-page">
                <div className="table-section">
                    <div className="calendar-icon-container">
                        <div className="date-pickers">
                            <IconButton onClick={handleIconClick}>
                                <CalendarTodayIcon />
                            </IconButton>
                            {datePickerOpen && (
                                <DatePicker
                                    selected={calendarDate}
                                    onChange={handleDateSelection}
                                    showTimeSelect
                                    timeIntervals={1}
                                    timeFormat="HH:mm"
                                    dateFormat="yyyy-MM-dd HH:mm"
                                    className='date-picker-input'
                                    onClickOutside={() => setDatePickerOpen(true)}
                                    maxDate={maxDate}
                                    filterTime={filterFutureTimes}
                                    yearDropdownItemNumber={15}
                                    scrollableYearDropdown
                                />
                            )}
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Parameter</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {liveData && Object.entries(liveData).filter(([key]) => !['_id', 'dateTime'].includes(key)).map(([key, value]) => (
                                <tr key={key}>
                                    <td>{key}</td>
                                    <td>{value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="filter-section">
                    <h3>Filter by Date and Time</h3>
                    <div className="date-picker">
                        <label>From:</label>
                        <DatePicker
                            selected={startDate}
                            onChange={handleStartDateChange}
                            showTimeSelect
                            timeIntervals={1}
                            timeFormat="HH:mm"
                            dateFormat="yyyy-MM-dd HH:mm"
                            className='date-picker-input'
                            maxDate={maxDate}
                            filterTime={filterFutureTimes}
                        />
                    </div>
                    <div className="date-picker">
                        <label>To:</label>
                        <DatePicker
                            selected={endDate}
                            onChange={handleEndDateChange}
                            showTimeSelect
                            timeIntervals={1}
                            timeFormat="HH:mm"
                            dateFormat="yyyy-MM-dd HH:mm"
                            className='date-picker-input'
                            maxDate={maxDate}
                            filterTime={filterFutureTimes}
                        />
                    </div>
                    <div className="dropdown-section">
                        <label>Select Parameter:</label>
                        <select
                            value={selectedOption}
                            onChange={(e) => setSelectedOption(e.target.value)}
                        >
                            <option value="" disabled>Select an option</option>
                            {parameterOptions.map((item, index) => (
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
