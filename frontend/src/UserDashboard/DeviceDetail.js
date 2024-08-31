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
const backendURL= "https://greenverse.onrender.com";

const DeviceDetailPage = () => {
    const [downloadStartDate, setDownloadStartDate] = useState(new Date());
    const [downloadEndDate, setDownloadEndDate] = useState(new Date());

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
        const fetchParameterOptions = async () => {
            try {
                const response = await fetch(`${backendURL}/api/device-parameters/${deviceName}`);
                const result = await response.json();

                if (Array.isArray(result)) {
                    setParameterOptions(result);
                } else {
                    setParameterOptions([]);
                }
            } catch (error) {
                console.error('Error fetching parameter options:', error);
                setParameterOptions([]);
            }
        };

        fetchParameterOptions();
    }, []);

    useEffect(() => {
        const fetchLiveData = async () => {
            try {
                let fetchDateTime = latestDateTime;

                if (isFiltered) {
                    fetchDateTime = dayjs(calendarDate).format('YYYY-MM-DD HH:mm:ss');
                }

                const response = await fetch(`${backendURL}/api/device-data-by-datetime/${deviceName}/${fetchDateTime}`);
                const result = await response.json();

                if (result.length > 0) {
                    const data = result[0];
                    let parameters = {};

                    if (data.parameters && typeof data.parameters === 'object') {
                        parameters = data.parameters;
                    } else {
                        parameters = Object.fromEntries(
                            Object.entries(data).filter(([key]) => !['_id', 'id', 'dateTime', 'dataType'].includes(key))
                        );
                    }

                    setLiveData({ ...data, parameters });
                } else {
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

    useEffect(() => {
        const savedStartDate = localStorage.getItem('startDate');
        const savedEndDate = localStorage.getItem('endDate');

        if (savedStartDate) {
            setStartDate(new Date(savedStartDate));
        }
        if (savedEndDate) {
            setEndDate(new Date(savedEndDate));
        }
    }, []);

    const handleDateSelection = async (date) => {
        setCalendarDate(date);
        setIsFiltered(true);
        setFetching(true);
        try {
            const fetchDateTime = dayjs(date).format('YYYY-MM-DD HH:mm:ss');
            const response = await fetch(`${backendURL}/api/device-data-by-datetime/${deviceName}/${fetchDateTime}`);
            const result = await response.json();

            if (result.length > 0) {
                const data = result[0];

                if (data.parameters && typeof data.parameters === 'object') {
                    setParameterOptions(Object.keys(data.parameters));
                    setLiveData(data);
                } else {
                    setParameterOptions([]);
                    setLiveData(null);
                }
            } else {
                setParameterOptions([]);
                setLiveData(null);
            }
        } catch (error) {
            console.error('Error fetching data for selected date:', error);
            setError('Error fetching data for selected date');
        } finally {
            setFetching(false);
        }
    };

    const handleIconClick = () => {
        setCalendarDate(dayjs().toDate());
        setDatePickerOpen(true);
        setIsFiltered(false);
        setFetching(true);
    };

    const handleStartDateChange = (date) => {
        setStartDate(date);
        localStorage.setItem('startDate', date);
        if (date > endDate) {
            setEndDate(date);
            localStorage.setItem('endDate', date);
        }
    };

    const handleEndDateChange = (date) => {
        setEndDate(date);
        localStorage.setItem('endDate', date)
        if (date < startDate) {
            setStartDate(date);
            localStorage.setItem('startDate', date)
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
                    deviceName: deviceName
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
            const response = await fetch(`${backendURL}/api/download-device-data/${deviceName}?startDate=${dayjs(downloadStartDate).format('YYYY-MM-DD HH:mm:ss')}&endDate=${dayjs(downloadEndDate).format('YYYY-MM-DD HH:mm:ss')}`);
            const data = await response.json();

            const aggregatedData = data.filter(item => item.dataType === 'aggregated');

            const excelData = aggregatedData.map(item => {
                const { _id, parameters, dataType, dateTime, ...rest } = item;  // Exclude _id
                const formattedDateTime = dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss'); // Format datetime

                // Flatten parameters object
                const flattenedParameters = parameters ? Object.keys(parameters).reduce((acc, key) => {
                    acc[key] = parameters[key];
                    return acc;
                }, {}) : {};

                return {
                    dateTime: formattedDateTime,
                    ...rest,
                    ...flattenedParameters 
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(excelData);
            worksheet['!cols'] = [{ wch: 20 },
            { wch: 20 }];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Aggregated Data');

            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

            saveAs(blob, `${deviceName}_aggregated_data_${dayjs(downloadStartDate).format('YYYY-MM-DD')}_${dayjs(downloadEndDate).format('YYYY-MM-DD')}.xlsx`);
        } catch (error) {
            console.error('Error downloading data:', error);
            setError('Error downloading data');
        }
    };

    const [maxDate, setMaxDate] = useState(new Date());
    const token = localStorage.getItem('token');
    // const storedAdminCredentials = JSON.parse(localStorage.getItem('adminCredentials'));
    const isAdmin = token ? JSON.parse(atob(token.split('.')[1])).role === 'admin' : false;

    return (
        <>
            {isAdmin ? <Layout /> : <UserNavbar searchDisabled={true} />}
            <div className="device-detail-page">
                <div className="table-section">
                    <div className="calendar-icon-container">
                        <div className="date-pickers">
                            <span className="device-name-title">{deviceName}</span> {/* Add this line */}
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
                                    className='date-picker-input new-date-picker-input'
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
                            {liveData && Object.entries(liveData.parameters || {}).length > 0 ? (
                                Object.entries(liveData.parameters).map(([key, value]) => (
                                    <tr key={key}>
                                        <td>{key}</td>
                                        <td>{value}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="2" style={{ textAlign: 'center' }}>
                                        No live data available currently.
                                    </td>
                                </tr>
                            )}
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
                            className='select-option'
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