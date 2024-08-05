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
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [liveData, setLiveData] = useState(null);
    const [parameterOptions, setParameterOptions] = useState([]);
    const [datePickerOpen, setDatePickerOpen] = useState(true);
    const [error, setError] = useState('');
    const [fetching, setFetching] = useState(true);
    const [latestDateTime, setLatestDateTime] = useState(dayjs().format('YYYY-MM-DD HH:mm:ss'));
    const [isFiltered, setIsFiltered] = useState(false);

    useEffect(() => {
        const fetchLiveData = async () => {
            try {
                let fetchDateTime = latestDateTime;

                if (isFiltered) {
                    fetchDateTime = dayjs(calendarDate).format('YYYY-MM-DD HH:mm:ss');
                }

                const response = await fetch(`http://localhost:5000/api/device-data-by-datetime/${deviceName}/${fetchDateTime}`);
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
                setError('Error fetching live data');
            }
        };

        if (fetching) {
            fetchLiveData();
        }

        const intervalId = setInterval(() => {
            if (!isFiltered && fetching) {
                const newDateTime = dayjs().subtract(1, 'second').format('YYYY-MM-DD HH:mm:ss');
                setLatestDateTime(newDateTime);
            }
        }, 2000);

        return () => clearInterval(intervalId);
    }, [deviceName, latestDateTime, fetching, calendarDate, isFiltered]);

    useEffect(() => {
        const interval = setInterval(() => {
            setMaxDate(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleDateSelection = (date) => {
        setCalendarDate(date);
        setIsFiltered(true);
        setFetching(true);
    };

    const handleIconClick = () => {
        setCalendarDate(dayjs().toDate());
        setDatePickerOpen(true);
        setIsFiltered(false);
        setFetching(true);
    };

    const filterFutureTimes = (time) => {
        const now = new Date();
        return time.getTime() <= now.getTime();
    };

    const [maxDate, setMaxDate] = useState(new Date());
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
                        <label>Select Date and Time:</label>
                        <DatePicker
                            selected={calendarDate}
                            onChange={handleDateSelection}
                            showTimeSelect
                            timeIntervals={1}
                            timeFormat="HH:mm"
                            dateFormat="yyyy-MM-dd HH:mm"
                            className='date-picker-input'
                            filterTime={filterFutureTimes}
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                </div>
            </div>
        </>
    );
};

export default DeviceDetailPage;
