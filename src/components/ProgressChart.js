import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const ProgressChart = () => {
  const data = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
    datasets: [{
      label: 'Progress Over Time',
      data: [10, 20, 30, 40, 70],
      backgroundColor: 'rgba(79, 70, 229, 0.2)',
      borderColor: 'rgba(79, 70, 229, 1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: '#f3f4f6'
        }
      },
      x: {
        grid: {
          color: '#f3f4f6'
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Learning Progress</h3>
        <select className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>Last 90 Days</option>
        </select>
      </div>
      <div className="h-64">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default ProgressChart;
