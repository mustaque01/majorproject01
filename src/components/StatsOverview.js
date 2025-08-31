import React from 'react';

const StatsOverview = () => {
  const stats = [
    {
      title: 'Total Learning Paths',
      value: '12',
      icon: 'fas fa-map',
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-600'
    },
    {
      title: 'Completed Skills',
      value: '8',
      icon: 'fas fa-check-circle',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      title: 'Total Hours',
      value: '42.5',
      icon: 'fas fa-clock',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      title: 'Resources',
      value: '36',
      icon: 'fas fa-book',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    }
  ];

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
