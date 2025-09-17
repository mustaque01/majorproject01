import React, { useState, useEffect } from 'react';
import ApiService from '../services/ApiService';

const CategoriesList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Gradient configurations for each category
  const categoryGradients = {
    'Web Development': 'from-blue-500 to-cyan-500',
    'Data Science': 'from-green-500 to-emerald-500',
    'Mobile Development': 'from-purple-500 to-pink-500',
    'AI/ML': 'from-orange-500 to-red-500',
    'DevOps': 'from-indigo-500 to-purple-500',
    'UI/UX Design': 'from-pink-500 to-rose-500',
    'Database': 'from-teal-500 to-green-500',
    'Cloud Computing': 'from-sky-500 to-blue-500'
  };

  const difficultyLevels = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getCategories();
        
        if (response.success) {
          setCategories(response.data);
        }
      } catch (err) {
        setError('Failed to fetch categories');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Filter categories based on search and filter
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || category.difficulty === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Search and Filter Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
          <div className="sm:w-48">
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
        </div>
        
        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl mr-4"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded-full w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-100 to-red-50 border border-red-200 rounded-2xl p-6">
        <div className="flex items-center">
          <div className="bg-red-500 rounded-full p-3 mr-4">
            <i className="fas fa-exclamation-triangle text-white text-lg"></i>
          </div>
          <div>
            <h3 className="font-semibold text-red-800 text-lg">Unable to Load Categories</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="Search categories, technologies, or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
        
        {/* Filter Dropdown */}
        <div className="sm:w-48">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
          >
            {difficultyLevels.map(level => (
              <option key={level} value={level}>
                {level === 'all' ? 'All Levels' : level}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      {searchTerm && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600">
            Found <span className="font-semibold text-indigo-600">{filteredCategories.length}</span> categories
            {searchTerm && ` for "${searchTerm}"`}
          </p>
          {filteredCategories.length === 0 && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category, index) => {
          const gradient = categoryGradients[category.name] || 'from-gray-500 to-gray-600';
          
          return (
            <div 
              key={category.id} 
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:-translate-y-1 cursor-pointer relative overflow-hidden"
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                <div className={`w-full h-full bg-gradient-to-br ${gradient} rounded-full transform translate-x-8 -translate-y-8`}></div>
              </div>
              
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <i className={`${category.icon} text-white text-xl`}></i>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-gray-900">
                      {category.name}
                    </h3>
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                      {category.difficulty || 'Beginner'}
                    </span>
                  </div>
                </div>
                
                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {category.description}
                </p>
                
                {/* Footer */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="flex items-center text-gray-500 text-sm">
                    <i className="fas fa-book-open mr-1"></i>
                    <span>{Math.floor(Math.random() * 20) + 5} courses</span>
                  </div>
                  
                  <button className={`px-4 py-2 bg-gradient-to-r ${gradient} text-white rounded-full text-sm font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105`}>
                    Explore
                    <i className="fas fa-arrow-right ml-2"></i>
                  </button>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{Math.floor(Math.random() * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-gradient-to-r ${gradient} transition-all duration-1000`}
                      style={{
                        width: `${Math.floor(Math.random() * 100)}%`,
                        animation: `slideInProgress 1s ease-out ${index * 0.1}s both`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCategories.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-search text-gray-400 text-2xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No categories found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search terms or filter settings
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedFilter('all');
            }}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slideInProgress {
          from { width: 0%; }
          to { width: var(--progress-width); }
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default CategoriesList;
