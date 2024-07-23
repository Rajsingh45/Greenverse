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
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

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

    const chartRef = useRef(null);

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

            const dates = data.map(entry => dayjs(entry.date).format('DD-MMM-YYYY'));
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
        return () => {
            // Destroy the chart instance on component unmount
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [startDate, endDate]);

    return (
        <div className="chart-section">
            <Line ref={chartRef} data={chartData} />
        </div>
    );
};

export default GraphPage;
