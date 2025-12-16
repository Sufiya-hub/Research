// components/DashboardMain.jsx (Fixing Download URL Use)

'use client';

import React, { useState, useEffect } from 'react';
import FileRow from './FileRow';

const DashboardMain = ({
  filesData,
  setFilesData,
  uploading,
  uploadMessage,
  handleFileUpload,
  activeItem,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // --- Fetch and Handler Logic (Remains the same) ---
  const fetchFiles = async (viewName) => {
    /* ... (Same fetch logic) ... */
  };
  useEffect(() => {
    fetchFiles(activeItem);
  }, [activeItem]);

  // --- FIXED: Handle Double Click (Download/Open) ---
  const handleFileOpen = async (s3Key) => {
    console.log(`Requesting Pre-Signed URL for key: ${s3Key}`);

    try {
      // Call the mock backend endpoint
      const response = await fetch(`/api/v1/files/download?key=${s3Key}`, {
        method: 'GET',
      });

      if (response.ok) {
        const { downloadUrl } = await response.json();

        // --- CRITICAL FIX: Open the received URL ---
        if (downloadUrl) {
          window.open(downloadUrl, '_blank');
          // Add a confirmation for the user
          alert(`Opening file: ${s3Key}. Check your browser pop-up/new tab.`);
        } else {
          alert('Error: Backend did not provide a download URL.');
        }
      } else {
        alert(
          `Error: Could not securely generate file link. Status: ${response.status}`
        );
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('A network error occurred while trying to open the file.');
    }
  };
  // ---------------------------------------------------

  // --- Handle File Deletion (Remains the same and should work) ---
  const handleFileDelete = async (fileName, s3Key) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete "${fileName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    console.log(`Attempting to delete file: ${s3Key}`);

    try {
      const response = await fetch(`/api/v1/files/delete?key=${s3Key}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFilesData((prev) => prev.filter((file) => file.s3Key !== s3Key));
        alert(`File "${fileName}" deleted successfully!`);
      } else {
        const errorData = await response.json();
        alert(`Deletion failed: ${errorData.message || 'Server error.'}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('A network error occurred while deleting the file.');
    }
  };

  const displayTitle = activeItem === 'My Cloud' ? 'My Cloud' : activeItem;

  // --- The rest of the JSX (omitted for brevity) ---
  return (
    <main className="flex-1 p-8 overflow-y-auto bg-white">
      {/* Header, Upload Button, Search, Filters JSX (omitted) */}
      <div className="flex items-center justify-between space-x-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {displayTitle}
          <p className="text-sm font-medium text-gray-500 mt-1 flex items-center">
            <span className="text-gray-700">Root</span>
            <span className="mx-2 text-gray-400">&gt;</span>
            <span className="text-gray-900 font-semibold">Current Folder</span>
          </p>
        </h2>

        <input
          type="file"
          id="file-upload-input"
          onChange={handleFileUpload}
          disabled={uploading}
          className="hidden"
        />
        <label
          htmlFor="file-upload-input"
          className={`px-6 py-3 font-medium rounded-lg flex items-center shadow-lg transition-colors cursor-pointer ${
            uploading
              ? 'bg-gray-400 text-gray-700'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          Upload File
        </label>
      </div>

      {/* Search Bar and Filters (omitted) */}
      <div className="mb-8 p-4 bg-gray-50 rounded-xl shadow-inner border border-gray-100">
        {/* ... (Search and Filter JSX) ... */}
        <div className="flex items-center justify-between space-x-4 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Ask the Cloud..."
              className="w-full p-3 pl-12 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-green-500 focus:border-green-500 shadow-sm"
            />
            <svg
              className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 transform -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        <div className="flex space-x-2 border-t pt-3 border-gray-200">
          <span className="text-sm font-semibold text-gray-700 mr-2 self-center">
            Smart Filters:
          </span>
          {['AI Tags', 'Cold Tier', 'Urgent'].map((tag) => (
            <button
              key={tag}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors bg-white text-gray-700 border border-gray-300 hover:bg-gray-100`}
            >
              {tag}
            </button>
          ))}
        </div>
        {uploadMessage.text && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm bg-green-100 text-green-800 border border-green-400`}
          >
            {uploadMessage.text}
          </div>
        )}
      </div>

      {/* 3. File List (List Structure) */}
      <h3 className="text-lg font-semibold mb-2 text-gray-700">
        {filesData.length > 0 ? 'All Items' : 'Get Started'}
      </h3>

      {isLoading ? (
        <div className="text-center p-10 text-gray-500">Loading files...</div>
      ) : filesData.length === 0 ? (
        // --- EMPTY STATE UI (omitted for brevity) ---
        <div className="flex flex-col items-center justify-center p-20 bg-white border-2 border-dashed border-gray-300 rounded-xl">
          <svg
            className="w-16 h-16 text-green-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 014 4v2a4 4 0 01-4 4h-1"
            />
          </svg>
          <p className="text-xl font-semibold text-gray-700 mb-2">
            Your Smart Cloud is Empty
          </p>
          <p className="text-gray-500 mb-4">
            Upload your first file to begin using AI features like Semantic
            Search and Tiering.
          </p>
          <label
            htmlFor="file-upload-input"
            className="px-6 py-3 font-medium rounded-lg flex items-center shadow-lg transition-colors cursor-pointer bg-green-600 hover:bg-green-700 text-white"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            Upload First File
          </label>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          {/* List Header/Column Titles */}
          <div className="flex items-center justify-between p-3 bg-gray-100 text-gray-600 font-semibold text-sm rounded-t-lg">
            <span className="w-1/3 min-w-[200px]">Name</span>
            <span className="w-1/4">Status/Tags</span>
            <span className="w-16 text-right hidden sm:block">Size</span>
            <span className="w-24 text-right">Actions</span>
          </div>

          {/* File Rows */}
          <div className="divide-y divide-gray-100">
            {filesData.map((file, index) => (
              <FileRow
                key={file.s3Key || index}
                fileName={file.fileName}
                size={file.size}
                tags={file.tags}
                type={file.type}
                isUrgent={file.isUrgent}
                isShared={file.isShared}
                s3Key={file.s3Key}
                onDoubleClick={handleFileOpen}
                onDelete={handleFileDelete}
              />
            ))}
          </div>
        </div>
      )}
    </main>
  );
};

export default DashboardMain;
