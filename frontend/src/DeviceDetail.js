import React, { useState, useEffect, useRef } from 'react';
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
    const { deviceId } = useParams();
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [selectedOption, setSelectedOption] = useState('');
    const [error, setError] = useState('');
    const [liveData, setLiveData] = useState(null);
    const [parameterOptions, setParameterOptions] = useState([]);
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [maxDate, setMaxDate] = useState(new Date()); // State for maxDate
    const [datePickerOpen, setDatePickerOpen] = useState(true);
    const wsRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchDataAndParameters = async (date) => {
        try {
            const formattedDate = dayjs(date).format('YYYY-MM-DD');
            const formattedTime = dayjs(date).format('HH:mm:00');
            const response = await fetch(`http://localhost:5000/api/data?date=${formattedDate}&time=${formattedTime}`);
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
            console.error('Error fetching data and parameters:', error);
        }
    };

    useEffect(() => {
        fetchDataAndParameters(calendarDate);

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [calendarDate]);

    useEffect(() => {
        // Update maxDate every minute
        const interval = setInterval(() => {
            setMaxDate(new Date());
        }, 60000); // 60,000 ms = 1 minute

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
            navigate(`/graph/${deviceId}`, {
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
        fetchDataAndParameters(date);
    };

    const handleIconClick = () => {
        setCalendarDate(dayjs().toDate()); // Set to current date and time
        setDatePickerOpen(true); // Open the date picker
    };

    const filterFutureTimes = (time) => {
        const now = new Date();
        return time.getTime() <= now.getTime();
    };

    // Check if user is admin
    const storedAdminCredentials = JSON.parse(localStorage.getItem('adminCredentials'));
    const isAdmin = (storedAdminCredentials && storedAdminCredentials.email === "admin@example.com" && storedAdminCredentials.password === "adminpassword");

    console.log("Is Admin:", isAdmin);

    return (
        <>
            {isAdmin ? <Layout searchQuery={searchQuery} setSearchQuery={setSearchQuery} /> : <UserNavbar />}
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
                                    timeIntervals={1} // Allows selecting every minute
                                    timeFormat="HH:mm"
                                    dateFormat="yyyy-MM-dd HH:mm"
                                    className='date-picker-input'
                                    onClickOutside={() => setDatePickerOpen(true)}
                                    maxDate={maxDate} // Restrict future dates and times
                                    filterTime={filterFutureTimes} // Restrict future times
                                    yearDropdownItemNumber={15} // Number of years to show in dropdown
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
                            timeIntervals={1} // Allows selecting every minute
                            timeFormat="HH:mm"
                            dateFormat="yyyy-MM-dd HH:mm"
                            className='date-picker-input'
                            maxDate={maxDate} // Restrict future dates and times
                            filterTime={filterFutureTimes} // Restrict future times
                        />
                    </div>
                    <div className="date-picker">
                        <label>To:</label>
                        <DatePicker
                            selected={endDate}
                            onChange={handleEndDateChange}
                            showTimeSelect
                            timeIntervals={1} // Allows selecting every minute
                            timeFormat="HH:mm"
                            dateFormat="yyyy-MM-dd HH:mm"
                            className='date-picker-input'
                            maxDate={maxDate} // Restrict future dates and times
                            filterTime={filterFutureTimes} // Restrict future times
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
