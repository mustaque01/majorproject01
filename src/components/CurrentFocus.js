import React from 'react';

const CurrentFocus = () => {
  const progressItems = [
    {
      title: 'Reading Time',
      progress: '3.2/5 hours',
      percentage: 64,
      color: 'bg-blue-500'
    },
    {
      title: 'Video Completion',
      progress: '2/4 videos',
      percentage: 50,
      color: 'bg-purple-500'
    },
    {
      title: 'Exercises',
      progress: '5/8 completed',
      percentage: 62.5,
      color: 'bg-green-500'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Focus</h3>
      
      <div className="flex items-center mb-6">
        <div className="relative w-16 h-16 mr-4">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="none" stroke="#e6e6e6" strokeWidth="2"></circle>
            <circle 
              cx="18" 
              cy="18" 
              r="16" 
              fill="none" 
              stroke="#4f46e5" 
              strokeWidth="2" 
              strokeDasharray="100" 
              strokeDashoffset="30" 
              className="progress-ring__circle"
            ></circle>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-indigo-600">70%</span>
          </div>
        </div>
        <div>
          <h4 className="font-medium text-gray-800">Advanced React Patterns</h4>
          <p className="text-sm text-gray-500">5 resources remaining</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {progressItems.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">{item.title}</span>
              <span className="text-gray-500">{item.progress}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`${item.color} h-2 rounded-full`} 
                style={{width: `${item.percentage}%`}}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurrentFocus;
