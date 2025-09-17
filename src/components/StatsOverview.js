import React, { useState, useEffect } from 'react';
import ApiService from '../services/ApiService';

const StatsOverview = () => {
  const [stats, setStats] = useState([
    {
      title: 'Total Learning Paths',
      value: '0',
      icon: 'fas fa-route',
      gradient: 'from-blue-500 to-indigo-600',
      shadowColor: 'shadow-blue-500/30',
      growth: '+12%',
      description: 'Active pathways'
    },
    {
      title: 'Completed Skills',
      value: '0',
      icon: 'fas fa-trophy',
      gradient: 'from-emerald-500 to-green-600',
      shadowColor: 'shadow-emerald-500/30',
      growth: '+8%',
      description: 'Skills mastered'
    },
    {
      title: 'Study Hours',
      value: '0',
      icon: 'fas fa-clock',
      gradient: 'from-amber-500 to-orange-600',
      shadowColor: 'shadow-amber-500/30',
      growth: '+15%',
      description: 'This month'
    },
    {
      title: 'Resources',
      value: '0',
      icon: 'fas fa-layer-group',
      gradient: 'from-purple-500 to-pink-600',
      shadowColor: 'shadow-purple-500/30',
      growth: '+23%',
      description: 'Available content'
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
              icon: 'fas fa-route',
              gradient: 'from-blue-500 to-indigo-600',
              shadowColor: 'shadow-blue-500/30',
              growth: '+12%',
              description: 'Active pathways'
            },
            {
              title: 'Completed Skills',
              value: data.completedSkills.toString(),
              icon: 'fas fa-trophy',
              gradient: 'from-emerald-500 to-green-600',
              shadowColor: 'shadow-emerald-500/30',
              growth: '+8%',
              description: 'Skills mastered'
            },
            {
              title: 'Study Hours',
              value: data.totalHours,
              icon: 'fas fa-clock',
              gradient: 'from-amber-500 to-orange-600',
              shadowColor: 'shadow-amber-500/30',
              growth: '+15%',
              description: 'This month'
            },
            {
              title: 'Resources',
              value: data.resources.toString(),
              icon: 'fas fa-layer-group',
              gradient: 'from-purple-500 to-pink-600',
              shadowColor: 'shadow-purple-500/30',
              growth: '+23%',
              description: 'Available content'
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="w-16 h-16 bg-gray-200 rounded-2xl"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="h-3 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-8"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="col-span-4 bg-gradient-to-r from-red-100 to-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center">
            <div className="bg-red-500 rounded-full p-2 mr-3">
              <i className="fas fa-exclamation-triangle text-white"></i>
            </div>
            <div>
              <h3 className="font-semibold text-red-800">Unable to Load Statistics</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 hover:-translate-y-1 border border-gray-100 relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
            <div className={`w-full h-full bg-gradient-to-br ${stat.gradient} rounded-full transform translate-x-8 -translate-y-8`}></div>
          </div>
          
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-800 mb-1 group-hover:text-gray-900 transition-colors duration-200">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-400">{stat.description}</p>
              </div>
              
              {/* Icon */}
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.shadowColor} group-hover:scale-110 transition-transform duration-300`}>
                <i className={`${stat.icon} text-white text-xl`}></i>
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center text-green-600">
                <i className="fas fa-arrow-up text-xs mr-1"></i>
                <span className="text-sm font-semibold">{stat.growth}</span>
              </div>
              <span className="text-xs text-gray-400">vs last month</span>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3">
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full bg-gradient-to-r ${stat.gradient} transition-all duration-1000 delay-${index * 200}`}
                  style={{
                    width: `${Math.min(parseInt(stat.value) * 10, 100)}%`,
                    animation: `slideIn 1s ease-out ${index * 0.2}s both`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {/* Custom CSS Animation */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            width: 0%;
          }
          to {
            width: ${Math.min(parseInt(stats[0]?.value || '0') * 10, 100)}%;
          }
        }
      `}</style>
    </div>
  );
};

export default StatsOverview;
