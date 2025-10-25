import React, { useState, useEffect } from 'react';

const VideoLectures = ({ user }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');

  // Form states
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    url: '',
    duration: '',
    category: 'programming'
  });

  useEffect(() => {
    fetchVideoLectures();
  }, []);

  const fetchVideoLectures = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch('http://localhost:5000/api/resources/video', {
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
        setVideos(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch video lectures');
      }
    } catch (error) {
      console.error('Error fetching video lectures:', error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch('http://localhost:5000/api/resources/video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newVideo)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        await fetchVideoLectures();
        setShowAddModal(false);
        setNewVideo({
          title: '',
          description: '',
          url: '',
          duration: '',
          category: 'programming'
        });
        alert('Video lecture added successfully!');
      } else {
        throw new Error(data.message || 'Failed to add video');
      }
    } catch (error) {
      console.error('Error adding video:', error);
      alert('Failed to add video: ' + error.message);
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    return duration;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || video.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const sortedVideos = [...filteredVideos].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'duration':
        return (a.duration || '').localeCompare(b.duration || '');
      case 'createdAt':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading video lectures...</p>
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
            <i className="fas fa-video text-purple-600 mr-3"></i>
            Video Lectures
          </h1>
          <p className="text-gray-600 mt-1">
            Access and organize your video learning content
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl flex items-center transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <i className="fas fa-plus mr-2"></i>
          Add Video
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <i className="fas fa-video text-purple-600"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Videos</p>
              <p className="text-2xl font-bold text-gray-900">{videos.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <i className="fas fa-check-circle text-green-600"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Watched</p>
              <p className="text-2xl font-bold text-gray-900">
                {videos.filter(video => video.isCompleted).length}
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
                {videos.filter(video => video.isFavorite).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <i className="fas fa-play text-blue-600"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(videos.map(video => video.category)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="programming">Programming</option>
              <option value="design">Design</option>
              <option value="business">Business</option>
              <option value="general">General</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="createdAt">Latest</option>
              <option value="title">Title</option>
              <option value="duration">Duration</option>
            </select>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedVideos.map((video) => (
          <div key={video._id || video.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              <i className="fas fa-play-circle text-6xl text-purple-600"></i>
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">
                  {video.title}
                </h3>
                <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-xs font-medium">
                  {formatDuration(video.duration)}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {video.description}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span className="bg-gray-100 px-2 py-1 rounded capitalize">
                  {video.category}
                </span>
                <span>Added {formatDate(video.createdAt)}</span>
              </div>

              <div className="flex items-center space-x-2">
                <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  <i className="fas fa-play mr-1"></i>
                  Watch
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <i className="fas fa-heart text-gray-600"></i>
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <i className="fas fa-ellipsis-v text-gray-600"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedVideos.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-video text-purple-600 text-3xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No video lectures found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery ? 'Try adjusting your search terms' : 'Add your first video lecture to get started'}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl"
          >
            <i className="fas fa-plus mr-2"></i>
            Add Video
          </button>
        </div>
      )}

      {/* Add Video Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add Video Lecture</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleAddVideo}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo({...newVideo, title: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter video title"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video URL
                </label>
                <input
                  type="url"
                  value={newVideo.url}
                  onChange={(e) => setNewVideo({...newVideo, url: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://example.com/video"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  value={newVideo.duration}
                  onChange={(e) => setNewVideo({...newVideo, duration: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., 45:30"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={newVideo.category}
                  onChange={(e) => setNewVideo({...newVideo, category: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="programming">Programming</option>
                  <option value="design">Design</option>
                  <option value="business">Business</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newVideo.description}
                  onChange={(e) => setNewVideo({...newVideo, description: e.target.value})}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe the video content"
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
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Add Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoLectures;