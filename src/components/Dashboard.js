import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import StatsOverview from './StatsOverview';
import ProgressChart from './ProgressChart';
import CurrentFocus from './CurrentFocus';
import RecentResources from './RecentResources';
import CreateNewPath from './CreateNewPath';
import CategoriesList from './CategoriesList';

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      <Sidebar />
      
      <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen">
        <Header 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />
        
        <main className="p-8 space-y-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                  Welcome back, Alakh! 👋
                </h1>
                <p className="text-gray-600">
                  Continue your learning journey. You're doing great!
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="bg-white rounded-2xl px-6 py-3 shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700">System Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Performance Overview</h2>
              <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center">
                View Details
                <i className="fas fa-external-link-alt ml-2"></i>
              </button>
            </div>
            <StatsOverview />
          </section>
          
          {/* Learning Categories */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Learning Categories</h2>
                <p className="text-gray-600 mt-1">Explore different learning paths and skill areas</p>
              </div>
              <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center">
                <i className="fas fa-plus mr-2"></i>
                New Category
              </button>
            </div>
            <CategoriesList />
          </section>
          
          {/* Dashboard Widgets */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Learning Dashboard</h2>
              <div className="flex items-center space-x-3">
                <button className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200">
                  <i className="fas fa-refresh"></i>
                </button>
                <button className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200">
                  <i className="fas fa-expand"></i>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              {/* Progress Chart - Takes 2 columns on XL screens */}
              <div className="lg:col-span-1 xl:col-span-2">
                <ProgressChart />
              </div>
              
              {/* Current Focus */}
              <div className="lg:col-span-1 xl:col-span-1">
                <CurrentFocus />
              </div>
              
              {/* Recent Resources */}
              <div className="lg:col-span-1 xl:col-span-1">
                <RecentResources />
              </div>
            </div>
            
            {/* Create New Path - Full width */}
            <div className="mt-6">
              <CreateNewPath />
            </div>
          </section>

          {/* Quick Actions Footer */}
          <section className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Ready to accelerate your learning?</h3>
              <p className="text-gray-600">Access powerful tools and resources to enhance your learning experience</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-white text-indigo-600 px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-indigo-200 hover:border-indigo-300 flex items-center">
                <i className="fas fa-chart-line mr-2"></i>
                Analytics
              </button>
              <button className="bg-white text-purple-600 px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-purple-200 hover:border-purple-300 flex items-center">
                <i className="fas fa-calendar-alt mr-2"></i>
                Schedule
              </button>
              <button className="bg-white text-emerald-600 px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-emerald-200 hover:border-emerald-300 flex items-center">
                <i className="fas fa-users mr-2"></i>
                Community
              </button>
              <button className="bg-white text-orange-600 px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-orange-200 hover:border-orange-300 flex items-center">
                <i className="fas fa-lightbulb mr-2"></i>
                Resources
              </button>
            </div>
          </section>

          {/* Footer Space */}
          <div className="h-8"></div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
