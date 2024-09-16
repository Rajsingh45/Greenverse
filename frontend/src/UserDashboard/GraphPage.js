import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import 'chartjs-adapter-date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { FaChevronDown } from 'react-icons/fa';
import './GraphPage.css';
import UserNavbar from '../UserNavbar';
import Layout from '../Layout';
import CanvasJSReact from '@canvasjs/react-charts';
const backendURL=process.env.REACT_APP_BACKEND_URL;

const GraphPage = () => {
    const location = useLocation();
    const { startDate, endDate, parameter, deviceName } = location.state;
    const [noData, setNoData] = useState(false);

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

    const token = localStorage.getItem('token');
    const isAdmin = token ? JSON.parse(atob(token.split('.')[1])).role === 'admin' : false;

    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);

    const options = {
        zoomEnabled: true,
        animationEnabled: true,
        title: {
            text: parameter,
            margin: 20
        },
        axisX: {
            title: "Date and Time",
            titleFontWeight: "bold",
            titleFontSize: 22,
            minimum: new Date(startDate),
            maximum: new Date(endDate),
            valueFormatString: "DD MMM YYYY HH:mm",
            labelAngle: 0,
        },
        axisY: {
            title: "Value",
            titleFontWeight: "bold",
            titleFontSize: 22,
            includeZero: false
        },
        toolTip: {
            contentFormatter: function (e) {
                const date = new Date(e.entries[0].dataPoint.x);
                const formattedDate = `${String(date.getDate()).padStart(2, '0')} ${date.toLocaleString('en-US', { month: 'short' })} ${date.getFullYear()}`;
                const formattedTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                return `${formattedDate} ${formattedTime} <br> ${e.entries[0].dataSeries.name}: ${e.entries[0].dataPoint.y}`;
            }
        },
        data: [
            {
                type: "line",
                dataPoints: chartData.labels.map((label, index) => ({
                    x: new Date(label),
                    y: chartData.datasets[0].data[index]
                })),
                name: parameter
            }
        ]
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${backendURL}/admin/users`, {
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

            const response = await fetch(`${backendURL}/api/device-data-by-daterange/${deviceName}?startDate=${formattedStartDate}&endDate=${formattedEndDate}&parameter=${parameter}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            if (!Array.isArray(data) || data.length === 0) {
                setNoData(true);
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

            setNoData(false);
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
            setNoData(true);
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
        const chartElement = document.getElementById('chart-container');

        if (!chartElement) {
            console.error('Chart element not found');
            return;
        }

        html2canvas(chartElement, { useCORS: true }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = imgData;
            link.download = 'chart.png';
            link.click();
        }).catch((error) => {
            console.error('Error generating PNG:', error);
        });
    };

    const handleDownloadPDF = () => {
        const chartElement = document.getElementById('chart-container');

        if (!chartElement) {
            console.error('Chart element not found');
            return;
        }

        html2canvas(chartElement).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF();
            pdf.addImage(imgData, 'PNG', 10, 10, 180, 160);
            pdf.save('chart.pdf');
        }).catch((error) => {
            console.error('Error generating PDF:', error);
        });
    };

    const handleDownloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(chartData.labels.map((label, index) => ({
            Date: dayjs(label).format('YYYY-MM-DD HH:mm:ss'),
            Parameter: parameter,
            Value: chartData.datasets[0].data[index]
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
                    <div className="important-note">
                        <p>Important: Ensure you have selected the correct date range before generating the report.</p>
                    </div>
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
                    <div id="chart-container">
                        {noData ? (
                        <div className="no-data-message">
                            <p>No data available for the selected date range.</p>
                        </div>
                    ) : (
                        <CanvasJSReact.CanvasJSChart options={options} />
                    )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default GraphPage;
