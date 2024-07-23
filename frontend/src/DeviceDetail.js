import React, { useState } from 'react';
import './DeviceDetail.css';
import { useParams, useNavigate } from 'react-router-dom';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/en-gb';

const DeviceDetailPage = () => {
    const { deviceId } = useParams();
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState(dayjs());
    const [endDate, setEndDate] = useState(dayjs());
    const [selectedOption, setSelectedOption] = useState('');
    const [error, setError] = useState('');

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
                    startDate: startDate.format('YYYY-MM-DD'),
                    endDate: endDate.format('YYYY-MM-DD'),
                    parameter:selectedOption
                }
            });
        }
    };

    return (
        <div className="device-detail-page">
            <div className="table-section">
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
                                <td>Data {index * 2 + 2}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="filter-section">
                <h3>Filter by Date</h3>
                <div className="date-picker">
                    <label>From:</label>
                    <LocalizationProvider dateAdapter={AdapterDayjs} locale="en-gb">
                        <DatePicker
                            value={startDate}
                            onChange={handleStartDateChange}
                            format="DD-MM-YYYY"
                        />
                    </LocalizationProvider>
                </div>
                <div className="date-picker">
                    <label>To:</label>
                    <LocalizationProvider dateAdapter={AdapterDayjs} locale="en-gb">
                        <DatePicker
                            value={endDate}
                            onChange={handleEndDateChange}
                            format="DD-MM-YYYY"
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
    );
};

export default DeviceDetailPage;
