import React, { useState, useEffect } from 'react';

const ExternalLinks = ({ user }) => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [newLink, setNewLink] = useState({
    title: '',
    url: '',
    description: '',
    category: 'general'
  });

  useEffect(() => {
    fetchExternalLinks();
  }, []);

  const fetchExternalLinks = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch('http://localhost:5000/api/resources/link', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setLinks(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch external links');
      }
    } catch (error) {
      console.error('Error fetching external links:', error);
      setLinks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch('http://localhost:5000/api/resources/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newLink)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        await fetchExternalLinks();
        setShowAddModal(false);
        setNewLink({
          title: '',
          url: '',
          description: '',
          category: 'general'
        });
        alert('External link added successfully!');
      } else {
        throw new Error(data.message || 'Failed to add link');
      }
    } catch (error) {
      console.error('Error adding link:', error);
      alert('Failed to add link: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading external links...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <i className="fas fa-link text-blue-600 mr-3"></i>
            External Links
          </h1>
          <p className="text-gray-600 mt-1">
            Bookmark and organize useful external resources
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <i className="fas fa-plus mr-2"></i>
          Add Link
        </button>
      </div>

      {links.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-link text-blue-600 text-3xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No external links yet</h3>
          <p className="text-gray-600 mb-6">
            Add your first external link to get started
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
          >
            <i className="fas fa-plus mr-2"></i>
            Add Link
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {links.map((link) => (
            <div key={link._id || link.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{link.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{link.description}</p>
                <button 
                  onClick={() => window.open(link.url, '_blank')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Visit Link
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Link Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add External Link</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleAddLink}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newLink.title}
                  onChange={(e) => setNewLink({...newLink, title: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter link title"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL
                </label>
                <input
                  type="url"
                  value={newLink.url}
                  onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newLink.description}
                  onChange={(e) => setNewLink({...newLink, description: e.target.value})}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe this resource"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Add Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExternalLinks;