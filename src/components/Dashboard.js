import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import StatsOverview from './StatsOverview';
import ProgressChart from './ProgressChart';
import CurrentFocus from './CurrentFocus';
import RecentResources from './RecentResources';
import CreateNewPath from './CreateNewPath';
import CategoriesList from './CategoriesList';

// Resource components
import PDFDocuments from './resources/PDFDocuments';
import VideoLectures from './resources/VideoLectures';
import ExternalLinks from './resources/ExternalLinks';
import MyNotes from './resources/MyNotes';

// New main menu components
import Achievements from './Achievements';
import MyLearningPaths from './MyLearningPaths';
import ProgressAnalytics from './ProgressAnalytics';
import CoinRewards from './CoinRewards';

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  // Render the appropriate view based on activeView
  const renderActiveView = () => {
    switch(activeView) {
      // Resource components
      case 'pdf':
        return <PDFDocuments user={user} />;
      case 'videos':
        return <VideoLectures user={user} />;
      case 'links':
        return <ExternalLinks user={user} />;
      case 'notes':
        return <MyNotes user={user} />;
      // New main menu components
      case 'achievements':
        return <Achievements />;
      case 'learning-paths':
        return <MyLearningPaths />;
      case 'progress':
        return <ProgressAnalytics />;
      case 'rewards':
        return <CoinRewards />;
      case 'dashboard':
      default:
        return renderDashboardContent();
    }
  };

  const renderDashboardContent = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Welcome back, {user?.firstName || 'User'}! 👋
            </h1>
            <p className="text-gray-600">
              {user?.role === 'student' 
                ? 'Continue your learning journey. You\'re doing great!' 
                : 'Ready to inspire minds? Your students are waiting!'
              }
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="bg-white rounded-2xl px-6 py-3 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.role === 'student' ? 'Student Portal' : 'Instructor Dashboard'}
                </span>
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
        <StatsOverview user={user} />
      </section>
      
      {/* Rewards Section - Students Only */}
      {user?.role === 'student' && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Rewards & Progress</h2>
              <p className="text-gray-600 mt-1">Track your coin earnings and recent achievements</p>
            </div>
            <button 
              onClick={() => setActiveView('rewards')}
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center"
            >
              View All Rewards
              <i className="fas fa-external-link-alt ml-2"></i>
            </button>
          </div>
          <CoinRewards />
        </section>
      )}
      
      {/* Learning Categories */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {user?.role === 'student' ? 'Learning Categories' : 'Course Categories'}
            </h2>
            <p className="text-gray-600 mt-1">
              {user?.role === 'student' 
                ? 'Explore different learning paths and skill areas'
                : 'Manage and create courses in different categories'
              }
            </p>
          </div>
          {user?.role === 'instructor' && (
            <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center">
              <i className="fas fa-plus mr-2"></i>
              New Course
            </button>
          )}
        </div>
        <CategoriesList user={user} />
      </section>
      
      {/* Dashboard Widgets */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {user?.role === 'student' ? 'Learning Dashboard' : 'Teaching Dashboard'}
          </h2>
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
            <ProgressChart user={user} />
          </div>
          
          {/* Current Focus */}
          <div className="lg:col-span-1 xl:col-span-1">
            <CurrentFocus user={user} />
          </div>
          
          {/* Recent Resources */}
          <div className="lg:col-span-1 xl:col-span-1">
            <RecentResources user={user} />
          </div>
        </div>
        
        {/* Create New Path - Full width */}
        <div className="mt-6">
          <CreateNewPath user={user} />
        </div>
      </section>

      {/* Quick Actions Footer */}
      <section className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {user?.role === 'student' 
              ? 'Ready to accelerate your learning?' 
              : 'Ready to enhance your teaching?'
            }
          </h3>
          <p className="text-gray-600">
            {user?.role === 'student'
              ? 'Access powerful tools and resources to enhance your learning experience'
              : 'Use powerful tools to create engaging content and track student progress'
            }
          </p>
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
          <button 
            onClick={() => setActiveView('pdf')}
            className="bg-white text-orange-600 px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-orange-200 hover:border-orange-300 flex items-center">
            <i className={`fas ${user?.role === 'student' ? 'fa-lightbulb' : 'fa-chalkboard-teacher'} mr-2`}></i>
            {user?.role === 'student' ? 'Resources' : 'Course Builder'}
          </button>
        </div>
      </section>

      {/* Footer Space */}
      <div className="h-8"></div>
    </div>
  );

  return (
    <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      <Sidebar user={user} activeView={activeView} setActiveView={setActiveView} />
      
      <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen">
        <Header 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          user={user}
          onLogout={handleLogout}
        />
        
        <main className="p-8 space-y-8">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
