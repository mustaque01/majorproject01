import React, { useState } from 'react';

const Header = ({ searchQuery, setSearchQuery, isDarkMode, setIsDarkMode, user, onLogout }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifications = [
    { id: 1, text: "New course 'Advanced React' available", time: "2 min ago", type: "course" },
    { id: 2, text: "You completed 'JavaScript Fundamentals'", time: "1 hour ago", type: "achievement" },
    { id: 3, text: "Weekly progress report ready", time: "3 hours ago", type: "report" }
  ];

  return (
    <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white shadow-lg relative">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section - Logo & Title */}
        <div className="flex items-center space-x-4">
          <button className="mr-2 text-white focus:outline-none lg:hidden hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all">
            <i className="fas fa-bars"></i>
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <i className="fas fa-graduation-cap text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold">Learning Path</h1>
              <p className="text-sm text-indigo-100 hidden md:block">Master Your Skills</p>
            </div>
          </div>
        </div>

        {/* Center Section - Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-search text-indigo-200"></i>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-20 placeholder-indigo-200 text-white rounded-lg border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 backdrop-blur-sm transition-all duration-300"
              placeholder="Search courses, categories..."
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <i className="fas fa-times text-indigo-200 hover:text-white transition-colors"></i>
              </button>
            )}
          </div>
        </div>

        {/* Right Section - Actions & Profile */}
        <div className="flex items-center space-x-4">
          {/* Progress Indicator */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
            <div className="w-6 h-6 rounded-full border-2 border-white border-opacity-50 flex items-center justify-center">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <span className="text-sm">85% Goal</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-300 backdrop-blur-sm"
            >
              <i className="fas fa-bell text-lg"></i>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-xs rounded-full flex items-center justify-center font-bold animate-bounce">
                3
              </span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-200 transform transition-all duration-200 ease-out">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${
                          notification.type === 'course' ? 'bg-blue-100 text-blue-600' :
                          notification.type === 'achievement' ? 'bg-green-100 text-green-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          <i className={`fas ${
                            notification.type === 'course' ? 'fa-book' :
                            notification.type === 'achievement' ? 'fa-trophy' :
                            'fa-chart-line'
                          } text-sm`}></i>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">{notification.text}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-100">
                  <button className="w-full text-sm text-indigo-600 hover:text-indigo-800 transition-colors font-medium">
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-3 p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center font-bold text-sm">
                M
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">Mustaque</p>
                <p className="text-xs text-indigo-200">Premium</p>
              </div>
              <i className="fas fa-chevron-down text-xs"></i>
            </button>

            {/* Profile Dropdown */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-50 border border-gray-200 transform transition-all duration-200 ease-out">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center font-bold text-white text-lg">
                      {user?.firstName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{user?.firstName} {user?.lastName}</h3>
                      <p className="text-sm text-gray-600">{user?.email}</p>
                    </div>
                  </div>
                </div>
                <div className="py-2">
                  <button 
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                  >
                    <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} mr-3 text-gray-400`}></i>
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                  </button>
                  <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left">
                    <i className="fas fa-user mr-3 text-gray-400"></i>
                    My Profile
                  </button>
                  <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left">
                    <i className="fas fa-cog mr-3 text-gray-400"></i>
                    Settings
                  </button>
                  <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left">
                    <i className="fas fa-chart-line mr-3 text-gray-400"></i>
                    Progress Report
                  </button>
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button 
                      onClick={onLogout}
                      className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <i className="fas fa-sign-out-alt mr-3"></i>
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-white bg-opacity-20">
        <div className="h-full bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-1000 ease-out" style={{ width: '85%' }}></div>
      </div>
    </header>
  );
};

export default Header;
