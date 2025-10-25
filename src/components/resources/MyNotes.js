import React, { useState, useEffect } from 'react';

const MyNotes = ({ user }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  // Form states
  const [noteData, setNoteData] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: []
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch('http://localhost:5000/api/resources/note', {
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
        setNotes(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch notes');
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('accessToken');
      const method = editingNote ? 'PUT' : 'POST';
      const url = editingNote 
        ? `http://localhost:5000/api/resources/note/${editingNote._id}`
        : 'http://localhost:5000/api/resources/note';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(noteData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        await fetchNotes();
        setShowNoteModal(false);
        setEditingNote(null);
        setNoteData({
          title: '',
          content: '',
          category: 'general',
          tags: []
        });
        alert(editingNote ? 'Note updated successfully!' : 'Note created successfully!');
      } else {
        throw new Error(data.message || 'Failed to save note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note: ' + error.message);
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setNoteData({
      title: note.title,
      content: note.content,
      category: note.category,
      tags: note.tags || []
    });
    setShowNoteModal(true);
  };

  const handleNewNote = () => {
    setEditingNote(null);
    setNoteData({
      title: '',
      content: '',
      category: 'general',
      tags: []
    });
    setShowNoteModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <i className="fas fa-sticky-note text-orange-600 mr-3"></i>
            My Notes
          </h1>
          <p className="text-gray-600 mt-1">
            Create and manage your personal study notes
          </p>
        </div>
        <button 
          onClick={handleNewNote}
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl flex items-center transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <i className="fas fa-plus mr-2"></i>
          New Note
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-sticky-note text-orange-600 text-3xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No notes yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first note to get started
          </p>
          <button
            onClick={handleNewNote}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl"
          >
            <i className="fas fa-plus mr-2"></i>
            New Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div key={note._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">{note.title}</h3>
                  <button
                    onClick={() => handleEditNote(note)}
                    className="text-gray-400 hover:text-orange-600 transition-colors"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {note.content}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded capitalize">
                    {note.category}
                  </span>
                  <span>{formatDate(note.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingNote ? 'Edit Note' : 'New Note'}
              </h3>
              <button
                onClick={() => setShowNoteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSaveNote}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={noteData.title}
                  onChange={(e) => setNoteData({...noteData, title: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter note title"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={noteData.category}
                  onChange={(e) => setNoteData({...noteData, category: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="general">General</option>
                  <option value="programming">Programming</option>
                  <option value="design">Design</option>
                  <option value="business">Business</option>
                  <option value="personal">Personal</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={noteData.content}
                  onChange={(e) => setNoteData({...noteData, content: e.target.value})}
                  rows={10}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Write your note content here..."
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {editingNote ? 'Update Note' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyNotes;