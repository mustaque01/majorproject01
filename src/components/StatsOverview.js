import React, { useState, useEffect } from 'react';
import ApiService from '../services/ApiService';

const StatsOverview = () => {
  const [stats, setStats] = useState([
    {
      title: 'Total Learning Paths',
      value: '0',
      icon: 'fas fa-map',
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-600'
    },
    {
      title: 'Completed Skills',
      value: '0',
      icon: 'fas fa-check-circle',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      title: 'Total Hours',
      value: '0',
      icon: 'fas fa-clock',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      title: 'Resources',
      value: '0',
      icon: 'fas fa-book',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getDashboardStats();
        
        if (response.success) {
          const data = response.data;
          setStats([
            {
              title: 'Total Learning Paths',
              value: data.totalLearningPaths.toString(),
              icon: 'fas fa-map',
              bgColor: 'bg-indigo-100',
              textColor: 'text-indigo-600'
            },
            {
              title: 'Completed Skills',
              value: data.completedSkills.toString(),
              icon: 'fas fa-check-circle',
              bgColor: 'bg-green-100',
              textColor: 'text-green-600'
            },
            {
              title: 'Total Hours',
              value: data.totalHours,
              icon: 'fas fa-clock',
              bgColor: 'bg-blue-100',
              textColor: 'text-blue-600'
            },
            {
              title: 'Resources',
              value: data.resources.toString(),
              icon: 'fas fa-book',
              bgColor: 'bg-purple-100',
              textColor: 'text-purple-600'
            }
          ]);
        }
      } catch (err) {
        setError('Failed to fetch dashboard statistics');
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="p-3 rounded-full bg-gray-200 w-12 h-12"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="col-span-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <p className="text-2xl font-semibold text-gray-800">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-full ${stat.bgColor} ${stat.textColor}`}>
              <i className={`${stat.icon} text-xl`}></i>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;
