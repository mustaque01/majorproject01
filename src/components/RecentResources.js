import React from 'react';

const RecentResources = () => {
  const resources = [
    {
      title: 'React Hooks Guide',
      type: 'PDF • 2.4 MB',
      addedDate: '2 days ago',
      readTime: '15 min read',
      progress: 75,
      icon: 'fas fa-file-pdf',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      progressColor: 'bg-blue-500'
    },
    {
      title: 'State Management',
      type: 'Video • 18:32',
      addedDate: '1 week ago',
      readTime: '18 min watch',
      progress: 100,
      icon: 'fas fa-video',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      progressColor: 'bg-purple-500'
    },
    {
      title: 'Context API Docs',
      type: 'External Link',
      addedDate: '3 days ago',
      readTime: '10 min read',
      progress: 30,
      icon: 'fas fa-link',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      progressColor: 'bg-blue-500'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 lg:col-span-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Recent Resources</h3>
        <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
          View All
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource, index) => (
          <div key={index} className="resource-card bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition duration-300">
            <div className="p-4">
              <div className="flex items-center mb-3">
                <div className={`p-2 rounded-md ${resource.iconBg} ${resource.iconColor} mr-3`}>
                  <i className={resource.icon}></i>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">{resource.title}</h4>
                  <p className="text-xs text-gray-500">{resource.type}</p>
                </div>
              </div>
              
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Added: {resource.addedDate}</span>
                <span>{resource.readTime}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2">
                  <div 
                    className={`${resource.progressColor} h-1.5 rounded-full`} 
                    style={{width: `${resource.progress}%`}}
                  ></div>
                </div>
                <span className="text-xs font-medium text-gray-700">
                  {resource.progress === 100 ? 'Completed' : `${resource.progress}%`}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentResources;
