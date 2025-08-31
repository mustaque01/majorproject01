import React from 'react';

const Header = ({ searchQuery, setSearchQuery }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <button className="mr-4 text-gray-500 focus:outline-none lg:hidden">
            <i className="fas fa-bars"></i>
          </button>
          <h2 className="text-xl font-semibold text-gray-800">Learning Dashboard</h2>
        </div>
        
        <div className="flex items-center">
          <div className="relative mr-4">
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
          </div>
          <button className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none">
            <i className="fas fa-bell"></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
