import React from 'react';

const Sidebar = () => {
  return (
    <div className="sidebar bg-white w-64 flex-shrink-0 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-indigo-600 flex items-center">
          <i className="fas fa-graduation-cap mr-2"></i>
          LearnPath
        </h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-xs uppercase font-semibold text-gray-500 mb-2">Main</h2>
          <ul>
            <li className="mb-1">
              <button className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md bg-indigo-50 text-indigo-700 text-left">
                <i className="fas fa-tachometer-alt mr-3 text-indigo-500"></i>
                Dashboard
              </button>
            </li>
            <li className="mb-1">
              <button className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 text-left">
                <i className="fas fa-book-open mr-3 text-gray-500"></i>
                My Learning Paths
              </button>
            </li>
            <li className="mb-1">
              <button className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 text-left">
                <i className="fas fa-chart-line mr-3 text-gray-500"></i>
                Progress Analytics
              </button>
            </li>
          </ul>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <h2 className="text-xs uppercase font-semibold text-gray-500 mb-2">Resources</h2>
          <ul>
            <li className="mb-1">
              <button className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 text-left">
                <i className="fas fa-file-pdf mr-3 text-red-500"></i>
                PDF Documents
              </button>
            </li>
            <li className="mb-1">
              <button className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 text-left">
                <i className="fas fa-video mr-3 text-purple-500"></i>
                Video Lectures
              </button>
            </li>
            <li className="mb-1">
              <button className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 text-left">
                <i className="fas fa-link mr-3 text-blue-500"></i>
                External Links
              </button>
            </li>
          </ul>
        </div>
        
        <div className="p-4 border-t border-gray-200 mt-auto">
          <div className="flex items-center">
            <img 
              className="h-8 w-8 rounded-full" 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
              alt="User Avatar"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Alakh Panday</p>
              <p className="text-xs text-gray-500">Instructor</p>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
