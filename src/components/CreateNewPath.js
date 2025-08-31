import React, { useState } from 'react';

const CreateNewPath = () => {
  const [formData, setFormData] = useState({
    pathName: '',
    description: '',
    resources: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      resources: e.target.files
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission logic here
    alert('Learning Path Created Successfully!');
    setFormData({
      pathName: '',
      description: '',
      resources: null
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 lg:col-span-3">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Learning Path</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="pathName" className="block text-sm font-medium text-gray-700 mb-1">
              Path Name
            </label>
            <input 
              type="text" 
              id="pathName"
              name="pathName"
              value={formData.pathName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
              placeholder="Enter path name" 
              required 
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea 
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
              rows="3" 
              placeholder="Enter a brief description" 
              required
            ></textarea>
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="resources" className="block text-sm font-medium text-gray-700 mb-1">
            Add Resources
          </label>
          <input 
            type="file" 
            id="resources"
            name="resources"
            onChange={handleFileChange}
            className="w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
            multiple 
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200"
        >
          Create Learning Path
        </button>
      </form>
    </div>
  );
};

export default CreateNewPath;
