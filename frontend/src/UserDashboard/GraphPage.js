import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import dayjs from 'dayjs';
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    TimeScale,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { FaChevronDown } from 'react-icons/fa';
import './GraphPage.css';
import UserNavbar from '../UserNavbar';
import Layout from '../Layout';
import { LineChart } from '@mui/x-charts/LineChart';

ChartJS.register(
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    TimeScale,
    Title,
    Tooltip,
    Legend
);

const GraphPage = () => {
    const location = useLocation();
    const { startDate, endDate, parameter, deviceName } = location.state;
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: parameter,
                data: [],
                borderColor: 'rgba(75,192,192,1)',
                fill: false
            }
        ]
    });
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // const storedAdminCredentials = JSON.parse(localStorage.getItem('adminCredentials'));
    const token = localStorage.getItem('token');
    const isAdmin = token ? JSON.parse(atob(token.split('.')[1])).role === 'admin' : false;


    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/admin/users', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                setUsers(data);
                setFilteredUsers(data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            setFilteredUsers(
                users.filter(user =>
                    user.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        } else {
            setFilteredUsers(users);
        }
    }, [searchQuery, users]);

    const fetchData = async () => {
        try {
            const formattedStartDate = dayjs(startDate).format('YYYY-MM-DD HH:mm:ss');
            const formattedEndDate = dayjs(endDate).format('YYYY-MM-DD HH:mm:ss');

            const response = await fetch(`http://localhost:5000/api/device-data-by-daterange/${deviceName}?startDate=${formattedStartDate}&endDate=${formattedEndDate}&parameter=${parameter}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('Fetched data:', data);

            if (!Array.isArray(data)) {
                console.warn('Data is not in expected format');
                setChartData({
                    labels: [],
                    datasets: [
                        {
                            label: parameter,
                            data: [],
                            borderColor: 'rgba(75,192,192,1)',
                            fill: false
                        }
                    ]
                });
                return;
            }

            if (data.length === 0) {
                console.warn('No data available for the selected date range.');
                setChartData({
                    labels: [],
                    datasets: [
                        {
                            label: parameter,
                            data: [],
                            borderColor: 'rgba(75,192,192,1)',
                            fill: false
                        }
                    ]
                });
                return;
            }

            const labels = data.map(entry => dayjs(entry.dateTime, 'YYYY-MM-DD HH:mm:ss').valueOf());
            const values = data.map(entry =>
                typeof entry.parameters === 'object' && entry.parameters !== null
                    ? entry.parameters[parameter]
                    : entry[parameter]
            );

            setChartData({
                labels: labels,
                datasets: [
                    {
                        label: parameter,
                        data: values,
                        borderColor: 'rgba(75,192,192,1)',
                        fill: false
                    }
                ]
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            setChartData({
                labels: [],
                datasets: [
                    {
                        label: parameter,
                        data: [],
                        borderColor: 'rgba(75,192,192,1)',
                        fill: false
                    }
                ]
            });
        }
    };

    useEffect(() => {
        fetchData();
    }, [startDate, endDate, parameter, deviceName]);

    const getTicks = () => {
        const duration = dayjs(endDate).diff(dayjs(startDate), 'day');
        if (duration <= 1) {
            return { unit: 'minute', stepSize: 10 };
        } else if (duration <= 7) {
            return { unit: 'hour', stepSize: 1 };
        } else if (duration <= 10) {
            return { unit: 'day', stepSize: 1 };
        } else if (duration <= 30) {
            return { unit: 'day', stepSize: 1 };
        } else {
            return { unit: 'week', stepSize: 1 };
        }
    };

    const { unit, stepSize } = getTicks();
    const formatTick = (tick) => {
        return dayjs(tick).format(getTicks() === 'minute' ? 'DD-MM-YYYY HH:mm' : 'DD-MM-YYYY');
    };

    const handleDownload = (type) => {
        switch (type) {
            case 'PNG':
                handleDownloadPNG();
                break;
            case 'PDF':
                handleDownloadPDF();
                break;
            case 'Excel':
                handleDownloadExcel();
                break;
            default:
                break;
        }
    };

    const handleDownloadPNG = () => {
        const canvas = document.querySelector('canvas');
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imgData;
        link.download = 'chart.png';
        link.click();
    };

    const handleDownloadPDF = () => {
        const canvas = document.querySelector('canvas');
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        pdf.addImage(imgData, 'PNG', 10, 10, 180, 160);
        pdf.save('chart.pdf');
    };

    const handleDownloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(chartData.datasets[0].data.map((value, index) => ({
            Date: dayjs(chartData.labels[index]).format('YYYY-MM-DD HH:mm:ss'),
            Parameter: parameter,
            Value: value
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        saveAs(blob, 'chart.xlsx');
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <>
            {isAdmin ? <Layout searchQuery={searchQuery} setSearchQuery={setSearchQuery} /> : <UserNavbar searchDisabled={true} />}
            <div className="graph-page-wrapper">
                <div className="chart-section">
                    <div className="dropdown-container" ref={dropdownRef}>
                        <button className="dropdown-button" onClick={toggleDropdown}>
                            Download <FaChevronDown className={`dropdown-icon ${dropdownOpen ? 'open' : ''}`} />
                        </button>
                        <div className={`dropdown-menu ${dropdownOpen ? 'show' : ''}`}>
                            <button onClick={() => handleDownload('PNG')} className="dropdown-item">PNG</button>
                            <button onClick={() => handleDownload('PDF')} className="dropdown-item">PDF</button>
                            <button onClick={() => handleDownload('Excel')} className="dropdown-item">Excel</button>
                        </div>
                    </div>
                    <LineChart
    xAxis={[
        {
            scaleType: 'time',
            data: chartData.labels,
            label: 'Date', // X-axis title
            valueFormatter: (value) => {
                const duration = dayjs(endDate).diff(dayjs(startDate), 'day');
                return duration <= 10
                    ? dayjs(value).format('DD-MM-YYYY HH:mm')
                    : dayjs(value).format('DD-MM-YYYY HH:mm');
            },
            min: dayjs(startDate).valueOf(),
            max: dayjs(endDate).valueOf(),
        },
    ]}
    series={[
        {
            data: chartData.datasets[0].data,
            label: parameter,
        },
    ]}
    yAxis={[
        {
            label: parameter, // Y-axis title
        },
    ]}
    tooltip={{
        valueFormatter: (value, index) => {
            return `${value}`; // Shows only the value
        },
        showCursor: false,
    }}
    showCursor={false} 
    height={400} // Adjust the height as needed
/>

                </div>
            </div>
        </>
    );
};

export default GraphPage;
