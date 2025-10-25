import React from 'react';

const ExternalLinks = ({ user }) => {
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
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center transition-all duration-200 shadow-lg hover:shadow-xl">
          <i className="fas fa-plus mr-2"></i>
          Add Link
        </button>
      </div>

      <div className="text-center py-12">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-link text-blue-600 text-3xl"></i>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">External Links Coming Soon</h3>
        <p className="text-gray-600">
          This feature is under development. You'll be able to save and organize external links here.
        </p>
      </div>
    </div>
  );
};

export default ExternalLinks;