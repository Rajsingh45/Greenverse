import React, { useState, useEffect } from 'react';
import './DeviceDetail.css';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import 'dayjs/locale/en-gb';
import UserNavbar from '../UserNavbar';
import Layout from '../Layout';
import IconButton from '@mui/material/IconButton';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


const DeviceDetailPage = () => {
    const [downloadStartDate, setDownloadStartDate] = useState(new Date());
const [downloadEndDate, setDownloadEndDate] = useState(new Date());
const [downloadParameter, setDownloadParameter] = useState('');

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
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [selectedOption, setSelectedOption] = useState('');

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
        }, 1000);

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
                    parameter: selectedOption,
                    deviceName:deviceName
                }
            });
        }
    };

    const filterFutureTimes = (time) => {
        const now = new Date();
        return time.getTime() <= now.getTime();
    };

    const handleDownload = async () => {
        if (!downloadStartDate || !downloadEndDate) {
            setError('Both start and end dates must be filled.');
            return;
        }
    
        setError('');
    
        try {
            const response = await fetch(`http://localhost:5000/api/download-device-data/${deviceName}?startDate=${dayjs(downloadStartDate).format('YYYY-MM-DD HH:mm:ss')}&endDate=${dayjs(downloadEndDate).format('YYYY-MM-DD HH:mm:ss')}`);
            const data = await response.json();
    
            const csvContent = [
                "dateTime," + Object.keys(data[0] || {}).filter(key => key !== 'dateTime').join(','),
                ...data.map(row => {
                    return [
                        row.dateTime,
                        ...Object.keys(row).filter(key => key !== 'dateTime').map(key => row[key])
                    ].join(',');
                })
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, `${deviceName}_data_${dayjs(downloadStartDate).format('YYYY-MM-DD')}_${dayjs(downloadEndDate).format('YYYY-MM-DD')}.csv`);
        } catch (error) {
            console.error('Error downloading data:', error);
            setError('Error downloading data');
        }
    };
    
    

    const [maxDate, setMaxDate] = useState(new Date());
    const storedAdminCredentials = JSON.parse(localStorage.getItem('adminCredentials'));
    const isAdmin = (storedAdminCredentials && storedAdminCredentials.email === "admin@example.com" && storedAdminCredentials.password === "adminpassword");

    return (
        <>
            {isAdmin ? <Layout /> : <UserNavbar searchDisabled={true} />}
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
                    <div className="download-section">
    <h3>Download Data for All Parameters</h3>
    <div className="date-picker">
        <label>From:</label>
        <DatePicker
            selected={downloadStartDate}
            onChange={date => setDownloadStartDate(date)}
            showTimeSelect
            timeIntervals={1}
            timeFormat="HH:mm"
            dateFormat="yyyy-MM-dd HH:mm"
            className='date-picker-input'
            maxDate={new Date()}
        />
    </div>
    <div className="date-picker">
        <label>To:</label>
        <DatePicker
            selected={downloadEndDate}
            onChange={date => setDownloadEndDate(date)}
            showTimeSelect
            timeIntervals={1}
            timeFormat="HH:mm"
            dateFormat="yyyy-MM-dd HH:mm"
            className='date-picker-input'
            maxDate={new Date()}
        />
    </div>
    
    <button type="button" className="download-button" onClick={handleDownload}>
        Download Data
    </button>
</div>
                </div>
                

            </div>
        </>
    );
};

export default DeviceDetailPage;
