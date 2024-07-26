import React, { useState, useEffect } from 'react';
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
import './GraphPage.css'

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

    return (
        <div className="chart-section">
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
    );
};

export default GraphPage;
