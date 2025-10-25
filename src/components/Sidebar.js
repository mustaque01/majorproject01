import React from 'react';

const Sidebar = ({ user, activeView, setActiveView }) => {
  // Use activeView from props if provided, otherwise default to 'dashboard'
  const activeItem = activeView || 'dashboard';
  const setActiveItem = setActiveView || (() => {});

  // Define role-specific navigation items
  const getMainNavItems = () => {
    const commonItems = [
      { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard', color: 'indigo' }
    ];

    if (user?.role === 'instructor') {
      return [
        ...commonItems,
        { id: 'courses', icon: 'fas fa-chalkboard-teacher', label: 'My Courses', color: 'emerald' },
        { id: 'students', icon: 'fas fa-users', label: 'Students', color: 'blue' },
        { id: 'analytics', icon: 'fas fa-chart-line', label: 'Course Analytics', color: 'purple' },
        { id: 'content', icon: 'fas fa-book-open', label: 'Content Management', color: 'orange' }
      ];
    } else {
      return [
        ...commonItems,
        { id: 'learning-paths', icon: 'fas fa-route', label: 'My Learning Paths', color: 'emerald' },
        { id: 'progress', icon: 'fas fa-chart-line', label: 'Progress Analytics', color: 'blue' },
        { id: 'achievements', icon: 'fas fa-trophy', label: 'Achievements', color: 'yellow' }
      ];
    }
  };

  const getResourceItems = () => {
    if (user?.role === 'instructor') {
      return [
        { id: 'materials', icon: 'fas fa-folder-open', label: 'Course Materials', color: 'red' },
        { id: 'assignments', icon: 'fas fa-tasks', label: 'Assignments', color: 'purple' },
        { id: 'grading', icon: 'fas fa-clipboard-check', label: 'Grading', color: 'green' },
        { id: 'resources', icon: 'fas fa-link', label: 'Resources', color: 'blue' }
      ];
    } else {
      return [
        { id: 'pdf', icon: 'fas fa-file-pdf', label: 'PDF Documents', color: 'red' },
        { id: 'videos', icon: 'fas fa-video', label: 'Video Lectures', color: 'purple' },
        { id: 'links', icon: 'fas fa-link', label: 'External Links', color: 'blue' },
        { id: 'notes', icon: 'fas fa-sticky-note', label: 'My Notes', color: 'orange' }
      ];
    }
  };

  const mainNavItems = getMainNavItems();
  const resourceItems = getResourceItems();

  const getButtonClasses = (itemId, color) => {
    const baseClasses = "w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 text-left transform hover:scale-[1.02] group";
    
    if (activeItem === itemId) {
      return `${baseClasses} bg-gradient-to-r from-${color}-500 to-${color}-600 text-white shadow-lg shadow-${color}-500/30`;
    }
    
    return `${baseClasses} text-gray-600 hover:bg-gradient-to-r hover:from-${color}-50 hover:to-${color}-100 hover:text-${color}-700 hover:shadow-md`;
  };

  const getIconClasses = (itemId, color) => {
    const baseClasses = "mr-3 transition-all duration-200";
    
    if (activeItem === itemId) {
      return `${baseClasses} text-white`;
    }
    
    return `${baseClasses} text-${color}-500 group-hover:text-${color}-600`;
  };

  return (
    <div className="sidebar bg-gradient-to-b from-white to-gray-50 w-64 flex-shrink-0 border-r border-gray-200 flex flex-col shadow-xl">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-xl">
            <i className="fas fa-graduation-cap text-white text-xl"></i>
          </div>
          <div className="ml-3">
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              LearnPath
            </h1>
            <p className="text-xs text-gray-500">Learning Management</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Main Navigation */}
        <div>
          <h2 className="text-xs uppercase font-semibold text-gray-400 mb-4 tracking-wider">Main Menu</h2>
          <ul className="space-y-2">
            {mainNavItems.map((item) => (
              <li key={item.id}>
                <button 
                  onClick={() => setActiveItem(item.id)}
                  className={getButtonClasses(item.id, item.color)}
                >
                  <i className={`${item.icon} ${getIconClasses(item.id, item.color)}`}></i>
                  {item.label}
                  {activeItem === item.id && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Resources Section */}
        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-xs uppercase font-semibold text-gray-400 mb-4 tracking-wider">Resources</h2>
          <ul className="space-y-2">
            {resourceItems.map((item) => (
              <li key={item.id}>
                <button 
                  onClick={() => setActiveItem(item.id)}
                  className={getButtonClasses(item.id, item.color)}
                >
                  <i className={`${item.icon} ${getIconClasses(item.id, item.color)}`}></i>
                  {item.label}
                  {activeItem === item.id && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Progress Card */}
        <div className="mt-auto">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white">
            <div className="flex items-center mb-3">
              <i className="fas fa-chart-bar text-lg"></i>
              <span className="ml-2 font-semibold">Weekly Progress</span>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Completed</span>
                <span>78%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="bg-white h-2 rounded-full transition-all duration-500" style={{width: '78%'}}></div>
              </div>
            </div>
            <p className="text-xs text-indigo-100">Great job! Keep it up!</p>
          </div>
        </div>
      </nav>
      
      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center p-3 rounded-xl hover:bg-white/80 transition-all duration-200 cursor-pointer group">
          <div className="relative">
            <div className="h-10 w-10 rounded-full border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-200 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
              {user?.firstName?.charAt(0) || 'U'}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-semibold text-gray-800">
              {user ? `${user.firstName} ${user.lastName}` : 'User'}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role || 'User'}
            </p>
          </div>
          <i className="fas fa-chevron-right text-gray-400 text-xs group-hover:text-gray-600 transition-colors duration-200"></i>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
