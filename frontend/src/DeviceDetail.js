import React, { useState } from 'react';
import './DeviceDetail.css';
import { useParams } from 'react-router-dom';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/en-gb';

const DeviceDetailPage = () => {
    const { deviceId } = useParams();
    const [startDate, setStartDate] = useState(dayjs());
    const [endDate, setEndDate] = useState(dayjs());
    const [selectedOption, setSelectedOption] = useState('');

    const column1Data = ['Data 1', 'Data 3', 'Data 3', 'Data 3', 'Data 3'];

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
                            onChange={(newValue) => setStartDate(newValue)}
                            format="DD/MM/YYYY"
                        />
                    </LocalizationProvider>
                </div>
                <div className="date-picker">
                    <label>To:</label>
                    <LocalizationProvider dateAdapter={AdapterDayjs} locale="en-gb">
                        <DatePicker
                            value={endDate}
                            onChange={(newValue) => setEndDate(newValue)}
                            format="DD/MM/YYYY"
                        />
                    </LocalizationProvider>
                </div>
                <div className="dropdown-section">
                    <label>Select Column 1 Value:</label>
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
            </div>
        </div>
    );
};

export default DeviceDetailPage;
