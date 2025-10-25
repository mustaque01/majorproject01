import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../contexts/AuthContext';

const PDFDocuments = ({ user }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  useEffect(() => {
    fetchPDFDocuments();
  }, []);

  const fetchPDFDocuments = async () => {
    try {
      setLoading(true);
      
      // Get auth token from localStorage
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch('http://localhost:5000/api/resources/pdf', {
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
        setDocuments(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch PDF documents');
      }
    } catch (error) {
      console.error('Error fetching PDF documents:', error);
      // For now, show empty array if API fails
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'fileSize':
        return b.fileSize - a.fileSize;
      case 'lastAccessed':
        return new Date(b.lastAccessedAt) - new Date(a.lastAccessedAt);
      case 'createdAt':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setUploadTitle(file.name.replace('.pdf', ''));
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !uploadTitle.trim()) return;

    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      
      formData.append('file', selectedFile);
      formData.append('title', uploadTitle);
      formData.append('description', uploadDescription);
      formData.append('category', 'general');

      const response = await fetch('http://localhost:5000/api/resources/pdf', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Refresh the documents list
        await fetchPDFDocuments();
        
        setShowUploadModal(false);
        setSelectedFile(null);
        setUploadTitle('');
        setUploadDescription('');
        
        alert('PDF document uploaded successfully!');
      } else {
        throw new Error(data.message || 'Failed to upload PDF');
      }
    } catch (error) {
      console.error('Error uploading PDF:', error);
      alert('Failed to upload PDF: ' + error.message);
    }
  };

  const toggleFavorite = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`http://localhost:5000/api/resources/pdf/${id}/favorite`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Update local state
        setDocuments(docs => docs.map(doc => 
          doc._id === id ? { ...doc, isFavorite: !doc.isFavorite } : doc
        ));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const markAsCompleted = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`http://localhost:5000/api/resources/pdf/${id}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Update local state
        setDocuments(docs => docs.map(doc => 
          doc._id === id ? { ...doc, isCompleted: !doc.isCompleted } : doc
        ));
      }
    } catch (error) {
      console.error('Error marking as completed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PDF documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <i className="fas fa-file-pdf text-red-600 mr-3"></i>
            PDF Documents
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and access your PDF learning materials
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl flex items-center transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <i className="fas fa-upload mr-2"></i>
          Upload PDF
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <i className="fas fa-file-pdf text-red-600"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total PDFs</p>
              <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <i className="fas fa-check-circle text-green-600"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {documents.filter(doc => doc.isCompleted).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <i className="fas fa-heart text-yellow-600"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Favorites</p>
              <p className="text-2xl font-bold text-gray-900">
                {documents.filter(doc => doc.isFavorite).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <i className="fas fa-download text-blue-600"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Size</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatFileSize(documents.reduce((sum, doc) => sum + doc.fileSize, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="programming">Programming</option>
              <option value="general">General</option>
              <option value="design">Design</option>
              <option value="business">Business</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="createdAt">Latest</option>
              <option value="title">Name</option>
              <option value="fileSize">Size</option>
              <option value="lastAccessed">Last Accessed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedDocuments.map((doc) => (
          <div key={doc._id || doc.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-file-pdf text-red-600 text-xl"></i>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleFavorite(doc._id || doc.id)}
                    className={`p-1 rounded-full transition-colors ${
                      doc.isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                    }`}
                  >
                    <i className={`fas fa-heart text-sm`}></i>
                  </button>
                  <button
                    onClick={() => markAsCompleted(doc._id || doc.id)}
                    className={`p-1 rounded-full transition-colors ${
                      doc.isCompleted ? 'text-green-500' : 'text-gray-400 hover:text-green-500'
                    }`}
                  >
                    <i className="fas fa-check-circle text-sm"></i>
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {doc.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {doc.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    {tag}
                  </span>
                ))}
                {doc.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    +{doc.tags.length - 3}
                  </span>
                )}
              </div>

              {/* Progress */}
              {doc.isCompleted && (
                <div className="mb-4">
                  <div className="flex items-center text-sm text-green-600 mb-1">
                    <i className="fas fa-check-circle mr-1"></i>
                    Completed
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>Accessed {doc.accessCount} times</span>
                <span>Added {formatDate(doc.createdAt)}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  <i className="fas fa-eye mr-1"></i>
                  View
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <i className="fas fa-download text-gray-600"></i>
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <i className="fas fa-ellipsis-v text-gray-600"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedDocuments.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-file-pdf text-gray-400 text-3xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No PDF documents found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery ? 'Try adjusting your search terms' : 'Upload your first PDF document to get started'}
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl"
          >
            <i className="fas fa-upload mr-2"></i>
            Upload PDF
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Upload PDF Document</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleUploadSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select PDF File
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter document title"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Describe the content of this document"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || !uploadTitle.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFDocuments;