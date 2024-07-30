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
import 'chartjs-adapter-date-fns'; // Import date-fns adapter
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { FaChevronDown } from 'react-icons/fa';
import './GraphPage.css';
import UserNavbar from './UserNavbar'
import Layout from './Layout';

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
    const { startDate, endDate, parameter } = location.state;
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Air Quality Index',
                data: [],
                borderColor: 'rgba(75,192,192,1)',
                fill: false
            }
        ]
    });
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const storedAdminCredentials = JSON.parse(localStorage.getItem('adminCredentials'));
    const isAdmin = (storedAdminCredentials && storedAdminCredentials.email === "admin@example.com" && storedAdminCredentials.password === "adminpassword");
    console.log("Is Admin:", isAdmin);

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
            const response = await fetch(`http://localhost:5000/aqi/data?startDate=${startDate}&endDate=${endDate}&parameter=${parameter}`, {
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
                            label: 'Air Quality Index',
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
                            label: 'Air Quality Index',
                            data: [],
                            borderColor: 'rgba(75,192,192,1)',
                            fill: false
                        }
                    ]
                });
                return;
            }

            const dates = data.map(entry => dayjs(entry.date).format('YYYY-MM-DDTHH:mm:ss'));
            const values = data.map(entry => entry.value);

            setChartData({
                labels: dates,
                datasets: [
                    {
                        label: 'Air Quality Index',
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
                        label: 'Air Quality Index',
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
    }, [startDate, endDate, parameter]);

    const getTicks = () => {
        const duration = dayjs(endDate).diff(dayjs(startDate), 'day');
        return duration <= 7 ? 'minute' : 'day';
    };

    const formatTick = (tick) => {
        const date = dayjs(tick).format('DD-MM-YYYY');
        const time = dayjs(tick).format('HH:mm');
        return `${date}\n${time}`;
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
            case 'Word':
                handleDownloadWord();
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
            Date: chartData.labels[index],
            Value: value
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        saveAs(blob, 'chart.xlsx');
    };

    const handleDownloadWord = () => {
        const doc = new jsPDF();
        doc.text('Air Quality Index Data', 10, 10);
        chartData.labels.forEach((label, index) => {
            doc.text(`${label}: ${chartData.datasets[0].data[index]}`, 10, 20 + index * 10);
        });
        doc.save('chart.doc');
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
        {isAdmin ? <Layout searchQuery={searchQuery} setSearchQuery={setSearchQuery} /> : <UserNavbar />}
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
                        <button onClick={() => handleDownload('Word')} className="dropdown-item">Word</button>
                    </div>
                </div>
                <div className="chart-container">
                    <Line
                        data={chartData}
                        options={{
                            scales: {
                                x: {
                                    type: 'time',
                                    time: {
                                        unit: getTicks(),
                                        tooltipFormat: 'dd-MM-yyyy HH:mm',
                                        displayFormats: {
                                            minute: 'dd-MM-yyyy HH:mm',
                                            day: 'dd-MM-yyyy'
                                        }
                                    },
                                    title: {
                                        display: true,
                                        text: 'Date and Time'
                                    },
                                    ticks: {
                                        callback: formatTick,
                                        maxTicksLimit: 10,
                                        autoSkip: true,
                                        maxRotation: 0,
                                        minRotation: 0
                                    },
                                    grid: {
                                        display: true,
                                        drawBorder: false
                                    }
                                },
                                y: {
                                    title: {
                                        display: true,
                                        text: 'AQI Value'
                                    }
                                }
                            }
                        }}
                    />
                </div>
            </div>
        </div>
        </>
    );
};

export default GraphPage;
