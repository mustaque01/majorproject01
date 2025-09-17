import React, { useState, useEffect } from 'react';
import ApiService from '../services/ApiService';

const CategoriesList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => (
        <div 
          key={category.id} 
          className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
          style={{ borderLeft: `4px solid ${category.color}` }}
        >
          <div className="flex items-center mb-2">
            <i className={`${category.icon} text-xl mr-3`} style={{ color: category.color }}></i>
            <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
          </div>
          <p className="text-gray-600 text-sm">{category.description}</p>
        </div>
      ))}
    </div>
  );
};

export default CategoriesList;
